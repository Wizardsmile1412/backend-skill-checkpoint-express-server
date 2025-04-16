# Questionnaire API

## Description
A RESTful API for managing questions, answers, and voting functionality. This API allows users to create, retrieve, update, and delete questions and answers, as well as search for questions and vote on both questions and answers.

## Features
- Complete question management with CRUD operations
- Answer management for questions
- Voting system for both questions and answers
- Search functionality to find questions by title or category
- API documentation with Swagger UI
- PostgreSQL database for data persistence

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Development**: Nodemon
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [PostgreSQL](https://www.postgresql.org/) (v13 or later recommended)
- [npm](https://www.npmjs.com/) 

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/questionnaire-api.git
   cd questionnaire-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Database configuration
   The project uses a PostgreSQL connection string:
   ```javascript
   // In db.js
   const connectionString = "postgres://your_username:your_password@your_host:your_port/your_database"
   ```

## Usage

### Starting the Application
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000` (or the port specified in your configuration).

### API Endpoints

#### Questions API
- `GET /questions` - Get all questions
- `GET /questions/:questionId` - Get a specific question by ID
- `POST /questions` - Create a new question
- `PUT /questions/:questionId` - Update a question
- `DELETE /questions/:questionId` - Delete a question

#### Questions Search API
- `GET /questions/search` - Search questions by title or category (query parameters)

#### Answers API
- `GET /questions/:questionId/answers` - Get all answers for a specific question
- `POST /questions/:questionId/answers` - Create a new answer for a specific question
- `DELETE /questions/:questionId/answers` - Delete answers for a specific question

#### Vote API
- `POST /answers/:answerId/vote` - Create a new vote for a specific answer
- `POST /questions/:questionId/vote` - Create a new vote for a specific question

### API Documentation
This project includes Swagger documentation for easy API exploration and testing.

- Access the Swagger UI at: `http://localhost:4000/api-docs`
- The API documentation provides detailed information about all endpoints, request parameters, and responses.

## Project Structure
```
project-root/
├── middlewares/            # Request validation middleware
│   ├── answerValidate.mjs
│   ├── questionValidate.mjs
│   ├── searchQueryValidate.mjs
│   └── voteValidate.mjs
├── node_modules/           # Project dependencies
├── routes/                 # API routes
│   ├── answersRoutes.mjs
│   ├── questionsRoutes.mjs
│   └── voteAnswerRoutes.mjs
├── utils/                  # Utility functions
│   └── db.mjs              # Database connection setup
├── .gitignore              # Git ignore file
├── app.mjs                 # Express application setup
├── package-lock.json       # Dependency lock file
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── swagger.mjs             # Swagger configuration
```

## Swagger Documentation

This project uses Swagger for API documentation. The setup includes:

1. `swagger-jsdoc` for generating API specifications from JSDoc comments
2. `swagger-ui-express` for serving the Swagger UI

## Development

To modify or extend this API:

1. Add new routes in the routes directory
2. Create validation middleware in the middlewares directory
3. Update Swagger documentation in swagger.mjs or in route files

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments
- Express.js for the web framework
- Swagger for API documentation
- pg for PostgreSQL integration
