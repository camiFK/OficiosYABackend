const { DataTypes, Model } = require('sequelize');

class Usuario extends Model {
    static init(sequelize) {
        super.init({
            id_usuario: { 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true 
            },
            correo: { 
                type: DataTypes.STRING(100), 
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Debe proporcionar un correo electrónico válido'
                    },
                    notEmpty: {
                        msg: 'El correo electrónico es requerido'
                    }
                }
            },
            contrasena: { 
                type: DataTypes.STRING(255), 
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'La contraseña es requerida'
                    },
                    len: {
                        args: [8, 255],
                        msg: 'La contraseña debe tener al menos 8 caracteres'
                    }
                }
            },
            estado: { 
                type: DataTypes.STRING(20), 
                allowNull: false,
                defaultValue: 'activo',
                validate: {
                    isIn: {
                        args: [['activo', 'inactivo', 'bloqueado']],
                        msg: 'Estado debe ser: activo, inactivo o bloqueado'
                    }
                }
            },
            id_rol: { 
                type: DataTypes.INTEGER, 
                allowNull: false,
                validate: {
                    notNull: {
                        msg: 'El rol es requerido'
                    },
                    isInt: {
                        msg: 'El rol debe ser un número entero'
                    }
                }
            },
            fecha_registro: { 
                type: DataTypes.DATE, 
                defaultValue: DataTypes.NOW 
            },
        }, {
            sequelize,
            tableName: 'usuario',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['correo']
                }
            ]
        });
    }
}

module.exports = Usuario;
