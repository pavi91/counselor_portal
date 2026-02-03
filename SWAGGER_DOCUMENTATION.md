# Swagger API Documentation Setup

## Overview

This backend now includes comprehensive Swagger/OpenAPI 3.0 documentation that automatically generates interactive API documentation when the server starts.

## Accessing the Documentation

Once the backend server is running, you can access the Swagger UI at:

```
http://localhost:5000/api/docs
```

## Features

### 1. Complete API Documentation
- All endpoints fully documented with descriptions
- Request and response schemas
- Example values for each parameter
- Required vs optional fields clearly marked

### 2. Interactive Testing
- Test endpoints directly from the Swagger UI
- No need for external tools like Postman
- See real responses from your API
- Automatic authorization header handling

### 3. Authentication Support
- JWT Bearer token authentication pre-configured
- Click "Authorize" button to input your JWT token
- Token automatically included in all subsequent requests

### 4. Schema Definitions
Reusable component schemas for:
- **User**: User profile information with all fields
- **Application**: Application status and data
- **Ticket**: Support ticket information
- **Hostel**: Hostel details and capacity
- **RoleRequest**: Role change request data
- **Error**: Standard error response format

## File Structure

```
backend/src/
├── swagger/
│   └── swaggerConfig.js          # Swagger configuration and setup
├── routes/
│   ├── authRoutes.js             # Authentication endpoints
│   ├── userRoutes.js             # User management endpoints
│   ├── applicationRoutes.js       # Application endpoints
│   ├── hostelRoutes.js           # Hostel endpoints
│   ├── ticketRoutes.js           # Support ticket endpoints
│   └── roleRequestRoutes.js       # Role request endpoints
└── app.js                         # Express app with Swagger UI setup
```

## API Endpoints Documentation

### Authentication (`/api/auth`)
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/verify` - Verify JWT token

### Users (`/api/users`)
- **GET** `/api/users` - Get users list (with optional role filter)
- **POST** `/api/users` - Create new user
- **POST** `/api/users/bulk` - Bulk create users from CSV
- **PATCH** `/api/users/{id}/role` - Update user role
- **DELETE** `/api/users/{id}` - Delete user

### Applications (`/api/applications`)
- **GET** `/api/applications` - Get all applications
- **GET** `/api/applications/user/{userId}` - Get user's application
- **POST** `/api/applications/user/{userId}` - Submit application
- **PATCH** `/api/applications/{id}/status` - Update application status

### Hostels (`/api/hostels`)
- **GET** `/api/hostels` - Get all hostels
- **GET** `/api/hostels/stats` - Get hostel statistics
- **GET** `/api/hostels/allocations` - Get all allocations
- **GET** `/api/hostels/allocations/{userId}` - Get student's hostel details
- **POST** `/api/hostels/assign` - Assign room to student
- **DELETE** `/api/hostels/allocations/{userId}` - Remove allocation
- **POST** `/api/hostels/rooms` - Create new room

### Tickets (`/api/tickets`)
- **GET** `/api/tickets/student/{studentId}` - Get student's tickets
- **GET** `/api/tickets/counselor/{counselorId}` - Get counselor's tickets
- **POST** `/api/tickets` - Create new ticket
- **POST** `/api/tickets/{id}/reply` - Reply to ticket
- **PATCH** `/api/tickets/{id}/status` - Update ticket status

### Role Requests (`/api/role-requests`)
- **GET** `/api/role-requests` - Get role requests
- **POST** `/api/role-requests` - Create role request
- **PATCH** `/api/role-requests/{id}/process` - Process role request

## Swagger Configuration

The Swagger setup is configured in [src/swagger/swaggerConfig.js](src/swagger/swaggerConfig.js) with:

```javascript
{
  "openapi": "3.0.0",
  "info": {
    "title": "Counselor Portal API",
    "version": "1.0.0",
    "description": "Complete REST API documentation..."
  },
  "servers": [
    {
      "url": "http://localhost:5000",
      "description": "Development server"
    }
  ]
}
```

### JSDoc Comments in Routes

Each route file contains JSDoc comments that define:
- Endpoint path and HTTP method
- Description of what the endpoint does
- Tags for grouping endpoints
- Request body schema
- Query/path parameters
- Response schemas with status codes
- Authentication requirements

Example:
```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users list
 *     description: Retrieve list of users...
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 */
```

## Using Swagger UI

### 1. Start the Server
```bash
cd backend
npm run dev
```

### 2. Open Swagger UI
Navigate to `http://localhost:5000/api/docs`

### 3. Authenticate
- Click the "Authorize" button
- Paste your JWT token from login response
- Click "Authorize"

### 4. Test Endpoints
- Click on any endpoint to expand it
- Click "Try it out"
- Fill in required parameters
- Click "Execute"
- See the response in real-time

## Example: Testing Login Endpoint

1. Expand "POST /api/auth/login"
2. Click "Try it out"
3. Enter email and password in the request body:
   ```json
   {
     "email": "student@example.com",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. Copy the returned JWT token

## Example: Using JWT for Authenticated Requests

1. Click "Authorize" button in top right
2. Enter: `Bearer eyJhbGciOiJIUzI1NiIs...` (your JWT token)
3. Click "Authorize"
4. Now test any protected endpoint (e.g., GET /api/users)
5. Token will automatically be included in requests

## Adding New Endpoints to Swagger

When adding new routes, include JSDoc comments:

```javascript
/**
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Get resource by ID
 *     description: Fetch a specific resource
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource found
 *       404:
 *         description: Resource not found
 */
router.get('/:id', authMiddleware, controller.getById);
```

## Swagger Configuration in app.js

The Swagger UI is mounted at `/api/docs`:

```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,  // Keeps auth token between page reloads
    displayOperationId: false,
    filter: true,
    showRequestHeaders: true
  }
}));
```

## Benefits

1. **No Additional Documentation Needed** - Swagger serves as your API documentation
2. **Always Up-to-Date** - Documentation auto-generated from code
3. **Interactive Testing** - Test endpoints without Postman/curl
4. **Developer Experience** - Frontend developers can explore API easily
5. **Beautiful UI** - Professional looking API documentation
6. **Schema Validation** - Ensures consistent request/response formats

## Production Considerations

To deploy Swagger documentation to production:

1. Keep Swagger available for team collaboration
2. Or disable in production by conditional setup:
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   }
   ```

3. Consider protecting with authentication:
   ```javascript
   app.use('/api/docs', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   ```

## Troubleshooting

### Swagger UI not loading
- Ensure packages are installed: `npm install swagger-jsdoc swagger-ui-express`
- Check that swagger config file exists: `src/swagger/swaggerConfig.js`
- Verify app.js has Swagger UI setup

### Endpoints not showing up
- Check JSDoc comments in route files
- Ensure route file path is correct in `swaggerConfig.js` (currently: `'./src/routes/*.js'`)
- Run server and check console for any errors

### Authorization not working
- Click "Authorize" button
- Enter full token: `Bearer <your-jwt-token>`
- Ensure token is valid (not expired)

## Next Steps

- Test the API endpoints through Swagger UI
- Share Swagger URL with frontend team
- Update endpoint documentation as API evolves
- Consider adding rate limiting and API versioning
