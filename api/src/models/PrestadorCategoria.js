const {DataTypes, Model} = require('sequelize');

class PrestadorCategoria extends Model {
    static init(sequelize) {
        super.init({
            id_prestador: {type: DataTypes.INTEGER, primaryKey: true},
            id_categoria: {type: DataTypes.INTEGER, primaryKey: true},
            descripcion_trabajo: DataTypes.TEXT
        }, {
            sequelize,
            tableName: 'prestador_categoria',
            timestamps: false
        });
    }
}

module.exports = PrestadorCategoria;
