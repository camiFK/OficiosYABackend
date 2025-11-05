const express = require('express');
const cors = require('cors');

const UserRoutes = require('./Routes/UsuarioRoutes.js');
const RolRoutes = require('./Routes/RolRoutes.js');
const CategoriaRoutes = require('./Routes/CategoriaRoutes.js');
const AuthRoutes = require('./Routes/AuthRoutes.js');
const UbicacionRoutes = require('./Routes/UbicacionRoutes.js');
const PrestadorRoutes = require('./Routes/PrestadorRoutes.js');
const ClienteRoutes = require('./Routes/ClienteRoutes.js');
const ImageRoutes = require('./Routes/ImageRoutes.js'); 

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

app.use('/api/users', UserRoutes);
app.use('/api/roles', RolRoutes);
app.use('/api/categorias', CategoriaRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/ubicaciones', UbicacionRoutes);
app.use('/api/prestadores', PrestadorRoutes);
app.use('/api/clientes', ClienteRoutes);
app.use('/api/images', ImageRoutes);

const ResponseService = require('./Services/ResponseService');

app.get('/api/health', (req, res) => {
    ResponseService.status(res, 'healthy', {
        message: 'API de OficiosYA funcionando correctamente',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
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

// Importar manejador de errores
const ErrorHandler = require('./Middlewares/errorHandler');

// Aplicar middlewares de manejo de errores
ErrorHandler.getErrorHandlers().forEach(handler => {
    app.use(handler);
});

module.exports = app;