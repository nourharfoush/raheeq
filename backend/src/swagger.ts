import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'منصة تحفيظ القرآن الكريم API',
      version: '1.0.0',
      description: 'واجهة برمجية متكاملة (RESTful API) لإدارة منصة تحفيظ القرآن الكريم، تدعم صلاحيات الأدوار المتعددة ومتابعة التسميع والحلقات.',
      contact: {
        name: 'دعم منصة تحفيظ',
        email: 'support@tahfez.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'خادم التطوير المحلي'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // Paths to APIs
  apis: ['./src/modules/**/*.ts', './src/server.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
