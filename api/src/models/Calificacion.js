const {DataTypes, Model} = require('sequelize');

class Calificacion extends Model {
    static init(sequelize) {
        super.init({
            id_calificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            estrellas: DataTypes.INTEGER,
            comentario: DataTypes.STRING,
            fecha_creacion: DataTypes.DATE,
            id_cliente: DataTypes.INTEGER,
            id_prestador: DataTypes.INTEGER,
            id_solicitud: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'calificacion',
            timestamps: false
        });
    }
}

module.exports = Calificacion;
