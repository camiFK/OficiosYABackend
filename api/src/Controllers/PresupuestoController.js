const { Presupuesto, SolicitudPrestador, SolicitudServicio, Prestador, Notificacion, Cliente } = require('../Models/Index');
const { createAutomaticNotification } = require('../Utils/notificationUtil');

module.exports = {
    // GET /presupuestos/:id - Obtener un presupuesto por ID
    async getPresupuestoById(req, res) {
        try {
            const presupuesto = await Presupuesto.findByPk(req.params.id);
            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }
            return res.status(200).json(presupuesto);
        } catch (error) {
            console.error('Error al obtener el presupuesto:', error);
            return res.status(500).json({ error: 'Error al obtener el presupuesto' });
        }
    },

    async getSolicitudesByPrestadorId(req, res) {
        try {
            const solicitudes = await SolicitudPrestador.findAll({
                where: { id_prestador: req.params.id }
            });
            return res.status(200).json(solicitudes);
        } catch (error) {
            console.error('Error al obtener las solicitudes del prestador:', error);
            return res.status(500).json({ error: 'Error al obtener las solicitudes del prestador' });
        }
    },

    async getSolicitudesRecibidas(req, res) {
        try {
            const solicitudes = await SolicitudPrestador.findAll({
                where: { id_prestador: req.params.id, estado: 'Pendiente' }
            });
            return res.status(200).json(solicitudes);
        } catch (error) {
            console.error('Error al obtener las solicitudes pendientes:', error);
            return res.status(500).json({ error: 'Error al obtener las solicitudes pendientes' });
        }
    },

    // POST /presupuestos - Enviar presupuesto desde PanelPrestador
    async sendPresupuesto(req, res) {
        try {

            let { id_solicitud, monto, plazo_dias, mensaje } = req.body;

            let id_prestador = req.user.id_prestador || null;
            if (!id_prestador) {
                const id_usuario = req.userId || (req.user && req.user.id_usuario) || null;
                if (!id_usuario) {
                    return res.status(403).json({ error: 'No se pudo determinar el usuario autenticado' });
                }

                const prestadorRecord = await Prestador.findOne({ where: { id_usuario } });
                if (!prestadorRecord) {
                    return res.status(403).json({ error: 'No se encontró prestador asociado al usuario autenticado' });
                }
                id_prestador = prestadorRecord.id_prestador;
            }

            if (!id_solicitud || monto == null || plazo_dias == null) {
                return res
                    .status(400)
                    .json({ error: 'Faltan datos obligatorios (id_solicitud, monto, plazo_dias)' });
            }

            console.log('Verificando solicitud prestador para id recibido:', id_solicitud, 'y id_prestador:', id_prestador);


            let solicitudPrestador = await SolicitudPrestador.findOne({ where: { id_solicitud, id_prestador } });


            if (!solicitudPrestador) {
                const posibleSp = await SolicitudPrestador.findByPk(id_solicitud);
                if (posibleSp && posibleSp.id_prestador === id_prestador) {

                    solicitudPrestador = posibleSp;
                    id_solicitud = posibleSp.id_solicitud; 
                    console.log('Interpretado id como id_solicitud_prestador. id_solicitud real:', id_solicitud);
                }
            }

            if (!solicitudPrestador) {
                return res.status(404).json({ error: 'Solicitud no encontrada para este prestador' });
            }

            // Crear el presupuesto
            const nuevoPresupuesto = await Presupuesto.create({
                id_solicitud,
                id_prestador,
                monto,
                plazo_dias,
                mensaje: mensaje || null,
                estado: 'Enviado' 
            });


            solicitudPrestador.estado = 'Enviado';
            await solicitudPrestador.save();

            // Actualizar estado de la solicitud de servicio a 'Cotizada'
            try {
                const solicitudServicio = await SolicitudServicio.findByPk(id_solicitud);
                if (solicitudServicio) {
                    solicitudServicio.estado = 'Cotizada';
                    await solicitudServicio.save();

                    // Crear notificación para el cliente indicando que recibió un presupuesto
                    try {
                        const mensaje = `Has recibido un nuevo presupuesto para tu solicitud.`;
                        // obtener id_usuario del cliente asociado a la solicitud
                        let idUsuarioDestino = null;
                        if (solicitudServicio.id_cliente) {
                            const clienteRecord = await Cliente.findByPk(solicitudServicio.id_cliente);
                            idUsuarioDestino = clienteRecord?.id_usuario || null;
                        }

                        if (idUsuarioDestino) {
                            const created = await createAutomaticNotification(idUsuarioDestino, 'in-app', mensaje, id_solicitud);
                            if (!created) {
                                // Fallback: crear notificación directamente si el util falló silenciosamente
                                try {
                                    const direct = await Notificacion.create({
                                        id_usuario_destino: idUsuarioDestino,
                                        tipo: 'in-app',
                                        mensaje,
                                        estado: 'pendiente',
                                        fecha_envio: new Date(),
                                        id_solicitud: id_solicitud
                                    });
                                    console.log('Notificación creada por fallback:', direct.id_notificacion);
                                } catch (directErr) {
                                    console.error('Error creando notificación por fallback:', directErr);
                                }
                            } else {
                                console.log('Notificación creada correctamente (util) para cliente usuario:', idUsuarioDestino);
                            }
                        } else {
                            console.warn('No se encontró id_usuario para el cliente asociado; no se creó notificación');
                        }
                    } catch (notifErr) {
                        console.warn('Error creando notificación por nuevo presupuesto:', notifErr);
                    }
                }
            } catch (err) {
                console.error('Error al actualizar estado de SolicitudServicio:', err);

            }

            return res.status(201).json({
                success: true,
                message: 'Presupuesto enviado correctamente',
                data: {
                    presupuesto: nuevoPresupuesto,
                    solicitud_prestador: solicitudPrestador
                }
            });
        } catch (error) {
            console.error('Error al enviar presupuesto:', error);
            return res.status(500).json({ error: 'Error al enviar el presupuesto' });
        }
    },

    // GET /presupuestos/cliente - Obtener todos los presupuestos de un cliente
    async getAllPresupuestosByCliente(req, res) {
        try {
            
            const { id_usuario } = req.body || {};

            if (!id_usuario) {
                return res
                    .status(400)
                    .json({ error: 'id_usuario es obligatorio para obtener los presupuestos' });
            }

            const presupuestos = await Presupuesto.findAll({
                include: [{
                    model: SolicitudServicio,
                    as: 'solicitud',
                    where: { id_cliente: id_usuario },
                    attributes: []
                }]
            });

            return res.status(200).json(presupuestos);
        } catch (error) {
            console.error('Error al obtener los presupuestos del usuario:', error);
            return res.status(500).json({ error: 'Error al obtener los presupuestos del usuario' });
        }
    }
};