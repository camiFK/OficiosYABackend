const {DataTypes, Model} = require('sequelize');

class Notificacion extends Model {
    static init(sequelize) {
        super.init({
            id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            id_usuario_destino: DataTypes.INTEGER,
            tipo: DataTypes.STRING,
            mensaje: DataTypes.STRING,
            fecha_envio: DataTypes.DATE,
            estado: DataTypes.STRING,
            id_solicitud: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'notificacion',
            timestamps: false
        });
    }
}

module.exports = Notificacion;
