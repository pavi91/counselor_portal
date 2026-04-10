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
        email: 'pavimeth2@gmail.com'
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
            points: { type: 'number', example: 42.5 },
            submissionDate: { type: 'string', format: 'date', example: '2026-03-13' },
            fullName: { type: 'string', example: 'Kasun Wijeratne' },
            indexNumber: { type: 'string', example: 'ST-2024-004' },
            permanentAddress: { type: 'string', example: '45 Temple Road, Kandy' },
            email: { type: 'string', example: 'student@uom.local' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
            mobilePhone: { type: 'string', example: '0771234567' },
            district: { type: 'string', example: 'Kandy' },
            closestTown: { type: 'string', example: 'Peradeniya' },
            distanceToTown: { type: 'number', example: 3.2 },
            distance: { type: 'number', example: 120.5 },
            faculty: { type: 'string', example: 'Engineering' },
            department: { type: 'string', example: 'Computer Science' },
            year: { type: 'string', example: '2' },
            incomeRange: { type: 'string', example: '150k_200k' },
            hostelPref: { type: 'string', example: 'A Hostel' },
            fileResidence: { type: 'string', example: '/filestore/residence.pdf' },
            fileIncome: { type: 'string', example: '/filestore/income.pdf' }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            student_id: { type: 'integer', example: 1 },
            counselor_id: { type: 'integer', example: 2 },
            subject: { type: 'string', example: 'Hostel Room Issue' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved'], example: 'open' },
            created_at: { type: 'string', example: '2026-03-13' },
            studentName: { type: 'string', example: 'Kasun Wijeratne' },
            counselorName: { type: 'string', example: 'Dr. Nirosha Bandara' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer', example: 1 },
                  sender_id: { type: 'integer', example: 1 },
                  text: { type: 'string', example: 'Please help with this issue.' },
                  attachment: { type: 'string', example: '/filestore/ticket-1.png' },
                  created_at: { type: 'string', example: '3/13/2026, 10:05:00 AM' }
                }
              }
            }
          }
        },
        Hostel: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'A1 Hostel' },
            gender: { type: 'string', example: 'male' },
            yearGroup: { type: 'string', example: 'final_year' }
          }
        },
        RoleRequest: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            message: { type: 'string', example: 'I would like to become a counselor.' },
            attachment: { type: 'string', example: '/filestore/role-request-proof.pdf' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            created_at: { type: 'string', format: 'date', example: '2026-03-13' }
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
