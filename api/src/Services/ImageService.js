const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ImageService {
  // Subir imagen a ImgBB (almacenamiento en la nube)
  static async uploadToImgBB(file) {
    const apiKey = process.env.IMGBB_API_KEY;
    
    if (!apiKey) {
      throw new Error('IMGBB_API_KEY no está configurada en las variables de entorno');
    }

    if (!file) {
      throw new Error('Archivo no válido');
    }

    let buffer;
    if (file.buffer) {
      // Multer style
      buffer = file.buffer;
    } else if (file.filepath) {
      // Formidable style
      buffer = fs.readFileSync(file.filepath);
    } else {
      throw new Error('Archivo no válido o buffer no encontrado');
    }

    try {
      const formData = new FormData();
      formData.append('image', buffer.toString('base64'));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`, 
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 60000 // 60 segundos de timeout
        }
      );

      if (response.data && response.data.data && response.data.data.url) {
        // El controller espera solo la URL como string
        return response.data.data.url;
      } else {
        throw new Error('Respuesta inválida de ImgBB');
      }

    } catch (error) {
      console.error('Error subiendo a ImgBB:', error.response?.data || error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout al subir imagen - intenta con una imagen más pequeña');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Archivo no válido o demasiado grande para ImgBB');
      }
      
      throw new Error('Error al subir imagen: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  // Validar imagen antes de subir
  static validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    const mimetype = file.mimetype || file.type;
    const size = file.size;

    if (!allowedTypes.includes(mimetype)) {
      throw new Error(`Tipo de archivo no permitido: ${mimetype}. Solo se permiten JPG, JPEG, PNG, WEBP, GIF`);
    }

    if (size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB');
    }

    return true;
  }

  // Procesar múltiples imágenes para subir a ImgBB
  static async uploadMultipleToImgBB(files) {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map(async (file) => {
      try {
        this.validateImage(file);
        return await this.uploadToImgBB(file);
      } catch (error) {
        throw new Error(`Error en archivo ${file.originalname}: ${error.message}`);
      }
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }
  }

  // Obtener información de imagen desde URL de ImgBB
  static getImageInfoFromUrl(url) {
    if (!url) return null;
    
    // Extraer ID de imagen de ImgBB desde la URL
    const match = url.match(/\/([^\/]+)$/);
    const filename = match ? match[1] : 'imagen';
    
    return {
      url: url,
      filename: filename,
      isExternal: true,
      provider: 'imgbb'
    };
  }

  // Validar que la URL sea de ImgBB
  static isImgBBUrl(url) {
    return url && (url.includes('ibb.co') || url.includes('imgbb.com'));
  }

  // Extraer ID de imgbb de la URL
  static extractImgbbId(url) {
    const match = url.match(/\/([a-zA-Z0-9]+)\/[^\/]+\.jpg$/);
    return match ? match[1] : null;
  }

  // Eliminar imagen de imgbb
  static async deleteFromImgbb(imgbbId) {
    const apiKey = process.env.IMGBB_API_KEY;
    const deleteUrl = `https://api.imgbb.com/1/delete/${imgbbId}?key=${apiKey}`;
    
    try {
      const response = await axios.delete(deleteUrl);
      if (response.status !== 200) {
        console.warn('Error eliminando de imgbb:', response.data);
      }
    } catch (error) {
      console.error('Error en deleteFromImgbb:', error);
    }
  }
}

module.exports = ImageService;