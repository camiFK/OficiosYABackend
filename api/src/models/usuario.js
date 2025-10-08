const {DataTypes, Model} = require('sequelize');

class Usuario extends Model {
    static init(sequelize) {
        super.init({
            id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            nombre_completo: DataTypes.STRING,
            correo: DataTypes.STRING,
            contrasena: DataTypes.STRING,
            telefono: DataTypes.STRING,
            id_ubicacion: DataTypes.INTEGER,
            id_rol: DataTypes.INTEGER,
            estado: DataTypes.STRING,
            fecha_registro: DataTypes.DATE,
            enlace_whatsapp: DataTypes.STRING
        }, {
            sequelize,
            tableName: 'usuarios'
        });
    }
}

module.exports = Usuario;
