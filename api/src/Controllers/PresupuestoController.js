const {Presupuesto, SolicitudPrestador, SolicitudServicio} = require('../Models/Index');

module.exports = {
    async getPresupuestoById(req, res) {
        try {
            const presupuesto = await Presupuesto.findByPk(req.params.id);
            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }
            res.status(200).json(presupuesto);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el presupuesto' });
        }
    },
    async getSolicitudesByPrestadorId(req, res) {
        try {
            const solicitudes = await SolicitudPrestador.findAll({ 
                where: { id_prestador: req.params.id } 
            });
            res.status(200).json(solicitudes);
        } catch (error) {
            res.status(500).json({error: 'Error al obtener las solicitudes del prestador'});
        }
    },
    async getSolicitudesRecibidas(req, res) {
        try {
            const solicitudes = await SolicitudPrestador.findAll({ 
                where: { id_prestador: req.params.id, estado: 'Pendiente' } 
            });
            res.status(200).json(solicitudes);
        } catch (error) {
            res.status(500).json({error: 'Error al obtener las solicitudes pendientes'});
        }
    },
    async sendPresupuesto(req, res) {
        try {
            const { id_solicitud, id_prestador, monto, descripcion, mensaje } = req.body;
            const nuevoPresupuesto = await Presupuesto.create({
                id_solicitud,
                id_prestador,
                monto,
                descripcion,
                mensaje,
                estado: 'Cotizado'
            });
            res.status(201).json(nuevoPresupuesto);
        } catch (error) {
            res.status(500).json({error: 'Error al enviar el presupuesto'});
        }
    },
    async rejectSolicitud(req, res) {
        try {
            const { id } = req.params;
            const solicitudPrestador = await SolicitudPrestador.findByPk(id);
            if (!solicitudPrestador) {
                return res.status(404).json({ error: 'Solicitud del prestador no encontrada' });
            }
            solicitudPrestador.estado = 'Rechazado';
            await solicitudPrestador.save();
            res.status(200).json({ message: 'Solicitud del prestador rechazada correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al rechazar la solicitud del prestador' });
        }
    },
    async acceptSolicitud(req, res) {
        try {
            const { id } = req.params;
            const solicitudPrestador = await SolicitudPrestador.findByPk(id);
            if (!solicitudPrestador) {
                return res.status(404).json({ error: 'Solicitud del prestador no encontrada' });
            }
            solicitudPrestador.estado = 'Aceptado';
            await solicitudPrestador.save();
            res.status(200).json({ message: 'Solicitud del prestador aceptada correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al aceptar la solicitud del prestador' });
        }
    },
    async acceptPresupuesto(req, res) {
        try {
            const { id } = req.params;
            const presupuesto = await Presupuesto.findByPk(id);
            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }
            presupuesto.estado = 'Aceptado';
            await presupuesto.save();
            res.status(200).json({ message: 'Presupuesto aceptado correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al aceptar el presupuesto' });
        }
    },
    async rejectPresupuesto(req, res) {
        try {
            const { id } = req.params;
            const presupuesto = await Presupuesto.findByPk(id);
            if (!presupuesto) {
                return res.status(404).json({ error: 'Presupuesto no encontrado' });
            }
            presupuesto.estado = 'Rechazado';
            await presupuesto.save();
            res.status(200).json({ message: 'Presupuesto rechazado correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al rechazar el presupuesto' });
        }
    },
    async getAllPresupuestosByCliente(req, res) {
        try {
            const { id_usuario } = req.body;
            const presupuestos = await Presupuesto.findAll({
                include: [{
                    model: SolicitudServicio,
                    as: 'solicitud',
                    where: { id_cliente: id_usuario },  
                    attributes: []                      
                }]
            });
            res.status(200).json(presupuestos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los presupuestos del usuario' });
        }
    },
    async requestSolicitudServicio(req, res) {
        try {
            const { id_solicitud, id_prestador } = req.body;
            const nuevaSolicitudPrestador = await SolicitudPrestador.create({
                id_solicitud,
                id_prestador,
                estado: 'Pendiente'
            });
            res.status(201).json(nuevaSolicitudPrestador);
        } catch (error) {
            res.status(500).json({ error: 'Error al solicitar la solicitud de servicio' });
        }    
    }
};