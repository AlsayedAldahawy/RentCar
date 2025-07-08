const swaggerJsdoc = require('swagger-jsdoc');

const isProduction = process.env.NODE_ENV === 'production';
const serverUrl = isProduction
  ? 'https://49b6812f-1b1d-4330-89e4-77a9606a47f6-00-l3n7sfutzk4d.janeway.replit.dev/api'   // Replit
  : 'http://localhost:3000/api';         // Development

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Rental API',
      version: '1.0.0',
      description: 'API for car rental system (users, companies, cars, bookings)',
    },
    servers: [
      {
        url: serverUrl,
        description: isProduction ? 'Production server' : 'Local server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
