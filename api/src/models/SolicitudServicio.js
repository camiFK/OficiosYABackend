const {DataTypes, Model} = require('sequelize');

class SolicitudServicio extends Model {
    static init(sequelize) {
        super.init({
            id_solicitud_servicio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            titulo: DataTypes.STRING,
            descripcion: DataTypes.STRING,
            estado: DataTypes.STRING,
            fecha_creacion: DataTypes.DATE,
            id_cliente: DataTypes.INTEGER,
            id_categoria: DataTypes.INTEGER,
            id_ubicacion: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'solicitud_servicio',
            timestamps: false
        });
    }
}

module.exports = SolicitudServicio;
