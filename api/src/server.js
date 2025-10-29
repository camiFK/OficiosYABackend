// Punto de entrada principal del servidor
// Maneja la inicialización de la base de datos y el servidor Express

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const app = require('./app');
const { sequelize } = require('./Models/Index');

const PORT = process.env.PORT || 3000;

// Variable para almacenar la instancia del servidor
let server;

// Inicializa la conexión a la base de datos y luego el servidor
async function startServer() {
    try {
        console.log('🔄 Iniciando OficiosYA API Server...\n');
        
        // Conectar a la base de datos
        console.log('Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log(`Conexión exitosa a: ${process.env.MYSQL_DATABASE}`);
        
        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
            console.log('Sincronizando modelos de base de datos...');
            await sequelize.sync({ alter: false }); // alter: true solo para desarrollo
            console.log('Modelos sincronizados correctamente');
        }
        
        // Iniciar el servidor Express
        server = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('SERVIDOR INICIADO CORRECTAMENTE');
            console.log('='.repeat(50));
            console.log(`
 Información del servidor:
   • Puerto: ${PORT}
   • URL: http://localhost:${PORT}
   • Entorno: ${process.env.NODE_ENV || 'development'}
   • Base de datos: ${process.env.MYSQL_DATABASE}
   • Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3001'}

 Tip: Presiona Ctrl+C para detener el servidor
            `);
            console.log('='.repeat(50) + '\n');
        });

        // Manejar errores del servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Error: El puerto ${PORT} ya está en uso`);
                console.error('Solución: Cambia el puerto en .env o detén el otro proceso');
            } else {
                console.error('Error del servidor:', error.message);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('ERROR AL INICIAR EL SERVIDOR');
        console.error('='.repeat(50));
        
        // Identificar tipo de error y dar soluciones
        if (error.name === 'SequelizeConnectionError') {
            console.error('\n Error de conexión a la base de datos\n');
            console.error('Verifica lo siguiente:');
            console.error('  1. ¿MySQL está corriendo?');
            console.error('  2. ¿Las credenciales en .env son correctas?');
            console.error('     - MYSQL_HOST=' + process.env.MYSQL_HOST);
            console.error('     - MYSQL_USER=' + process.env.MYSQL_USER);
            console.error('     - MYSQL_DATABASE=' + process.env.MYSQL_DATABASE);
            console.error('  3. ¿La base de datos existe?');
            console.error('\n Comando para crear la BD:');
            console.error(`   CREATE DATABASE ${process.env.MYSQL_DATABASE};`);
        } else if (error.name === 'SequelizeAccessDeniedError') {
            console.error('\n Acceso denegado a la base de datos\n');
            console.error('  - Verifica el usuario y contraseña en .env');
            console.error('  - Verifica los permisos del usuario MySQL');
        } else {
            console.error('\n Error desconocido:');
            console.error('Tipo:', error.name);
            console.error('Mensaje:', error.message);
        }
        
        console.error('\n' + '='.repeat(50));
        console.error(' El servidor se cerrará...\n');
        process.exit(1);
    }
}

// Cierre graceful del servidor
// Cierra las conexiones activas antes de terminar el proceso
async function gracefulShutdown(signal) {
    console.log(`\n\n${'='.repeat(50)}`);
    console.log(`Señal ${signal} recibida. Iniciando cierre graceful...`);
    console.log('='.repeat(50));
    
    // Dar tiempo para que las requests activas terminen
    if (server) {
        console.log('Cerrando servidor HTTP...');
        server.close(async () => {
            console.log('Servidor HTTP cerrado correctamente');
            
            // Cerrar conexión a base de datos
            try {
                console.log('Cerrando conexión a base de datos...');
                await sequelize.close();
                console.log('Conexión a base de datos cerrada');
                console.log('\n ¡Hasta pronto!\n');
                process.exit(0);
            } catch (error) {
                console.error('Error al cerrar la base de datos:', error);
                process.exit(1);
            }
        });
        
        // Forzar cierre después de 10 segundos si no se cierra naturalmente
        setTimeout(() => {
            console.error('\n Tiempo de espera agotado. Forzando cierre...');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

// Captura de señales de terminación
// Estas señales se envían cuando:
// - SIGTERM: Sistema solicita cierre (ej: Heroku, Docker)
// - SIGINT: Usuario presiona Ctrl+C

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Captura de errores no manejados
// Previene que el servidor crashee sin información útil

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n' + '='.repeat(50));
    console.error('PROMESA RECHAZADA NO MANEJADA');
    console.error('='.repeat(50));
    console.error('En:', promise);
    console.error('Razón:', reason);
    console.error('='.repeat(50) + '\n');
    gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
    console.error('\n' + '='.repeat(50));
    console.error('EXCEPCIÓN NO CAPTURADA');
    console.error('='.repeat(50));
    console.error('Error:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(50) + '\n');
    gracefulShutdown('uncaughtException');
});

// Iniciar el servidor
startServer();