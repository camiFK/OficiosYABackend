const { IncomingForm } = require('formidable');
const path = require('path');

// Middleware para subir una sola imagen
const uploadSingleImage = (fieldName = 'image') => {
  return (req, res, next) => {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: (part) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif'
        ];
        return allowedMimes.includes(part.mimetype);
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        let errorMessage = 'Error al procesar la imagen';

        if (err.message && err.message.includes('maxFileSize')) {
          errorMessage = 'El archivo es muy grande. El tamaño máximo permitido es de 5MB.';
        } else if (err.message) {
          errorMessage = err.message;
        }

        return res.status(400).json({
          success: false,
          message: errorMessage
        });
      }

      req.files = files;
      req.body = fields;

      next();
    });
  };
};

// Middleware para subir múltiples imágenes
const uploadMultipleImages = (fieldName = 'imagenes', maxCount = 5) => {
  return (req, res, next) => {
    const form = new IncomingForm({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB por archivo
      maxTotalFileSize: 25 * 1024 * 1024, // 25MB total máximo
      filter: (part) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif'
        ];
        return allowedMimes.includes(part.mimetype);
      }
    });

    form.parse(req, (err, fields, files) => {
      // Verificar límite de archivos primero
      const fileArray = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]].filter(Boolean);
      if (fileArray.length > maxCount) {
        return res.status(400).json({
          success: false,
          message: `No se pueden subir más de ${maxCount} archivos. Máximo ${maxCount} archivos permitidos.`
        });
      }

      if (err) {
        let errorMessage = 'Error al procesar las imágenes';

        if (err.message && err.message.includes('maxFileSize')) {
          errorMessage = 'Uno o más archivos son muy grandes. El tamaño máximo permitido es de 5MB por archivo.';
        } else if (err.message && err.message.includes('maxTotalFileSize')) {
          errorMessage = 'El tamaño total de todos los archivos excede el límite máximo de 25MB.';
        } else if (err.message) {
          errorMessage = err.message;
        }

        return res.status(400).json({
          success: false,
          message: errorMessage
        });
      }

      req.files = files;
      req.body = fields;

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

  for (let file of Object.values(files)) {
    if (Array.isArray(file)) {
      file.forEach(f => validateSingleFile(f));
    } else if (file) {
      validateSingleFile(file);
    }
  }

  function validateSingleFile(file) {
    if (!file) return;

    // Validar extensión por nombre de archivo también
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = path.extname(file.originalFilename || file.name).toLowerCase();

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
  uploadMultiple: uploadMultipleImages
};