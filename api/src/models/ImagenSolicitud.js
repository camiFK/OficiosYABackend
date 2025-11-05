const {DataTypes, Model} = require('sequelize');

class ImagenSolicitud extends Model {
    static init(sequelize) {
        super.init({
            id_imagen_solicitud: { 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true 
            },
            id_solicitud: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: 'El ID de la solicitud es requerido'
                    },
                    isInt: {
                        msg: 'El ID de la solicitud debe ser un número entero'
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
            tableName: 'imagen_solicitud',
            timestamps: false,
            indexes: [
                {
                    fields: ['id_solicitud']
                },
                {
                    fields: ['fecha_subida']
                }
            ]
        });
    }
}

module.exports = ImagenSolicitud;
