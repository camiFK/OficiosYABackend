const {Prestador, Categoria, Ubicacion, SolicitudPrestador} = require('../Models/Index');
const {ImageService} = require('../Services/ImageService');

module.exports = {
    async getAllPrestadores(req, res) {
        try {

            const prestadores = await Prestador.findAll({
                include: [
                {
                model: Categoria,
                as: 'categorias',
                through: { attributes: [] }, 
                attributes: ['id_categoria','nombre','descripcion']
                },
                {
                model: Ubicacion,
                as: 'ubicacion',
                attributes: ['id_ubicacion','localidad','provincia','direccion']
                }
            ],
            });
            res.status(200).json(prestadores);
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getPrestadorById(req, res) {
        try {
            const { id } = req.params;
            const prestador = await Prestador.findByPk(id, {
                include: [
                {
                model: Categoria,
                as: 'categorias',
                through: { attributes: [] }, 
                attributes: ['id_categoria','nombre','descripcion']
                },
                {
                model: Ubicacion,
                as: 'ubicacion',
                attributes: ['id_ubicacion','localidad','provincia','direccion']
                }
            ],
            });

            if (!prestador) {
                return res.status(404).json({ error: 'Prestador no encontrado.' });
            }

            res.status(200).json(prestador);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deletePrestador(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Prestador.destroy({ where: { id_prestador: id } });
            if (deleted) {
                res.status(200).json({ message: 'Prestador eliminado correctamente.' });
            }
            else {
                res.status(404).json({ error: 'Prestador no encontrado.' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updatePrestador(req, res) {
        try {
            const { id } = req.params;
            const [updated] = await Prestador.update(req.body, { where: { id_prestador: id } });
            if (updated) {
                const updatedPrestador = await Prestador.findByPk(id);
                res.status(200).json(updatedPrestador);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateCategorias(req, res) {
        try {
            const { id } = req.params;
            const { categoriasIds } = req.body;

            const prestador = await Prestador.findByPk(id);
            if (!prestador) return res.status(404).json({ error: 'Prestador no encontrado' });

            // sobree escribe relaciones
            await prestador.setCategorias(categoriasIds);

            const updated = await Prestador.findByPk(id, 
            {include: 
                { model: Categoria, as: 'categorias' }
            });

            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: "Error actualizando categorías" });
        }
    },

    async saveImage(req, res) {
        try {
            const { descripcion } = req.body;
            const id_prestador = req.user.id_prestador;
            const apiKey = process.env.IMGBB_API_KEY;

            const imageUrl = await ImageService.uploadImageToImgbb(req.file, apiKey);

            const newImage = await ImageService.savePrestadorImage({
                ruta_imagen: imageUrl,
                descripcion,
                id_prestador
            });

            res.status(200).json({ mensaje: 'Imagen subida y guardada con éxito', newImage });
            
        } catch (error) {
            res.status(500).json({ error: "Error al guardar la imagen: " + error.message });
        }
    },

    async getSolicitudesByPrestadorId(req, res) {
        try {
            const { id } = req.params;
            const solicitudes = await SolicitudPrestador.findAll({
                where: { id_prestador: id }
            });
            if (solicitudes) {
                res.status(200).json({solicitudes})
            } else {
                res.status(404).json({message: 'No se encontraron solicitudes para el prestador.'})
            }

            res.status(200).json(solicitudes);
        } catch (error) {
            res.status(500).json({ error: "Hubo un error al obtener tus solicitudes: " + error.message });
        }
    }
};