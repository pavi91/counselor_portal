# Counselor Portal Backend

Node.js + Express + MySQL backend with layered architecture (routes → controllers → services → repositories).

## Architecture

```
src/
├── config/         # Database and environment configuration
├── middlewares/    # Auth middleware, error handlers
├── routes/         # API endpoint definitions
├── controllers/    # Request/response handlers
├── services/       # Business logic layer
└── repositories/   # Database access layer
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret

3. **Create database and tables**
   ```bash
   mysql -u your_user -p < sql/schema.sql
   mysql -u your_user -p < sql/seed.sql
   ```

4. **Start the server**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## Health Check

`GET /api/health` - Returns server status and database connection state

## API Overview

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/login` - Login with { email, password }
- `GET /auth/verify` - Verify JWT token (requires Bearer token)

### Users (Protected)
- `GET /users?q=search` - Search users
- `POST /users` - Create single user
- `POST /users/bulk` - Bulk create users
- `PATCH /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user

### Role Requests (Protected)
- `GET /role-requests` - Get all role requests
- `POST /role-requests` - Create role request
- `PATCH /role-requests/:id/process` - Approve/reject request

### Applications (Protected)
- `GET /applications` - Get all applications (sorted by points)
- `GET /applications/user/:userId` - Get user's application
- `POST /applications/user/:userId` - Submit/update application
- `PATCH /applications/:id/status` - Update application status

### Hostel (Protected)
- `GET /hostels` - List all hostel names
- `GET /hostels/stats?hostel=Name` - Get hostel statistics
- `GET /hostels/allocations` - Get all room allocations
- `GET /hostels/allocations/:userId` - Get student's allocation
- `POST /hostels/assign` - Assign room to student
- `DELETE /hostels/allocations/:userId` - Remove allocation
- `POST /hostels/rooms` - Create new room

### Tickets (Protected)
- `GET /tickets/student/:studentId` - Get student's tickets
- `GET /tickets/counselor/:counselorId` - Get counselor's tickets
- `POST /tickets` - Create new ticket
- `POST /tickets/:id/reply` - Reply to ticket
- `PATCH /tickets/:id/status` - Update ticket status

## Database Schema (1NF)

All tables follow First Normal Form:
- Atomic columns (no multi-valued attributes)
- No repeating groups
- Ticket messages stored in separate `ticket_messages` table
- Application files stored as individual columns

## Notes

- Seed data uses plain text passwords (`123`) for development
- Auth service supports both bcrypt hashes and plain text for backward compatibility
- All protected routes require JWT token in Authorization header
- Point calculation logic duplicated in frontend for preview and backend for verification
