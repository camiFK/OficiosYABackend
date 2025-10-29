const bcrypt = require('bcryptjs');
const { Usuario, Rol, Cliente, Prestador, Ubicacion } = require('../Models/Index');
const { bcryptRounds } = require('../config/auth');

module.exports = {
    //Busca un usuario por correo
    async findByEmail(correo) {
        return await Usuario.findOne({
            where: { correo },
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id_rol', 'nombre']
            }]
        });
    },

    // Busca un usuario por ID con toda su información
    async findByIdWithDetails(id_usuario) {
        const usuario = await Usuario.findByPk(id_usuario, {
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id_rol', 'nombre']
            }],
            attributes: { exclude: ['contrasena'] }
        });

        if (!usuario) return null;

        let userData = usuario.toJSON();

        // Obtener datos adicionales según el rol
        if (usuario.rol.nombre === 'Solicitante') {
            const cliente = await Cliente.findOne({
                where: { id_usuario },
                include: [{
                    model: Ubicacion,
                    as: 'ubicacion'
                }]
            });
            if (cliente) {
                userData.cliente = cliente;
            }
        } else if (usuario.rol.nombre === 'Prestador') {
            const prestador = await Prestador.findOne({
                where: { id_usuario },
                include: [{
                    model: Ubicacion,
                    as: 'ubicacion'
                }]
            });
            if (prestador) {
                userData.prestador = prestador;
            }
        }

        return userData;
    },

    // Verifica si una contraseña coincide con el hash almacenado
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Hashea una contraseña
    async hashPassword(password) {
        return await bcrypt.hash(password, bcryptRounds);
    },

    // Crea un nuevo usuario con su rol específico
    async createUser(userData) {
        const { correo, contrasena, nombre_completo, id_ubicacion, rol, telefono } = userData;

        // Verificar que el rol exista
        const rolRecord = await Rol.findOne({ where: { nombre: rol } });
        if (!rolRecord) {
            throw new Error('Rol no encontrado');
        }

        // Hashear contraseña
        const hashedPassword = await this.hashPassword(contrasena);

        // Crear usuario
        const nuevoUsuario = await Usuario.create({
            correo,
            contrasena: hashedPassword,
            estado: 'activo',
            id_rol: rolRecord.id_rol
        });

        // Crear registro específico según el rol
        if (rol === 'Solicitante') {
            await Cliente.create({
                id_usuario: nuevoUsuario.id_usuario,
                nombre_completo,
                id_ubicacion
            });
        } else if (rol === 'Prestador') {
            await Prestador.create({
                id_usuario: nuevoUsuario.id_usuario,
                nombre_completo,
                telefono: telefono || null,
                id_ubicacion,
                descripcion: null,
                experiencia: null
            });
        }

        return nuevoUsuario;
    },

    // Actualiza la contraseña de un usuario
    async updatePassword(id_usuario, nuevaContrasena) {
        const hashedPassword = await this.hashPassword(nuevaContrasena);
        
        await Usuario.update(
            { contrasena: hashedPassword },
            { where: { id_usuario } }
        );
    },

    // Obtiene los datos del usuario para el login según su rol
    async getUserDataForLogin(usuario) {
        let userData = {
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            estado: usuario.estado,
            rol: usuario.rol.nombre
        };

        let redirectUrl = '/';

        if (usuario.rol.nombre === 'Solicitante') {
            const cliente = await Cliente.findOne({
                where: { id_usuario: usuario.id_usuario },
                include: [{
                    model: Ubicacion,
                    as: 'ubicacion',
                    attributes: ['localidad', 'provincia']
                }]
            });
            
            if (cliente) {
                userData.id_cliente = cliente.id_cliente;
                userData.nombre_completo = cliente.nombre_completo;
                userData.ubicacion = cliente.ubicacion;
            }
            
            redirectUrl = '/panel/solicitante';

        } else if (usuario.rol.nombre === 'Prestador') {
            const prestador = await Prestador.findOne({
                where: { id_usuario: usuario.id_usuario },
                include: [{
                    model: Ubicacion,
                    as: 'ubicacion',
                    attributes: ['localidad', 'provincia']
                }]
            });
            
            if (prestador) {
                userData.id_prestador = prestador.id_prestador;
                userData.nombre_completo = prestador.nombre_completo;
                userData.telefono = prestador.telefono;
                userData.ubicacion = prestador.ubicacion;
            }
            
            redirectUrl = '/panel/prestador';

        } else if (usuario.rol.nombre === 'Administrador') {
            redirectUrl = '/panel/administrador';
        }

        return { userData, redirectUrl };
    }
};