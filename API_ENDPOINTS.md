# API Endpoints Summary

## Role-Based User Filtering (RECOMMENDED APPROACH)

### Get Users by Role
```
GET /api/users?role=student|counselor|staff|admin
GET /api/users?role=student&q=search_term
```

**Response**: Array of users with that role

**Example**:
```javascript
// Get only counselors
GET /api/users?role=counselor
[
  {
    "id": 2,
    "email": "counselor@uom.local",
    "name": "Dr. Nirosha Bandara",
    "role": "counselor",
    "index_number": null,
    "mobile_phone": null
  }
]
```

### Get All Users (Backward Compatible)
```
GET /api/users
GET /api/users?q=search_term
```

⚠️ **Note**: Returns all users. Use role filtering instead for better performance.

---

## User Management

### Create User
```
POST /api/users
Content-Type: application/json
{
  "email": "newuser@uom.local",
  "password": "123",
  "name": "John Doe",
  "role": "student"
}
```

### Update User Role
```
PATCH /api/users/:id/role
{
  "role": "counselor"
}
```

### Delete User
```
DELETE /api/users/:id
```

### Bulk Create Users
```
POST /api/users/bulk
{
  "users": [
    { "email": "...", "password": "...", "name": "...", "role": "..." }
  ]
}
```

---

## Authentication

### Login
```
POST /api/auth/login
{
  "email": "student@uom.local",
  "password": "123"
}
```

Response:
```json
{
  "user": {
    "id": 4,
    "email": "student@uom.local",
    "name": "Kasun Wijeratne",
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

---

## Applications

### Get User's Application
```
GET /api/applications/user/:userId
```

### Get All Applications (sorted by points)
```
GET /api/applications
```

### Submit/Update Application
```
POST /api/applications/user/:userId
{
  "fullName": "...",
  "indexNumber": "...",
  "distance": 120,
  "incomeRange": "below_100k",
  ...
}
```

### Update Application Status
```
PATCH /api/applications/:id/status
{
  "status": "approved|rejected|pending"
}
```

---

## Hostels

### Get Hostel Names
```
GET /api/hostels
→ ["Men's Hostel A", "Women's Hostel B"]
```

### Get Hostel Statistics
```
GET /api/hostels/stats
GET /api/hostels/stats?hostel=Men's Hostel A
```

### Get All Allocations
```
GET /api/hostels/allocations
```

### Get Student's Allocation
```
GET /api/hostels/allocations/:userId
```

### Assign Room to Student
```
POST /api/hostels/assign
{
  "userId": 4,
  "roomId": 101
}
```

### Remove Allocation
```
DELETE /api/hostels/allocations/:userId
```

### Create New Room
```
POST /api/hostels/rooms
{
  "hostel": "Men's Hostel A",
  "number": "301",
  "floor": 3,
  "capacity": 2,
  "type": "Double"
}
```

---

## Tickets

### Get Student's Tickets
```
GET /api/tickets/student/:studentId
```

### Get Counselor's Tickets
```
GET /api/tickets/counselor/:counselorId
```

### Create New Ticket
```
POST /api/tickets
{
  "studentId": 4,
  "counselorId": 2,
  "subject": "Academic concerns",
  "initialMessage": "I need help with..."
}
```

### Reply to Ticket
```
POST /api/tickets/:id/reply
{
  "senderId": 2,
  "message": "Here's my response..."
}
```

### Update Ticket Status
```
PATCH /api/tickets/:id/status
{
  "status": "open|closed"
}
```

---

## Role Requests

### Get All Role Requests
```
GET /api/role-requests
```

### Create Role Request
```
POST /api/role-requests
{
  "userId": 3,
  "message": "I want to become a counselor because..."
}
```

### Process Role Request
```
PATCH /api/role-requests/:id/process
{
  "action": "approved|rejected"
}
```

---

## Health Check

### Server Status
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-03T...",
  "database": "connected"
}
```

---

## Authentication

All endpoints except `/auth/login` and `/auth/verify` require:
```
Authorization: Bearer <jwt_token>
```

Token obtained from login endpoint.

---

## Response Format

All successful responses return the data directly (no wrapper):

```javascript
// ✅ Correct
[{ id: 1, name: "..." }]
{ id: 1, name: "..." }

// ❌ Incorrect
{ data: [{ id: 1, ... }] }
{ success: true, data: { ... } }
```

Errors return:
```json
{
  "message": "Error description"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable (DB down)
