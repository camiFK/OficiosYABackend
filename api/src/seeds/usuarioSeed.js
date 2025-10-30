const bcrypt = require('bcryptjs');
const { Usuario, Rol, Cliente, Prestador, Ubicacion, Categoria, PrestadorCategoria } = require('../Models/Index');

async function seedUsuarios() {
    const bcryptRounds = 10;
    const hashedPassword = await bcrypt.hash('Password123!', bcryptRounds);
    const hashedAdminPassword = await bcrypt.hash('Admin123!', bcryptRounds);

    const roles = {
        admin: await Rol.findOne({ where: { nombre: 'Administrador' } }),
        cliente: await Rol.findOne({ where: { nombre: 'Cliente' } }),
        prestador: await Rol.findOne({ where: { nombre: 'Prestador' } })
    };

    const sanPedro = await Ubicacion.findOne({ where: { localidad: 'San Pedro' } });
    const ramallo = await Ubicacion.findOne({ where: { localidad: 'Ramallo' } });
    const baradero = await Ubicacion.findOne({ where: { localidad: 'Baradero' } });
    const caba = await Ubicacion.findOne({ where: { localidad: 'Ciudad Autónoma de Buenos Aires' } });

    // Admin
    const [adminUser] = await Usuario.findOrCreate({
        where: { correo: 'admin@oficiosya.com' },
        defaults: {
            correo: 'admin@oficiosya.com',
            contrasena: hashedAdminPassword,
            estado: 'activo',
            id_rol: roles.admin.id_rol
        }
    });

    // Solicitantes
    const solicitantes = [
        {
            correo: 'juan.solicitante@example.com',
            nombre_completo: 'Juan Pérez',
            id_ubicacion: sanPedro.id_ubicacion
        },
        {
            correo: 'maria.garcia@example.com',
            nombre_completo: 'María García',
            id_ubicacion: ramallo.id_ubicacion
        },
        {
            correo: 'carlos.lopez@example.com',
            nombre_completo: 'Carlos López',
            id_ubicacion: caba.id_ubicacion
        },
        {
            correo: 'ana.martinez@example.com',
            nombre_completo: 'Ana Martínez',
            id_ubicacion: baradero.id_ubicacion
        },
        {
            correo: 'pedro.rodriguez@example.com',
            nombre_completo: 'Pedro Rodríguez',
            id_ubicacion: sanPedro.id_ubicacion
        }
    ];

    for (const solData of solicitantes) {
        const [usuario] = await Usuario.findOrCreate({
            where: { correo: solData.correo },
            defaults: {
                correo: solData.correo,
                contrasena: hashedPassword,
                estado: 'activo',
                id_rol: roles.solicitante.id_rol
            }
        });

        await Cliente.findOrCreate({
            where: { id_usuario: usuario.id_usuario },
            defaults: {
                id_usuario: usuario.id_usuario,
                nombre_completo: solData.nombre_completo,
                id_ubicacion: solData.id_ubicacion
            }
        });
    }

    // Prestadores y sus categorías
    const categorias = {
        plomeria: await Categoria.findOne({ where: { nombre: 'Plomería' } }),
        electricidad: await Categoria.findOne({ where: { nombre: 'Electricidad' } }),
        albanileria: await Categoria.findOne({ where: { nombre: 'Albañilería' } }),
        pintura: await Categoria.findOne({ where: { nombre: 'Pintura' } }),
        carpinteria: await Categoria.findOne({ where: { nombre: 'Carpintería' } }),
        jardineria: await Categoria.findOne({ where: { nombre: 'Jardinería' } }),
        limpieza: await Categoria.findOne({ where: { nombre: 'Limpieza' } }),
        aireAcondicionado: await Categoria.findOne({ where: { nombre: 'Aire Acondicionado' } }),
        cerrajeria: await Categoria.findOne({ where: { nombre: 'Cerrajería' } }),
        gasista: await Categoria.findOne({ where: { nombre: 'Gasista' } })
    };

    const prestadores = [
        {
            correo: 'maria.prestadora@example.com',
            nombre_completo: 'María Fernández',
            telefono: '3329123456',
            id_ubicacion: sanPedro.id_ubicacion,
            descripcion: 'Plomera con 10 años de experiencia. Trabajos garantizados.',
            experiencia: '10 años de experiencia en instalaciones residenciales y comerciales.',
            categorias: [categorias.plomeria.id_categoria, categorias.gasista.id_categoria]
        },
        {
            correo: 'roberto.electricista@example.com',
            nombre_completo: 'Roberto Sánchez',
            telefono: '3329234567',
            id_ubicacion: sanPedro.id_ubicacion,
            descripcion: 'Electricista matriculado. Instalaciones eléctricas y domótica.',
            experiencia: '8 años realizando instalaciones eléctricas certificadas.',
            categorias: [categorias.electricidad.id_categoria, categorias.aireAcondicionado.id_categoria]
        },
        {
            correo: 'jorge.albanil@example.com',
            nombre_completo: 'Jorge Ramírez',
            telefono: '3329345678',
            id_ubicacion: ramallo.id_ubicacion,
            descripcion: 'Albañil profesional. Construcción y refacciones.',
            experiencia: '15 años en construcción y remodelaciones.',
            categorias: [categorias.albanileria.id_categoria, categorias.pintura.id_categoria]
        },
        {
            correo: 'lucia.pintora@example.com',
            nombre_completo: 'Lucía González',
            telefono: '3329456789',
            id_ubicacion: baradero.id_ubicacion,
            descripcion: 'Pintora profesional. Interiores y exteriores.',
            experiencia: '6 años especializándome en acabados de alta calidad.',
            categorias: [categorias.pintura.id_categoria]
        },
        {
            correo: 'miguel.carpintero@example.com',
            nombre_completo: 'Miguel Torres',
            telefono: '3329567890',
            id_ubicacion: sanPedro.id_ubicacion,
            descripcion: 'Carpintero experto en muebles a medida.',
            experiencia: '12 años diseñando y fabricando muebles personalizados.',
            categorias: [categorias.carpinteria.id_categoria]
        },
        {
            correo: 'silvia.jardinera@example.com',
            nombre_completo: 'Silvia Díaz',
            telefono: '3329678901',
            id_ubicacion: caba.id_ubicacion,
            descripcion: 'Paisajista y jardinera profesional.',
            experiencia: '5 años en diseño y mantenimiento de jardines.',
            categorias: [categorias.jardineria.id_categoria]
        },
        {
            correo: 'laura.limpieza@example.com',
            nombre_completo: 'Laura Benítez',
            telefono: '3329789012',
            id_ubicacion: ramallo.id_ubicacion,
            descripcion: 'Servicio de limpieza profesional para hogares y oficinas.',
            experiencia: '7 años brindando servicios de limpieza de calidad.',
            categorias: [categorias.limpieza.id_categoria]
        },
        {
            correo: 'daniel.tecnico@example.com',
            nombre_completo: 'Daniel Morales',
            telefono: '3329890123',
            id_ubicacion: sanPedro.id_ubicacion,
            descripcion: 'Técnico en refrigeración y aire acondicionado.',
            experiencia: '9 años en instalación y mantenimiento de sistemas de climatización.',
            categorias: [categorias.aireAcondicionado.id_categoria, categorias.electricidad.id_categoria]
        },
        {
            correo: 'franco.cerrajero@example.com',
            nombre_completo: 'Franco Herrera',
            telefono: '3329901234',
            id_ubicacion: baradero.id_ubicacion,
            descripcion: 'Cerrajero 24hs. Aperturas y cambio de cerraduras.',
            experiencia: '4 años brindando servicios de cerrajería de emergencia.',
            categorias: [categorias.cerrajeria.id_categoria]
        },
        {
            correo: 'ricardo.gasista@example.com',
            nombre_completo: 'Ricardo Vega',
            telefono: '3329012345',
            id_ubicacion: sanPedro.id_ubicacion,
            descripcion: 'Gasista matriculado. Instalaciones y reparaciones.',
            experiencia: '11 años realizando instalaciones de gas certificadas.',
            categorias: [categorias.gasista.id_categoria, categorias.plomeria.id_categoria]
        }
    ];

    for (const prestData of prestadores) {
        const [usuario] = await Usuario.findOrCreate({
            where: { correo: prestData.correo },
            defaults: {
                correo: prestData.correo,
                contrasena: hashedPassword,
                estado: 'activo',
                id_rol: roles.prestador.id_rol
            }
        });

        const [prestador] = await Prestador.findOrCreate({
            where: { id_usuario: usuario.id_usuario },
            defaults: {
                id_usuario: usuario.id_usuario,
                nombre_completo: prestData.nombre_completo,
                telefono: prestData.telefono,
                id_ubicacion: prestData.id_ubicacion,
                descripcion: prestData.descripcion,
                experiencia: prestData.experiencia
            }
        });

        // Asignar categorías al prestador
        for (const id_categoria of prestData.categorias) {
            await PrestadorCategoria.findOrCreate({
                where: {
                    id_prestador: prestador.id_prestador,
                    id_categoria: id_categoria
                },
                defaults: {
                    id_prestador: prestador.id_prestador,
                    id_categoria: id_categoria
                }
            });
        }
    }
}

module.exports = seedUsuarios;