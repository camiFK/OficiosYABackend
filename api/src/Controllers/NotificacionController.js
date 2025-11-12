const { Notificacion, SolicitudServicio } = require('../Models/Index');
const { Op } = require('sequelize');
const ResponseService = require('../Services/ResponseService');

module.exports = {
    // GET /api/notificaciones: Lista las notificaciones del usuario autenticado
    async getNotificaciones(req, res) {
        try {
            const notificaciones = await Notificacion.findAll({
                where: { id_usuario_destino: req.userId },
                order: [['fecha_envio', 'DESC']],
                include: [
                    {
                        model: SolicitudServicio,
                        as: 'solicitud',
                        required: false
                    }
                ]
            });

            return ResponseService.success(res, notificaciones, 'Notificaciones obtenidas exitosamente');
        } catch (error) {
            console.error('Error en getNotificaciones:', error);
            return ResponseService.error(res, 'Error al obtener notificaciones.');
        }
    },

    // PUT /api/notificaciones/:id/marcar-leida: Marca una notificación como leída
    async marcarLeida(req, res) {
        try {
            const { id } = req.params;

            const notificacion = await Notificacion.findOne({
                where: {
                    id_notificacion: id,
                    id_usuario_destino: req.userId
                }
            });

            if (!notificacion) {
                return ResponseService.notFound(res, 'Notificación');
            }

            await notificacion.update({ estado: 'leida' });

            return ResponseService.updated(res, notificacion, 'Notificación marcada como leída');
        } catch (error) {
            console.error('Error en marcarLeida:', error);
            return ResponseService.error(res, 'Error al marcar notificación como leída.');
        }
    },

    // PUT /api/notificaciones/marcar-todas-leidas: Marca todas las notificaciones del usuario como leídas
    async marcarTodasLeidas(req, res) {
        try {
            const [affectedRows] = await Notificacion.update(
                { estado: 'leida' },
                {
                    where: {
                        id_usuario_destino: req.userId,
                        estado: { [Op.ne]: 'leida' }
                    }
                }
            );

            return ResponseService.updated(res, { affectedRows }, `${affectedRows} notificaciones marcadas como leídas`);
        } catch (error) {
            console.error('Error en marcarTodasLeidas:', error);
            return ResponseService.error(res, 'Error al marcar todas las notificaciones como leídas.');
        }
    },

    // DELETE /api/notificaciones/:id: Elimina una notificación del sistema
    async deleteNotificacion(req, res) {
        try {
            const { id } = req.params;

            const notificacion = await Notificacion.findOne({
                where: {
                    id_notificacion: id,
                    id_usuario_destino: req.userId
                }
            });

            if (!notificacion) {
                return ResponseService.notFound(res, 'Notificación');
            }

            await notificacion.destroy();

            return ResponseService.deleted(res, 'Notificación eliminada exitosamente');
        } catch (error) {
            console.error('Error en eliminarNotificacion:', error);
            return ResponseService.error(res, 'Error al eliminar notificación.');
        }
    },

    // NOTA: Implementar notificaciones automáticas en otros controladores
    /*
    Los siguientes controladores necesitan implementar notificaciones automáticas:

    1. SOLICITUD_SERVICIO_CONTROLLER.JS (no existe aún):
       - crearSolicitud(): Notificar a prestadores de la categoría cuando se crea solicitud

    2. PRESUPUESTO_CONTROLLER.JS (no existe aún):
       - enviarPresupuesto(): Notificar al cliente cuando prestador envía presupuesto
       - aceptarPresupuesto(): Notificar al prestador cuando cliente acepta presupuesto

    3. SOLICITUD_SERVICIO_CONTROLLER.JS:
       - cambiarEstadoSolicitud(): Notificar partes involucradas cuando cambia estado

    4. CALIFICACION_CONTROLLER.JS: IMPLEMENTADO
       - crearCalificacion(): Notificar al prestador cuando recibe calificación

    Para implementar:
    - Importar: const { Notificacion } = require('../Models/Index');
    - Usar función helper: await createAutomaticNotification(idUsuario, 'in-app', mensaje, idSolicitud);
    - Para emails: await EmailService.sendNotificationEmail(email, subject, message);
    */
};
