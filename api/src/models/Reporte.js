const {DataTypes, Model} = require('sequelize');

class Reporte extends Model {
    static init(sequelize) {
        super.init({
            id_reporte: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            id_usuario_reportante: DataTypes.INTEGER,
            id_usuario_reportado: DataTypes.INTEGER,
            motivo: DataTypes.STRING,
            fecha_reporte: DataTypes.DATE,
            estado: DataTypes.STRING
        }, {
            sequelize,
            tableName: 'reporte',
            timestamps: false
        });
    }
}

module.exports = Reporte;
