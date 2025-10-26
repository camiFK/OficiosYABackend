const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Cliente = require('./Cliente');
const Prestador = require('./Prestador');
const Categoria = require('./Categoria');
const SolicitudServicio = require('./SolicitudServicio');
const Presupuesto = require('./Presupuesto');
const Calificacion = require('./Calificacion');
const Notificacion = require('./Notificacion');
const Reporte = require('./Reporte');
const Ubicacion = require('./Ubicacion');
const ImagenPrestador = require('./ImagenPrestador');
const ImagenSolicitud = require('./ImagenSolicitud');
const PrestadorCategoria = require('./PrestadorCategoria');
const AccionAdministrador = require('./AccionAdministrador');

// Initialize all models
Usuario.init(sequelize);
Rol.init(sequelize);
Categoria.init(sequelize);
Cliente.init(sequelize);
Prestador.init(sequelize);
SolicitudServicio.init(sequelize);
Presupuesto.init(sequelize);
Calificacion.init(sequelize);
Notificacion.init(sequelize);
Reporte.init(sequelize);
Ubicacion.init(sequelize);
ImagenPrestador.init(sequelize);
ImagenSolicitud.init(sequelize);
PrestadorCategoria.init(sequelize);
AccionAdministrador.init(sequelize);

// Define associations
// ========== USUARIO ==========
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });
Usuario.hasOne(Cliente, { foreignKey: 'id_usuario', as: 'cliente' });
Usuario.hasOne(Prestador, { foreignKey: 'id_usuario', as: 'prestador' });
Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario_destino', as: 'notificaciones' });
Usuario.hasMany(Reporte, { foreignKey: 'id_usuario_reportante', as: 'reportes_realizados' });
Usuario.hasMany(Reporte, { foreignKey: 'id_usuario_reportado', as: 'reportes_recibidos' });
Usuario.hasMany(AccionAdministrador, { foreignKey: 'id_admin', as: 'acciones_admin_ejecutadas' });
Usuario.hasMany(AccionAdministrador, { foreignKey: 'id_usuario_afectado', as: 'acciones_admin_recibidas' });

// ========== CLIENTE ==========
Cliente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Cliente.belongsTo(Ubicacion, { foreignKey: 'id_ubicacion', as: 'ubicacion' });
Cliente.hasMany(SolicitudServicio, { foreignKey: 'id_cliente', as: 'solicitudes' });
Cliente.hasMany(Calificacion, { foreignKey: 'id_cliente', as: 'calificaciones' });

// ========== PRESTADOR ==========
Prestador.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Prestador.belongsTo(Ubicacion, { foreignKey: 'id_ubicacion', as: 'ubicacion' });
Prestador.hasMany(ImagenPrestador, { foreignKey: 'id_prestador', as: 'imagenes' });
Prestador.hasMany(PrestadorCategoria, { foreignKey: 'id_prestador', as: 'categorias' });
Prestador.hasMany(Presupuesto, { foreignKey: 'id_prestador', as: 'presupuestos' });
Prestador.hasMany(Calificacion, { foreignKey: 'id_prestador', as: 'calificaciones' });

// ========== SOLICITUD_SERVICIO ==========
SolicitudServicio.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
SolicitudServicio.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });
SolicitudServicio.belongsTo(Ubicacion, { foreignKey: 'id_ubicacion', as: 'ubicacion' });
SolicitudServicio.hasMany(ImagenSolicitud, { foreignKey: 'id_solicitud', as: 'imagenes' });
SolicitudServicio.hasMany(Notificacion, { foreignKey: 'id_solicitud', as: 'notificaciones' });
SolicitudServicio.hasMany(Presupuesto, { foreignKey: 'id_solicitud', as: 'presupuestos' });
SolicitudServicio.hasOne(Calificacion, { foreignKey: 'id_solicitud', as: 'calificacion' });

// ========== CALIFICACION ==========
Calificacion.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
Calificacion.belongsTo(Prestador, { foreignKey: 'id_prestador', as: 'prestador' });
Calificacion.belongsTo(SolicitudServicio, { foreignKey: 'id_solicitud', as: 'solicitud' });

// ========== PRESUPUESTO ==========
Presupuesto.belongsTo(Prestador, { foreignKey: 'id_prestador', as: 'prestador' });
Presupuesto.belongsTo(SolicitudServicio, { foreignKey: 'id_solicitud', as: 'solicitud' });

// ========== NOTIFICACION ==========
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario_destino', as: 'usuario_destino' });
Notificacion.belongsTo(SolicitudServicio, { foreignKey: 'id_solicitud', as: 'solicitud' });

// ========== REPORTE ==========
Reporte.belongsTo(Usuario, { foreignKey: 'id_usuario_reportante', as: 'usuario_reportante' });
Reporte.belongsTo(Usuario, { foreignKey: 'id_usuario_reportado', as: 'usuario_reportado' });

// ========== IMAGENES ==========
ImagenPrestador.belongsTo(Prestador, { foreignKey: 'id_prestador', as: 'prestador' });
ImagenSolicitud.belongsTo(SolicitudServicio, { foreignKey: 'id_solicitud', as: 'solicitud' });

// ========== PRESTADOR_CATEGORIA ==========
PrestadorCategoria.belongsTo(Prestador, { foreignKey: 'id_prestador', as: 'prestador' });
PrestadorCategoria.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

// ========== ACCION_ADMINISTRADOR ==========
AccionAdministrador.belongsTo(Usuario, { foreignKey: 'id_admin', as: 'admin' });
AccionAdministrador.belongsTo(Usuario, { foreignKey: 'id_usuario_afectado', as: 'usuario_afectado' });

module.exports = {
    sequelize,
    Usuario,
    Rol,
    Categoria,
    Cliente,
    Prestador,
    SolicitudServicio,
    Presupuesto,
    Calificacion,
    Notificacion,
    Reporte,
    Ubicacion,
    ImagenPrestador,
    ImagenSolicitud,
    PrestadorCategoria,
    AccionAdministrador
};

