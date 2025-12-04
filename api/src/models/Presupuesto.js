const {DataTypes, Model} = require('sequelize');

class Presupuesto extends Model {
    static init(sequelize) {
        super.init({
            id_presupuesto: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            monto: DataTypes.DECIMAL(10, 2),
            mensaje: DataTypes.TEXT,
            estado: DataTypes.STRING,
            fecha_envio:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            id_prestador: DataTypes.INTEGER,
            id_solicitud: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'presupuesto',
            timestamps: false
        });
    }
}

module.exports = Presupuesto;
