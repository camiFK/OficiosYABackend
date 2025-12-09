const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'OficiosYA API',
      version: '1.0.0',
      description:
        'Documentación interactiva de la API de OficiosYA. Incluye endpoints públicos y protegidos con JWT.',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Servidor principal',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, '../src/Routes/*.js'),
    path.join(__dirname, '../src/app.js'),
    path.join(__dirname, './*.js')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;