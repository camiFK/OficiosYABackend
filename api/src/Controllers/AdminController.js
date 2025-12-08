const { Usuario, sequelize } = require('../Models/Index');
const { Op } = require('sequelize');
const ResponseService = require('../Services/ResponseService');

module.exports = {
    // Estadísticas de registros por rango de fechas
    async getRegistroStats(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;

            if (!fechaInicio || !fechaFin) {
                return ResponseService.error(res, "Faltan fechas", 400);
            }

            // Agrupar usuarios por fecha de registro
            const registros = await Usuario.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('fecha_registro')), 'fecha'],
                    [sequelize.fn('COUNT', sequelize.col('id_usuario')), 'cantidad']
                ],
                where: {
                    fecha_registro: {
                        [Op.between]: [new Date(fechaInicio), new Date(`${fechaFin} 23:59:59`)]
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('fecha_registro'))],
                order: [[sequelize.fn('DATE', sequelize.col('fecha_registro')), 'ASC']],
                raw: true
            });

            // Formatear respuesta
            const labels = [];
            const data = [];
            let total = 0;

            registros.forEach(reg => {
                labels.push(reg.fecha); 
                data.push(parseInt(reg.cantidad));
                total += parseInt(reg.cantidad);
            });

            return ResponseService.success(res, { labels, data, total });

        } catch (error) {
            console.error(error);
            return ResponseService.error(res, 'Error al obtener estadísticas', 500);
        }
    }
};