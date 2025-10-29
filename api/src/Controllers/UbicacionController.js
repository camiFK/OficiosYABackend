const { Ubicacion } = require('../Models/Index');

module.exports = {
    // GET /ubicaciones: Obtiene todas las ubicaciones disponibles
    async getAllUbicaciones(req, res) {
        try {
            const ubicaciones = await Ubicacion.findAll({
                attributes: ['id_ubicacion', 'localidad', 'provincia'],
                order: [['provincia', 'ASC'], ['localidad', 'ASC']]
            });

            res.status(200).json(ubicaciones);
        } catch (error) {
            console.error('Error al obtener ubicaciones:', error);
            res.status(500).json({ 
                error: 'Error al obtener las ubicaciones.' 
            });
        }
    },

    // GET /ubicaciones/provincias: Obtiene todas las provincias únicas
    async getProvincias(req, res) {
        try {
            const ubicaciones = await Ubicacion.findAll({
                attributes: ['provincia'],
                group: ['provincia'],
                order: [['provincia', 'ASC']]
            });

            const provincias = ubicaciones.map(u => u.provincia);
            res.status(200).json(provincias);
        } catch (error) {
            console.error('Error al obtener provincias:', error);
            res.status(500).json({ 
                error: 'Error al obtener las provincias.' 
            });
        }
    },

    // GET /ubicaciones/localidades/:provincia: Obtiene todas las localidades de una provincia
    async getLocalidadesByProvincia(req, res) {
        try {
            const { provincia } = req.params;

            const ubicaciones = await Ubicacion.findAll({
                where: { provincia },
                attributes: ['id_ubicacion', 'localidad'],
                order: [['localidad', 'ASC']]
            });

            res.status(200).json(ubicaciones);
        } catch (error) {
            console.error('Error al obtener localidades:', error);
            res.status(500).json({ 
                error: 'Error al obtener las localidades.' 
            });
        }
    },

    // POST /ubicaciones: Crea una nueva ubicación (solo admin)
    async createUbicacion(req, res) {
        try {
            const { localidad, provincia, direccion } = req.body;

            if (!localidad || !provincia) {
                return res.status(400).json({ 
                    error: 'Localidad y provincia son obligatorios.' 
                });
            }

            const ubicacion = await Ubicacion.create({
                localidad,
                provincia,
                direccion
            });

            res.status(201).json(ubicacion);
        } catch (error) {
            console.error('Error al crear ubicación:', error);
            res.status(500).json({ 
                error: 'Error al crear la ubicación.' 
            });
        }
    }
};