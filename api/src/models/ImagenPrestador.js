const {DataTypes, Model} = require('sequelize');

class ImagenPrestador extends Model {
    static init(sequelize) {
        super.init({
            id_imagen_prestador: { 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true 
            },
            id_prestador: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: 'El ID del prestador es requerido'
                    },
                    isInt: {
                        msg: 'El ID del prestador debe ser un número entero'
                    }
                }
            },
            ruta_imagen: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'La ruta de la imagen es requerida'
                    },
                    len: {
                        args: [1, 255],
                        msg: 'La ruta debe tener entre 1 y 255 caracteres'
                    }
                }
            },
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: {
                        args: [0, 500],
                        msg: 'La descripción no puede exceder 500 caracteres'
                    }
                }
            },
            fecha_subida: {
                type: DataTypes.DATE, 
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
        }, {
            sequelize,
            tableName: 'imagen_prestador',
            timestamps: false,
            indexes: [
                {
                    fields: ['id_prestador']
                },
                {
                    fields: ['fecha_subida']
                }
            ]
        });
    }
}


module.exports = ImagenPrestador;
