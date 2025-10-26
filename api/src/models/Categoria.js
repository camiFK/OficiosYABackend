const {DataTypes, Model} = require('sequelize');

class Categoria extends Model {
    static init(sequelize) {
        super.init({
            id_categoria: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
            nombre: {type: DataTypes.STRING, unique:true},
            descripcion: {type: DataTypes.STRING}
        }, {
            sequelize,
            tableName: 'categoria',
            timestamps: false
        });
    }
}

module.exports = Categoria;