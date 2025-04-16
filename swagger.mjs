// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Q&A API',
      version: '1.0.0',
      description: 'API docs for questions, answers and voting system',
    },
  },
  apis: ['./routes/questionsRoutes.mjs', './routes/answersRoutes.mjs', './routes/voteAnswerRoutes.mjs'], // location of route files
};

const swaggerSpec = swaggerJsdoc(options);

export default { swaggerUi, swaggerSpec };
