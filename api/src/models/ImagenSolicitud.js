const {DataTypes, Model} = require('sequelize');

class ImagenSolicitud extends Model {
    static init(sequelize) {
        super.init({
            id_imagen_solicitud: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            id_solicitud: DataTypes.INTEGER,
            ruta_imagen: DataTypes.STRING,
            descripcion: DataTypes.STRING,
            fecha_subida: DataTypes.DATE,
        }, {
            sequelize,
            tableName: 'imagen_solicitud',
            timestamps: false
        });
    }
}

module.exports = ImagenSolicitud;
