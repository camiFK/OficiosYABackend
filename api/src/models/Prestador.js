const {DataTypes, Model} = require('sequelize');

class Prestador extends Model {
    static init(sequelize) {
        super.init({
            id_prestador: { 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true 
            },
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: {
                        args: [0, 1000],
                        msg: 'La descripción no puede exceder 1000 caracteres'
                    }
                }
            },
            experiencia: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: {
                        args: [0, 500],
                        msg: 'La experiencia no puede exceder 500 caracteres'
                    }
                }
            },
            fecha_alta: {
                type: DataTypes.DATE, 
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            nombre_completo: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'El nombre completo es requerido'
                    },
                    len: {
                        args: [2, 100],
                        msg: 'El nombre debe tener entre 2 y 100 caracteres'
                    }
                }
            },
            telefono: {
                type: DataTypes.STRING(20),
                allowNull: true,
                validate: {
                    len: {
                        args: [0, 20],
                        msg: 'El teléfono no puede exceder 20 caracteres'
                    }
                }
            },
            id_ubicacion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: 'La ubicación es requerida'
                    },
                    isInt: {
                        msg: 'La ubicación debe ser un número entero'
                    }
                }
            },
            id_usuario: {
                type: DataTypes.INTEGER, 
                allowNull: false,
                unique: true,
                validate: {
                    notNull: {
                        msg: 'El usuario es requerido'
                    },
                    isInt: {
                        msg: 'El usuario debe ser un número entero'
                    }
                }
            },
        }, {
            sequelize,
            tableName: 'prestador',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['id_usuario']
                }
            ]
        });
    }
}

module.exports = Prestador;
