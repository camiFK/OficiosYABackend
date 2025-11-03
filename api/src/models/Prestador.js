const {DataTypes, Model} = require('sequelize');

class Prestador extends Model {
    static init(sequelize) {
        super.init({
            id_prestador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            descripcion: {type: DataTypes.TEXT,},
            experiencia: {type: DataTypes.TEXT, },
            fecha_alta: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
            nombre_completo: {type: DataTypes.STRING, },
            telefono: {type: DataTypes.STRING},
            id_ubicacion: {type: DataTypes.INTEGER},
            id_usuario: {type: DataTypes.INTEGER, allowNull: false},
        }, {
            sequelize,
            tableName: 'prestador',
            timestamps: false
        });
    }
}

module.exports = Prestador;
