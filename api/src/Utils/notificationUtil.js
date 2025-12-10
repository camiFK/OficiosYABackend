const { Notificacion } = require('../Models/Index');

async function createAutomaticNotification(idUsuarioDestino, tipo, mensaje, idSolicitud = null) {
    try {
        const notificacion = await Notificacion.create({
            id_usuario_destino: idUsuarioDestino,
            tipo: tipo || 'in-app',
            mensaje: mensaje,
            estado: 'pendiente',
            fecha_envio: new Date(),
            id_solicitud: idSolicitud
        });

        console.log(`Notificación automática creada (util): ${mensaje}`);
        return notificacion;
    } catch (error) {
        console.error('Error creando notificación automática (util):', error);
        // No propagar para no romper el flujo de negocio
    }
}

module.exports = {
    createAutomaticNotification
};
