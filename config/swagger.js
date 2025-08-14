const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node.js MySQL API',
            version: '1.0.0',
            description: 'A simple CRUD API built with Node.js, Express, and MySQL',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Auto-generated user ID',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'john@example.com'
                        },
                        age: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 150,
                            description: 'User age',
                            example: 30
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp',
                            example: '2023-01-15T10:30:00Z'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User last update timestamp',
                            example: '2023-01-15T10:30:00Z'
                        }
                    }
                },
                UserInput: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'User full name',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'john@example.com'
                        },
                        age: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 150,
                            description: 'User age',
                            example: 30
                        }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Operation completed successfully'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};