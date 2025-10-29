const { sequelize } = require('../Models/Index');
const seedRoles = require('./rolSeed');
const seedUbicaciones = require('./ubicacionSeed');
const seedUsuarios = require('./usuarioSeed');
const seedCategorias = require('./categoriaSeed');

async function runSeeds() {
    try {
        console.log('Iniciando seeds...\n');

        // Verificar conexión
        await sequelize.authenticate();
        console.log('Conexión a base de datos establecida\n');

        // Opcional: Limpiar base de datos en entorno de desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Limpiando base de datos...');
            await sequelize.sync({ force: true });
            console.log('Base de datos limpiada\n');
        }

        // Ejecutar seeds en orden
        console.log('Insertando roles...');
        await seedRoles();
        console.log('Roles insertados\n');

        console.log('Insertando ubicaciones...');
        await seedUbicaciones();
        console.log('Ubicaciones insertadas\n');

        console.log('Insertando categorías...');
        await seedCategorias();
        console.log('Categorías insertadas\n');

        console.log('Insertando usuarios...');
        await seedUsuarios();
        console.log('Usuarios insertados\n');

        console.log('¡Seeds completados exitosamente!');
        console.log('\n Credenciales de prueba:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(' Admin:');
        console.log('   Email: admin@oficiosya.com');
        console.log('   Password: Admin123!');
        console.log('\n Solicitante:');
        console.log('   Email: juan.solicitante@example.com');
        console.log('   Password: Password123!');
        console.log('\n Prestador:');
        console.log('   Email: maria.prestadora@example.com');
        console.log('   Password: Password123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('Error ejecutando seeds:', error);
        process.exit(1);
    }
}

runSeeds();