const axios = require('axios');
const FormData = require('form-data');

class ImageService {
  // Subir imagen a ImgBB (almacenamiento en la nube)
  static async uploadToImgBB(file) {
    const apiKey = process.env.IMGBB_API_KEY;
    
    if (!apiKey) {
      throw new Error('IMGBB_API_KEY no está configurada en las variables de entorno');
    }

    if (!file || !file.buffer) {
      throw new Error('Archivo no válido o buffer no encontrado');
    }

    try {
      const formData = new FormData();
      formData.append('image', file.buffer.toString('base64'));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`, 
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 30000 // 30 segundos de timeout
        }
      );

      if (response.data && response.data.data && response.data.data.url) {
        return {
          url: response.data.data.url,
          deleteUrl: response.data.data.delete_url,
          displayUrl: response.data.data.display_url
        };
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten JPG, JPEG, PNG, WEBP');
    }

    if (file.size > maxSize) {
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
}

module.exports = { ImageService };