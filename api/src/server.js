require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const app = require('./app');
const sequelize  = require('./config/database');

const PORT = process.env.PORT || 3000;

let server;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log(`Conexión exitosa a: ${process.env.MYSQL_DATABASE}`);
        
        if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
            console.log('Sincronizando modelos de base de datos...');
            await sequelize.sync({ alter: false }); // alter: true solo para desarrollo
            console.log('Modelos sincronizados correctamente');
        }
        
        server = app.listen(PORT, () => {});
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Error: El puerto ${PORT} ya está en uso`);
                console.error('Solución: Cambia el puerto en .env o detener el otro proceso');
            } else {
                console.error('Error del servidor:', error.message);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('ERROR AL INICIAR EL SERVIDOR', error);  
   }
}

async function gracefulShutdown(signal) {
    
    if (server) {
        server.close(async () => {
            console.log('Servidor HTTP cerrado correctamente');       
            try {
                console.log('Cerrando conexión a base de datos...');
                await sequelize.close();
            } catch (error) {
                console.error('Error al cerrar la base de datos:', error);
                process.exit(1);
            }
        });
        
        setTimeout(() => {
            console.error('\n Tiempo de espera agotado. Forzando cierre...');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('PROMESA RECHAZADA NO MANEJADA');
    gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
    console.error('EXCEPCIÓN NO CAPTURADA');
    gracefulShutdown('uncaughtException');
});

startServer();