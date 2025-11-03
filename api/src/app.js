// Configuración de la aplicación Express
// Este archivo solo configura middlewares y rutas, no inicia el servidor

const express = require('express');
const cors = require('cors');

const UserRoutes = require('./Routes/UsuarioRoutes.js');
const RolRoutes = require('./Routes/RolRoutes.js');
const CategoriaRoutes = require('./Routes/CategoriaRoutes.js');
const AuthRoutes = require('./Routes/AuthRoutes.js');
const UbicacionRoutes = require('./Routes/UbicacionRoutes.js');
const PrestadorRoutes = require('./Routes/PrestadorRoutes.js');
const ClienteRoutes = require('./Routes/ClienteRoutes.js'); 

// Crear aplicación Express
const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path}`);
        next();
    });
}

// Rutas de la API
app.use('/api/users', UserRoutes);
app.use('/api/roles', RolRoutes);
app.use('/api/categorias', CategoriaRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/ubicaciones', UbicacionRoutes);
app.use('/api/prestadores', PrestadorRoutes);
app.use('/api/clientes', ClienteRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API de OficiosYA funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Error no manejado:');
    console.error('Ruta:', req.path);
    console.error('Método:', req.method);
    console.error('Error:', err);
    
    res.status(err.status || 500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;