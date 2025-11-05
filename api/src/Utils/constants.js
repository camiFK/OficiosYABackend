// Constantes globales de la aplicación

module.exports = {
    // Estados de usuario
    USUARIO_ESTADOS: {
        ACTIVO: 'activo',
        INACTIVO: 'inactivo',
        BLOQUEADO: 'bloqueado'
    },
    
    // Roles de usuario
    ROLES: {
        ADMINISTRADOR: 'Administrador',
        CLIENTE: 'Cliente',
        PRESTADOR: 'Prestador'
    },
    
    // Estados de solicitud de servicio
    SOLICITUD_ESTADOS: {
        INICIADA: 'Iniciada',
        EN_PROCESO: 'En Proceso',
        FINALIZADA: 'Finalizada',
        CANCELADA: 'Cancelada'
    },
    
    // Estados de presupuesto
    PRESUPUESTO_ESTADOS: {
        PENDIENTE: 'pendiente',
        ACEPTADO: 'aceptado',
        RECHAZADO: 'rechazado',
        CANCELADO: 'cancelado'
    },
    
    // Estados de notificación
    NOTIFICACION_ESTADOS: {
        PENDIENTE: 'pendiente',
        ENVIADA: 'enviada',
        LEIDA: 'leida',
        ERROR: 'error'
    },
    
    // Tipos de notificación
    NOTIFICACION_TIPOS: {
        IN_APP: 'in-app',
        EMAIL: 'email',
        SMS: 'sms'
    },
    
    // Estados de reporte
    REPORTE_ESTADOS: {
        PENDIENTE: 'pendiente',
        EN_REVISION: 'en_revision',
        RESUELTO: 'resuelto',
        RECHAZADO: 'rechazado'
    },
    
    // Límites de archivos
    FILE_LIMITS: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        MAX_FILES: 10,
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    },
    
    // Límites de texto
    TEXT_LIMITS: {
        TITULO_MIN: 5,
        TITULO_MAX: 100,
        DESCRIPCION_MIN: 10,
        DESCRIPCION_MAX: 1000,
        NOMBRE_MIN: 2,
        NOMBRE_MAX: 100,
        COMENTARIO_MAX: 500
    },
    
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },
    
    // Configuración de JWT
    JWT: {
        DEFAULT_EXPIRATION: '24h',
        RESET_TOKEN_EXPIRATION: '1h'
    },
    
    // Códigos de respuesta HTTP más comunes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500
    },
    
    // Mensajes de error comunes
    ERROR_MESSAGES: {
        USER_NOT_FOUND: 'Usuario no encontrado',
        INVALID_CREDENTIALS: 'Credenciales inválidas',
        ACCESS_DENIED: 'Acceso denegado',
        EXPIRED_TOKEN: 'Token expirado',
        INVALID_TOKEN: 'Token inválido',
        RESOURCE_NOT_FOUND: 'Recurso no encontrado',
        VALIDATION_ERROR: 'Error de validación',
        INTERNAL_ERROR: 'Error interno del servidor',
        UNAUTHORIZED: 'No autorizado',
        FORBIDDEN: 'Prohibido'
    },
    
    // Mensajes de éxito comunes
    SUCCESS_MESSAGES: {
        USER_CREATED: 'Usuario creado exitosamente',
        USER_UPDATED: 'Usuario actualizado exitosamente',
        USER_DELETED: 'Usuario eliminado exitosamente',
        LOGIN_SUCCESS: 'Inicio de sesión exitoso',
        LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
        DATA_RETRIEVED: 'Datos obtenidos exitosamente',
        OPERATION_SUCCESS: 'Operación completada exitosamente'
    },
    
    // Configuración de rate limiting (estaria bueno implementarlo si llegamos con el tiempo)
    RATE_LIMIT: {
        LOGIN_ATTEMPTS: 5,
        LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutos
        API_CALLS: 100,
        API_WINDOW: 15 * 60 * 1000 // 15 minutos
    },
    
    // Configuración de email
    EMAIL: {
        TEMPLATES: {
            WELCOME: 'welcome',
            PASSWORD_RESET: 'password_reset',
            NOTIFICATION: 'notification'
        }
    }
};