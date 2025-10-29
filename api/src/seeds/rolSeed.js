const { Rol } = require('../Models/Index');

async function seedRoles() {
    const roles = [
        { nombre: 'Administrador' },
        { nombre: 'Solicitante' },
        { nombre: 'Prestador' }
    ];

    for (const rol of roles) {
        await Rol.findOrCreate({
            where: { nombre: rol.nombre },
            defaults: rol
        });
    }

    console.log('   ✓ Roles: Administrador, Solicitante, Prestador');
}

module.exports = seedRoles;