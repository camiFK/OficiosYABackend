const { Calificacion, Cliente, Prestador, SolicitudServicio, SolicitudPrestador, Presupuesto, Notificacion, Usuario } = require('../Models/Index');
const { Op, fn, col } = require('sequelize');
const ResponseService = require('../Services/ResponseService');
const EmailService = require('../Services/EmailService');

// Función helper para crear notificaciones automáticas
async function createAutomaticNotification(idUsuarioDestino, tipo, mensaje, idSolicitud = null) {
    try {
        const notificacion = await Notificacion.create({
            id_usuario_destino: idUsuarioDestino,
            tipo: tipo,
            mensaje: mensaje,
            estado: 'pendiente',
            fecha_envio: new Date(),
            id_solicitud: idSolicitud
        });

        console.log(`Notificación automática creada: ${mensaje}`);
        return notificacion;
    } catch (error) {
        console.error('Error creando notificación automática:', error);
        // No lanzamos error para no interrumpir el flujo principal
    }
}

module.exports = {
    // POST /api/calificaciones: Registra la calificación de un prestador
    async crearCalificacion(req, res) {
        try {
            const { estrellas, comentario, id_solicitud, id_prestador } = req.body;

            // Validaciones
            const validationErrors = [];

            if (!estrellas || estrellas < 1 || estrellas > 5) {
                validationErrors.push({
                    field: 'estrellas',
                    message: 'Las estrellas deben estar entre 1 y 5'
                });
            }

            if (!id_solicitud) {
                validationErrors.push({
                    field: 'id_solicitud',
                    message: 'El ID de la solicitud es requerido'
                });
            }

            if (!id_prestador) {
                validationErrors.push({
                    field: 'id_prestador',
                    message: 'El ID del prestador es requerido'
                });
            }

            if (comentario && comentario.length > 500) {
                validationErrors.push({
                    field: 'comentario',
                    message: 'El comentario no puede exceder 500 caracteres'
                });
            }

            if (validationErrors.length > 0) {
                return ResponseService.validationError(res, validationErrors);
            }

            // Verificar que el usuario sea cliente
            const cliente = await Cliente.findOne({
                where: { id_usuario: req.userId }
            });

            if (!cliente) {
                return ResponseService.forbidden(res, 'Solo los clientes pueden calificar');
            }

            // Verificar que la solicitud existe y pertenece al cliente
            const solicitud = await SolicitudServicio.findOne({
                where: {
                    id_solicitud_servicio: id_solicitud,
                    id_cliente: cliente.id_cliente
                }
            });

            if (!solicitud) {
                return ResponseService.notFound(res, 'Solicitud');
            }

            // Verificar que la solicitud esté cerrada (estado "Cerrada")
            if (solicitud.estado !== 'Cerrada') {
                return ResponseService.error(res, 'Solo se puede calificar solicitudes cerradas', 400);
            }

            // Verificar que haya al menos un presupuesto aceptado para esta solicitud
            const presupuestoAceptado = await Presupuesto.findOne({
                where: {
                    id_solicitud: id_solicitud,
                    estado: 'aceptado'
                }
            });

            if (!presupuestoAceptado) {
                return ResponseService.error(res, 'No se puede calificar una solicitud sin presupuesto aceptado', 400);
            }

            // Verificar que el prestador existe
            const prestador = await Prestador.findByPk(id_prestador);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Verificar que no exista ya una calificación para esta solicitud
            const calificacionExistente = await Calificacion.findOne({
                where: { id_solicitud: id_solicitud }
            });

            if (calificacionExistente) {
                return ResponseService.conflict(res, 'Ya existe una calificación para esta solicitud');
            }

            // Crear la calificación
            const nuevaCalificacion = await Calificacion.create({
                estrellas: parseInt(estrellas),
                comentario: comentario ? comentario.trim() : null,
                fecha_creacion: new Date(),
                id_cliente: cliente.id_cliente,
                id_prestador: id_prestador,
                id_solicitud: id_solicitud
            });

            // Notificacion automatica: Notificar al prestador que recibió una calificación
            await createAutomaticNotification(
                prestador.id_usuario,
                'in-app',
                `Has recibido una calificación de ${estrellas} estrella(s) de ${cliente.nombre_completo} por el servicio "${solicitud.titulo}"`,
                id_solicitud
            );

            // EMAIL: Enviar notificación por email al prestador
            const prestadorUsuario = await Usuario.findByPk(prestador.id_usuario);
            if (prestadorUsuario) {
                await EmailService.sendRatingReceivedNotification(
                    prestadorUsuario.correo,
                    prestador.nombre_completo,
                    cliente.nombre_completo,
                    estrellas,
                    solicitud.titulo
                );
            }

            // Obtener la calificación con relaciones
            const calificacionCompleta = await Calificacion.findByPk(nuevaCalificacion.id_calificacion, {
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['id_cliente', 'nombre_completo']
                    },
                    {
                        model: Prestador,
                        as: 'prestador',
                        attributes: ['id_prestador', 'nombre_completo']
                    },
                    {
                        model: SolicitudServicio,
                        as: 'solicitud',
                        attributes: ['id_solicitud_servicio', 'titulo']
                    }
                ]
            });

            return ResponseService.created(res, calificacionCompleta, 'Calificación registrada exitosamente');

        } catch (error) {
            console.error('Error en crearCalificacion:', error);
            return ResponseService.error(res, 'Error al registrar la calificación.');
        }
    },

    // GET /api/calificaciones/prestador/:id: Devuelve todas las calificaciones de un prestador
    async getCalificacionesByPrestador(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const offset = (pageNum - 1) * limitNum;

            // Verificar que el prestador existe
            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            const result = await Calificacion.findAndCountAll({
                where: { id_prestador: id },
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['id_cliente', 'nombre_completo']
                    },
                    {
                        model: SolicitudServicio,
                        as: 'solicitud',
                        attributes: ['id_solicitud_servicio', 'titulo', 'fecha_creacion']
                    }
                ],
                order: [['fecha_creacion', 'DESC']],
                limit: limitNum,
                offset
            });

            return ResponseService.paginated(res, result.rows, {
                page: pageNum,
                limit: limitNum,
                total: result.count
            }, 'Calificaciones obtenidas exitosamente');

        } catch (error) {
            console.error('Error en getCalificacionesByPrestador:', error);
            return ResponseService.error(res, 'Error al obtener calificaciones.');
        }
    },

    // GET /api/prestadores/:id/promedio-calificaciones: Calcula el promedio de calificaciones
    async getPromedioCalificaciones(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el prestador existe
            const prestador = await Prestador.findByPk(id);
            if (!prestador) {
                return ResponseService.notFound(res, 'Prestador');
            }

            // Calcular promedio y contar calificaciones
            const resultado = await Calificacion.findAll({
                where: { id_prestador: id },
                attributes: [
                    [fn('AVG', col('estrellas')), 'promedio'],
                    [fn('COUNT', col('id_calificacion')), 'total_calificaciones']
                ],
                raw: true
            });

            const promedio = resultado[0].promedio ? parseFloat(resultado[0].promedio).toFixed(1) : 0;
            const totalCalificaciones = parseInt(resultado[0].total_calificaciones);

            return ResponseService.success(res, {
                id_prestador: id,
                promedio_calificaciones: parseFloat(promedio),
                total_calificaciones: totalCalificaciones
            }, 'Promedio de calificaciones obtenido exitosamente');

        } catch (error) {
            console.error('Error en getPromedioCalificaciones:', error);
            return ResponseService.error(res, 'Error al calcular el promedio de calificaciones.');
        }
    }
};