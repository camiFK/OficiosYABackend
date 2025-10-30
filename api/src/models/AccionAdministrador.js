const {DataTypes, Model} = require('sequelize');

class AccionAdministrador extends Model {
    static init(sequelize) {
        super.init({
            id_accion_administrador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            tipo_accion: DataTypes.STRING,
            fecha_hora: DataTypes.DATE,
            descripcion: DataTypes.STRING,
            id_admin: DataTypes.INTEGER,
            id_usuario_afectado: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'accion_administrador',
            timestamps: false
        });
    }
}

module.exports = AccionAdministrador;
