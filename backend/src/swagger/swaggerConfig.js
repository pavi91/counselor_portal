const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Counselor Portal API',
      version: '1.0.0',
      description: 'Complete REST API documentation for the Counselor Portal application. This API manages authentication, user management, hostel allocation, application processing, and support ticket systems.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['student', 'counselor', 'staff', 'admin'], example: 'student' },
            indexNumber: { type: 'string', example: '2021/CS/001' },
            fullName: { type: 'string', example: 'John Michael Doe' },
            nameWithInitials: { type: 'string', example: 'J.M. Doe' },
            permanentAddress: { type: 'string', example: '123 Main St' },
            residentPhone: { type: 'string', example: '0771234567' },
            mobilePhone: { type: 'string', example: '0712345678' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' }
          }
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            applicationData: { type: 'object', example: { field1: 'value1' } },
            submittedAt: { type: 'string', format: 'date-time' },
            reviewedAt: { type: 'string', format: 'date-time' },
            reviewNotes: { type: 'string', example: 'Application meets requirements' }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 1 },
            counselorId: { type: 'integer', example: 2 },
            title: { type: 'string', example: 'Hostel Room Issue' },
            description: { type: 'string', example: 'The room has water leakage' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved'], example: 'open' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Hostel: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'A1 Hostel' },
            type: { type: 'string', enum: ['male', 'female'], example: 'male' },
            capacity: { type: 'integer', example: 100 },
            occupancy: { type: 'integer', example: 85 }
          }
        },
        RoleRequest: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            requestedRole: { type: 'string', enum: ['counselor', 'staff', 'admin'], example: 'counselor' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            reason: { type: 'string', example: 'Want to help as counselor' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            message: { type: 'string', example: 'Detailed error message' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
