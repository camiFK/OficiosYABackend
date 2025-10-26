const {DataTypes, Model} = require('sequelize');

class Cliente extends Model {
    static init(sequelize) {
        super.init({
            id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            fecha_registro: DataTypes.DATE,
            nombre_completo: DataTypes.STRING,
            id_ubicacion: DataTypes.INTEGER,
            id_usuario: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'cliente',
            timestamps: false
        });
    }
}

module.exports = Cliente;
