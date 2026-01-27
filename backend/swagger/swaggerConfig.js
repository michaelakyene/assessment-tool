const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Assessment API',
      version: '1.0.0',
      description: 'API documentation for the Student Assessment System',
      contact: {
        name: 'API Support',
        email: 'support@assessment.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.assessment-system.com',
        description: 'Production server'
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
        User: require('./schemas/authSchemas').User,
        Quiz: require('./schemas/quizSchemas').Quiz,
        Attempt: require('./schemas/attemptSchemas').Attempt
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

module.exports = swaggerJsdoc(swaggerOptions);