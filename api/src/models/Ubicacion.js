const {DataTypes, Model} = require('sequelize');

class Ubicacion extends Model {
    static init(sequelize) {
        super.init({
            id_ubicacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            localidad: DataTypes.STRING,
            provincia: DataTypes.STRING,
            direccion: DataTypes.STRING,
        }, {
            sequelize,
            tableName: 'ubicacion',
            timestamps: false
        });
    }
}

module.exports = Ubicacion;
