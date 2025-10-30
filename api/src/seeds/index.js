const sequelize = require('../config/database');
const seedRoles = require('./rolSeed');
const seedUbicaciones = require('./ubicacionSeed');
const seedUsuarios = require('./usuarioSeed');
const seedCategorias = require('./categoriaSeed');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function runSeeds() {
    try {
        await sequelize.authenticate();

        if (process.env.NODE_ENV === 'development') {
            console.log('Limpiando base de datos...');
            await sequelize.sync({ force: true });
            console.log('Base de datos limpiada\n');
        }
        
        await seedRoles();
        await seedUbicaciones();
        await seedCategorias();
        await seedUsuarios();

        process.exit(0);
    } catch (error) {
        console.error('Error ejecutando seeds:', error);
        process.exit(1);
    }
}

runSeeds();