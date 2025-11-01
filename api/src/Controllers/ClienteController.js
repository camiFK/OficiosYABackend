const {Cliente, SolicitudServicio} = require('../Models/Index');

module.exports = {
    async getSolicitudesByClienteId(req, res) {
        try {
            const { id } = req.params;
            const solicitudes = await SolicitudServicio.findAll({ where: { id_cliente: id } });
            res.status(200).json(solicitudes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async createClienteSolicitud(req, res) {
        try {
            const { id_cliente } = req.params;
            const { id_categoria, id_ubicacion, titulo, descripcion, fecha_creacion } = req.body;
            const nuevaSolicitud = await SolicitudServicio.create({
                id_cliente,
                id_categoria,
                id_ubicacion,
                titulo,
                descripcion,
                fecha_creacion
            });
            res.status(201).json(nuevaSolicitud);
        } catch (error) {
            res.status(500).json({ error: "Error al crear la solicitud: " + error.message });
        }
    },
    async getSolicitudById(req, res) {
        try {
            const solicitud = await SolicitudServicio.findByPk(req.params.id);
            if (!solicitud) {
                return res.status(404).json({ error: "Solicitud no encontrada" });
            }
            res.status(200).json(solicitud);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener la solicitud: " + error.message });
        }
    }
};