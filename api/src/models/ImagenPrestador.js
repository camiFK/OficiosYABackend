const {DataTypes, Model} = require('sequelize');

class ImagenPrestador extends Model {
    static init(sequelize) {
        super.init({
            id_imagen_prestador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            id_prestador: DataTypes.INTEGER,
            ruta_imagen: DataTypes.STRING,
            descripcion: DataTypes.STRING,
            fecha_subida: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
        }, {
            sequelize,
            tableName: 'imagen_prestador',
            timestamps: false
        });
    }
}


module.exports = ImagenPrestador;
