const {DataTypes, Model} = require('sequelize');

class Prestador extends Model {
    static init(sequelize) {
        super.init({
            id_prestador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            descripcion: DataTypes.TEXT,
            experiencia: DataTypes.TEXT,
            fecha_alta: DataTypes.DATE,
            nombre_completo: DataTypes.STRING,
            telefono: DataTypes.STRING,
            id_ubicacion: DataTypes.INTEGER,
            id_usuario: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'prestador',
            timestamps: false
        });
    }
}

module.exports = Prestador;
