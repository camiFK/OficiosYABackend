// Servicio para estandarizar respuestas de la API

class ResponseService {
    
    // Respuesta exitosa genérica
    static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
        const response = {
            success: true,
            message,
            timestamp: new Date().toISOString()
        };
        
        if (data !== null) {
            response.data = data;
        }
        
        return res.status(statusCode).json(response);
    }
    
    // Respuesta de error genérica
    static error(res, message = 'Ha ocurrido un error', statusCode = 500, errorType = 'internal_error') {
        return res.status(statusCode).json({
            success: false,
            error: message,
            type: errorType,
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta de validación fallida
    static validationError(res, errors, message = 'Datos de entrada inválidos') {
        return res.status(400).json({
            success: false,
            error: message,
            type: 'validation_error',
            validationErrors: errors,
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta de recurso no encontrado
    static notFound(res, resource = 'Recurso', message = null) {
        return res.status(404).json({
            success: false,
            error: message || `${resource} no encontrado`,
            type: 'not_found_error',
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta de acceso no autorizado
    static unauthorized(res, message = 'No autorizado') {
        return res.status(401).json({
            success: false,
            error: message,
            type: 'unauthorized_error',
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta de permisos insuficientes
    static forbidden(res, message = 'Permisos insuficientes') {
        return res.status(403).json({
            success: false,
            error: message,
            type: 'forbidden_error',
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta de conflicto
    static conflict(res, message = 'El recurso ya existe') {
        return res.status(409).json({
            success: false,
            error: message,
            type: 'conflict_error',
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta de datos creados exitosamente
    static created(res, data = null, message = 'Recurso creado exitosamente') {
        return this.success(res, data, message, 201);
    }

    // Respuesta para listas paginadas
    static paginated(res, data, pagination, message = 'Datos obtenidos exitosamente') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages || Math.ceil(pagination.total / pagination.limit),
                hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
                hasPrev: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta para operaciones de login exitosas
    static loginSuccess(res, userData, token, redirectUrl = null) {
        const response = {
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                user: userData,
                token,
                expiresIn: '24h'
            },
            timestamp: new Date().toISOString()
        };
        
        if (redirectUrl) {
            response.data.redirectUrl = redirectUrl;
        }
        
        return res.status(200).json(response);
    }

    // Respuesta para logout exitoso
    static logoutSuccess(res) {
        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente',
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta para actualizaciones exitosas
    static updated(res, data = null, message = 'Recurso actualizado exitosamente') {
        return this.success(res, data, message, 200);
    }
    
    // Respuesta para eliminaciones exitosas
    static deleted(res, message = 'Recurso eliminado exitosamente') {
        return res.status(200).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }

    // Respuesta para operaciones que no modifican datos (como health checks)
    static status(res, status, data = null) {
        return res.status(200).json({
            success: true,
            status,
            data,
            timestamp: new Date().toISOString()
        });
    }
    
    // Respuesta de error interno del servidor

    static serverError(res, message = 'Error interno del servidor') {
        return res.status(500).json({
            success: false,
            error: message,
            type: 'server_error',
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = ResponseService;