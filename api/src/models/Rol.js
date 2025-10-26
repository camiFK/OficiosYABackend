const {DataTypes, Model} = require('sequelize');

class Rol extends Model {
    static init(sequelize) {
        super.init({
            id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            nombre: {type: DataTypes.STRING, unique: true, allowNull: false}
        }, {
            sequelize,
            tableName: 'rol',
            timestamps: false
        });
    }
}

module.exports = Rol;