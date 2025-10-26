const { DataTypes, Model } = require('sequelize');

class Usuario extends Model {
    static init(sequelize) {
        super.init({
            id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            correo: { type: DataTypes.STRING, allowNull: false },
            contrasena: { type: DataTypes.STRING, allowNull: false },
            estado: { type: DataTypes.STRING, allowNull: false },
            id_rol: { type: DataTypes.INTEGER, allowNull: false },
            fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        }, {
            sequelize,
            tableName: 'usuario',
            timestamps: false
        });
    }
}

module.exports = Usuario;
