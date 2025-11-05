const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento en memoria
const memoryStorage = multer.memoryStorage();

// Filtro para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'), false);
  }
};

// Configuraciones de multer
const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 5 // máximo 5 archivos
  },
  fileFilter: fileFilter
});

// Solo usamos memoria storage para subir a ImgBB
const upload = memoryUpload;

// Middleware para subir una sola imagen
const uploadSingleImage = (fieldName = 'imagen') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (error) => {
      if (error) {
        console.error('Error en uploadSingleImage:', error.message);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'El archivo es muy grande. Máximo 5MB permitido.'
            });
          }
          if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Campo de archivo inesperado.'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message || 'Error al procesar la imagen'
        });
      }
      
      next();
    });
  };
};

// Middleware para subir múltiples imágenes
const uploadMultipleImages = (fieldName = 'imagenes', maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (error) => {
      if (error) {
        console.error('Error en uploadMultipleImages:', error.message);
        
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'Uno o más archivos son muy grandes. Máximo 5MB por archivo.'
            });
          }
          if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Demasiados archivos. Máximo ${maxCount} archivos permitidos.`
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: error.message || 'Error al procesar las imágenes'
        });
      }
      
      next();
    });
  };
};

// Middleware de validación adicional
const validateImageFile = (req, res, next) => {
  // Validar que se haya subido al menos un archivo
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No se encontró ningún archivo de imagen'
    });
  }

  // Validación adicional si es necesario
  const files = req.files || [req.file];
  
  for (let file of files) {
    if (!file) continue;
    
    // Validar extensión por nombre de archivo también
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `Extensión de archivo no válida: ${fileExtension}. Permitidas: ${allowedExtensions.join(', ')}`
      });
    }
  }

  next();
};

// Middleware para logging de archivos subidos
const logUploadedFiles = (req, res, next) => {
  next();
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  validateImageFile,
  logUploadedFiles,
  upload: uploadSingleImage,
  uploadSingle: uploadSingleImage,
  uploadMultiple: uploadMultipleImages,
  memoryUpload: memoryUpload
};