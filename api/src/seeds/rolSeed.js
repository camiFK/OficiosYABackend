const { Rol } = require('../Models/Index');

async function seedRoles() {
    const roles = [
        { nombre: 'Administrador' },
        { nombre: 'Cliente' },
        { nombre: 'Prestador' }
    ];

    for (const rol of roles) {
        await Rol.findOrCreate({
            where: { nombre: rol.nombre },
            defaults: rol
        });
    }
    console.log(`${roles.length} roles insertados`);
}


module.exports = seedRoles;