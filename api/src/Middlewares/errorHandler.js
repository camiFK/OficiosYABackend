// Middleware de manejo centralizado de errores

class ErrorHandler {
    
    // Maneja errores de validación de Sequelize
    static handleSequelizeError(error, req, res, next) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));
            
            return res.status(400).json({
                error: 'Datos de entrada inválidos',
                type: 'validation_error',
                validationErrors,
                timestamp: new Date().toISOString()
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path || 'campo';
            return res.status(409).json({
                error: `${field} ya está en uso`,
                type: 'unique_constraint_error',
                field: field,
                timestamp: new Date().toISOString()
            });
        }
        
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                error: 'Referencia inválida en los datos',
                type: 'foreign_key_error',
                timestamp: new Date().toISOString()
            });
        }
        
        if (error.name === 'SequelizeDatabaseError') {
            console.error('Database Error:', error);
            return res.status(500).json({
                error: 'Error en la base de datos',
                type: 'database_error',
                timestamp: new Date().toISOString()
            });
        }
        
        next(error);
    }
    
    // Maneja errores de JWT
    static handleJWTError(error, req, res, next) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                type: 'jwt_error',
                timestamp: new Date().toISOString()
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado. Inicie sesión nuevamente',
                type: 'jwt_expired_error',
                timestamp: new Date().toISOString()
            });
        }
        
        next(error);
    }
    
    // Maneja errores de Multer (subida de archivos)
    static handleMulterError(error, req, res, next) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es muy grande',
                type: 'file_size_error',
                maxSize: '5MB',
                timestamp: new Date().toISOString()
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Demasiados archivos',
                type: 'file_count_error',
                timestamp: new Date().toISOString()
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de archivo inesperado',
                type: 'unexpected_field_error',
                timestamp: new Date().toISOString()
            });
        }
        
        next(error);
    }
    
    // Registra errores para debugging
    static logError(error, req, res, next) {
        if (res.statusCode >= 500) {
            console.error('ERROR:', {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                userId: req.userId || 'anonymous',
                error: {
                    name: error.name,
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            });
        }
        
        next(error);
    }
    
    // Middleware final de manejo de errores
    static finalErrorHandler(error, req, res, next) {
        // Si ya se envió una respuesta, no hacer nada
        if (res.headersSent) {
            return next(error);
        }
        
        // Error 404 - Ruta no encontrada
        if (error.status === 404) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                type: 'not_found_error',
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        }
        
        // Error por defecto
        const statusCode = error.status || error.statusCode || 500;
        
        res.status(statusCode).json({
            error: statusCode >= 500 ? 'Error interno del servidor' : error.message || 'Error desconocido',
            type: 'internal_server_error',
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                details: error
            })
        });
    }
    
    // Crea error personalizado
    static createError(message, statusCode = 500, type = 'custom_error') {
        const error = new Error(message);
        error.status = statusCode;
        error.type = type;
        return error;
    }
    
    // Middleware para capturar errores async
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
    
    // Middleware completo de manejo de errores
    static getErrorHandlers() {
        return [
            this.handleSequelizeError,
            this.handleJWTError,
            this.handleMulterError,
            this.logError,
            this.finalErrorHandler
        ];
    }
}

module.exports = ErrorHandler;