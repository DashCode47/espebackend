import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ESPEConnect API',
      version: '1.0.0',
      description: 'API para ESPEConnect - Red social para estudiantes ESPE',
      contact: {
        name: 'ESPEConnect Team',
        email: 'support@especonnect.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.especonnect.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            profile: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            targetUserId: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'matched', 'rejected'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            type: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Promotion: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string', enum: ['FOOD', 'DRINKS', 'EVENTS', 'PARTIES', 'OTHER'] },
            imageUrl: { type: 'string' },
            discount: { type: 'number', description: 'Porcentaje de descuento' },
            validUntil: { type: 'string', format: 'date-time', description: 'Fecha de expiración' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['title', 'description', 'category', 'validUntil']
        },
        Banner: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            imageUrl: { type: 'string' },
            link: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            status: { type: 'number' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const specs = swaggerJsdoc(options); 