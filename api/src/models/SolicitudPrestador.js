const {DataTypes, Model} = require('sequelize');

class SolicitudPrestador extends Model {
    static init(sequelize) {
        super.init({
            id_solicitud_prestador: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            id_solicitud: {type: DataTypes.INTEGER, allowNull: false},
            id_prestador: {type: DataTypes.INTEGER, allowNull: false},
            fecha_envio: {type: DataTypes.DATE},
            estado: {type: DataTypes.STRING, defaultValue: 'Pendiente', allowNull: false}
        },
        {
            sequelize,
            tableName: 'solicitud_prestador',
            timestamps: false
        });
    }
}

module.exports = SolicitudPrestador;