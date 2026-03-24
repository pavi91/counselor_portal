# Counselor Portal - Complete Documentation

A comprehensive student counselor management system with hostel allocation, application processing, and support ticket management.

**Status**: ✅ Production Ready | **Backend RBAC**: ✅ Fully Implemented | **API Documentation**: ✅ Complete

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Documentation Map](#documentation-map)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)

> **New to the codebase?** Start with [CODEBASE_OVERVIEW.md](./CODEBASE_OVERVIEW.md) for a focused explanation of the directory structure, key technologies, and architectural patterns.

---

## 🎯 Project Overview

The Counselor Portal is a full-stack application designed to manage student hostel allocations, process applications, and provide support ticket functionality. It features:

- **Role-Based Access Control (RBAC)** - Backend enforced permission system
- **Database-Driven Permissions** - 26 permissions across 4 roles
- **RESTful API** - 27 fully documented endpoints with Swagger/OpenAPI
- **Secure Authentication** - JWT token-based with bcrypt password hashing
- **Normalized Database** - 1NF MySQL database with proper relationships

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd counselor_portal

# Backend setup
cd backend
npm install
mysql -u db_user -p < sql/schema.sql
mysql -u db_user -p < sql/seed.sql

# Frontend setup
cd ../frontend
npm install

# Start backend
cd ../backend
npm run dev
# Backend runs on http://localhost:5000

# Start frontend (new terminal)
cd ../frontend
npm run dev
# Frontend runs on http://localhost:5173

# View API documentation
# Open http://localhost:5000/api/docs
```

### Default Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@uom.local | 123 | Admin |
| staff@uom.local | 123 | Staff |
| counselor@uom.local | 123 | Counselor |
| student@uom.local | 123 | Student |

---

## 📚 Documentation Map

### Getting Started

#### [CODEBASE_OVERVIEW.md](./CODEBASE_OVERVIEW.md) ⭐ NEW TO THE CODEBASE? START HERE
Focused developer orientation guide.
- What the application does
- Annotated directory structure (backend + frontend)
- Full technology stack with versions
- Layered architecture and request lifecycle diagrams
- Database schema summary
- Key files to read first
- Local development commands

#### [README (Backend)](./backend/README.md)
Backend-specific setup and development guide.
- Backend project structure
- Database setup
- Running the server
- Environment configuration

#### [README (Frontend)](./frontend/README.md)
Frontend-specific setup and development guide.
- Frontend project structure
- Building and deployment
- Development workflow

---

### API Documentation

#### [SWAGGER_DOCUMENTATION.md](./SWAGGER_DOCUMENTATION.md) ⭐ START HERE
Complete interactive API documentation guide.
- How to access Swagger UI at `/api/docs`
- All 27 endpoints documented
- Schema definitions for request/response
- JWT authentication setup
- Testing endpoints directly in browser

**Access at**: `http://localhost:5000/api/docs`

#### [API_ENDPOINTS.md](./API_ENDPOINTS.md)
Comprehensive endpoint reference with full details.
- All endpoints by category (Auth, Users, Applications, Hostels, Tickets, Roles)
- Request/response examples
- Status codes and error handling
- Permission requirements for each endpoint

#### [API_RESPONSE_SPEC.md](./API_RESPONSE_SPEC.md)
API response specifications and standards.
- What fields each endpoint returns
- Why sensitive fields are excluded
- Response format standards
- Best practices for API responses

---

### Integration Documentation

#### [INTEGRATION.md](./INTEGRATION.md)
Frontend-backend integration guide.
- How frontend communicates with backend
- API client setup with axios
- Authentication token management
- Request/response interceptors
- Error handling patterns

#### [ROLE_BASED_FILTERING.md](./ROLE_BASED_FILTERING.md)
Role-based filtering implementation guide.
- Filtering users by role (student, counselor, staff, admin)
- Query parameter usage: `?role=counselor`
- Why client-side filtering was replaced with server-side filtering
- Performance improvements

---

### RBAC (Role-Based Access Control) Documentation

Start with the Quick Reference, then dive deeper as needed.

#### [RBAC_QUICK_REFERENCE.md](./RBAC_QUICK_REFERENCE.md) ⭐ TL;DR VERSION
Quick 5-minute overview of the RBAC system.
- What RBAC is and why it matters
- 4 roles and their permissions
- How to test permissions
- Common issues and solutions

#### [RBAC_SETUP.md](./RBAC_SETUP.md)
Practical setup and testing guide.
- Database setup instructions
- Testing scenarios with examples
- Managing permissions in database
- Troubleshooting permission issues
- Testing with curl commands

#### [RBAC_IMPLEMENTATION.md](./RBAC_IMPLEMENTATION.md) ⭐ DETAILED TECHNICAL GUIDE
Deep dive into RBAC implementation.
- Database schema explanation
- Permission repository functions
- RBAC middleware implementation
- How permission checks work
- Adding new permissions and roles
- Permission management examples
- Security best practices

#### [RBAC_ARCHITECTURE.md](./RBAC_ARCHITECTURE.md)
Architecture diagrams and visual flows.
- System architecture diagram
- Database permission model
- Permission assignment examples
- Request flow with RBAC
- Permission check decision tree
- Permission matrix by role
- Middleware execution order

#### [RBAC_COMPLETE.md](./RBAC_COMPLETE.md)
Complete implementation summary.
- What was implemented
- Access control flow
- Key features
- File changes summary
- Comparison: before vs after
- Security benefits

#### [RBAC_IMPLEMENTATION_COMPLETE.md](./RBAC_IMPLEMENTATION_COMPLETE.md)
Final summary and conclusion.
- Your question vs what was delivered
- Complete feature list
- Testing the system
- Database queries for verification
- Next steps

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────┐
│      Frontend (React + Vite)         │
│   - Role-based UI components         │
│   - Permission-aware actions         │
└──────────────┬──────────────────────┘
               │ HTTP Requests (JWT)
               ↓
┌──────────────────────────────────────────┐
│      Backend (Express.js + MySQL)        │
│ ┌────────────────────────────────────┐   │
│ │   Layers (MVC Pattern)             │   │
│ │  Routes → Controllers → Services   │   │
│ │  → Repositories → Database         │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │  Middleware Stack                  │   │
│ │  1. Auth Middleware (JWT)          │   │
│ │  2. RBAC Middleware (Permissions)  │   │
│ │  3. Business Logic (Controllers)   │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │  27 Protected API Endpoints        │   │
│ │  - Users (5)                       │   │
│ │  - Applications (4)                │   │
│ │  - Hostels (7)                     │   │
│ │  - Tickets (5)                     │   │
│ │  - Role Requests (3)               │   │
│ │  - Auth (2) - Public               │   │
│ │  - Health (1) - Public             │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│   MySQL Database (1NF)           │
│  - Permissions Table             │
│  - Roles Table                   │
│  - Role-Permissions Junction     │
│  - Users, Applications, Hostels  │
│  - Tickets, Rooms, Allocations   │
└──────────────────────────────────┘
```

### Layered Architecture

```
Routes Layer
├─ userRoutes.js (5 endpoints + RBAC)
├─ applicationRoutes.js (4 endpoints + RBAC)
├─ hostelRoutes.js (7 endpoints + RBAC)
├─ ticketRoutes.js (5 endpoints + RBAC)
└─ roleRequestRoutes.js (3 endpoints + RBAC)
    ↓
Controllers Layer
├─ userController.js
├─ applicationController.js
├─ hostelController.js
├─ ticketController.js
└─ roleRequestController.js
    ↓
Services Layer
├─ userService.js
├─ applicationService.js
├─ hostelService.js
├─ ticketService.js
└─ roleRequestService.js
    ↓
Repositories Layer
├─ userRepository.js
├─ applicationRepository.js
├─ hostelRepository.js
├─ ticketRepository.js
├─ roleRequestRepository.js
└─ permissionRepository.js ⭐ (RBAC)
    ↓
Database Layer
└─ MySQL (1NF normalized)
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (Web server)
- **Database**: MySQL 8.0+ (with mysql2/promise)
- **Authentication**: JWT (jsonwebtoken) + Bcrypt
- **API Documentation**: Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)
- **HTTP Logger**: Morgan
- **CORS**: cors middleware
- **Environment**: dotenv

### Frontend
- **Framework**: React 18 (with Vite)
- **HTTP Client**: Axios
- **CSS Framework**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: React Context API
- **Linting**: ESLint

### Security
- ✅ JWT Token Authentication
- ✅ Bcrypt Password Hashing
- ✅ RBAC with 26 Permissions
- ✅ CORS Protection
- ✅ Input Validation
- ✅ SQL Prepared Statements

---

## ✨ Features

### Authentication & Authorization
- ✅ User login with email/password
- ✅ JWT token generation and validation
- ✅ Token verification endpoint
- ✅ Role-Based Access Control (RBAC)
- ✅ 26 granular permissions
- ✅ Database-driven permission system

### User Management
- ✅ Create, read, update, delete users
- ✅ Bulk user creation from CSV
- ✅ Role assignment and management
- ✅ Filter users by role
- ✅ Secure password hashing

### Application Processing
- ✅ Student application submission
- ✅ Application status tracking (pending, approved, rejected)
- ✅ Staff application review
- ✅ Application data normalization (1NF)
- ✅ Submission and review timestamps

### Hostel Management
- ✅ Hostel creation and management
- ✅ Room assignment to hostels
- ✅ Student hostel allocation
- ✅ Occupancy tracking
- ✅ Capacity management
- ✅ Hostel statistics

### Support Ticket System
- ✅ Student ticket creation
- ✅ Counselor ticket assignment
- ✅ Two-way messaging system
- ✅ Ticket status tracking (open, in_progress, resolved)
- ✅ Message threading

### Role Request System
- ✅ Users can request role changes
- ✅ Admin approval/rejection workflow
- ✅ Role request tracking
- ✅ Request reason documentation

### API Documentation
- ✅ Swagger/OpenAPI 3.0 documentation
- ✅ Interactive API testing
- ✅ JWT authentication in Swagger
- ✅ Schema definitions
- ✅ Auto-generated from JSDoc comments

---

## 📁 Project Structure

```
counselor_portal/
├── README.md (this file)
├── 
├── Documentation Files
├─ SWAGGER_DOCUMENTATION.md      ⭐ API documentation (start here)
├─ API_ENDPOINTS.md              (All 27 endpoints)
├─ API_RESPONSE_SPEC.md          (Response specifications)
├─ INTEGRATION.md                (Frontend-backend integration)
├─ ROLE_BASED_FILTERING.md       (Role-based filtering)
├─
├─ RBAC Documentation (6 files)
├─ RBAC_QUICK_REFERENCE.md       ⭐ Quick TL;DR (5 min)
├─ RBAC_SETUP.md                 (Setup & testing)
├─ RBAC_IMPLEMENTATION.md        (Technical details - 20 min read)
├─ RBAC_ARCHITECTURE.md          (Diagrams and flows)
├─ RBAC_COMPLETE.md              (Complete summary)
├─ RBAC_IMPLEMENTATION_COMPLETE.md (Final summary)
│
├── backend/                     (Express API server)
│   ├── README.md
│   ├── package.json
│   ├── .env                     (Configuration)
│   ├── src/
│   │   ├── server.js            (Server entry point)
│   │   ├── app.js               (Express app with Swagger UI)
│   │   ├── config/
│   │   │   ├── db.js            (MySQL connection)
│   │   │   └── env.js           (Environment variables)
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js (JWT authentication)
│   │   │   ├── rbacMiddleware.js ⭐ (Permission checking)
│   │   │   └── errorHandler.js  (Error handling)
│   │   ├── controllers/         (Business logic)
│   │   │   ├── userController.js
│   │   │   ├── authController.js
│   │   │   ├── applicationController.js
│   │   │   ├── hostelController.js
│   │   │   ├── ticketController.js
│   │   │   └── roleRequestController.js
│   │   ├── services/            (Business operations)
│   │   │   ├── userService.js
│   │   │   ├── authService.js
│   │   │   ├── applicationService.js
│   │   │   ├── hostelService.js
│   │   │   ├── ticketService.js
│   │   │   └── roleRequestService.js
│   │   ├── repositories/        (Data access)
│   │   │   ├── userRepository.js
│   │   │   ├── applicationRepository.js
│   │   │   ├── hostelRepository.js
│   │   │   ├── ticketRepository.js
│   │   │   ├── roleRequestRepository.js
│   │   │   └── permissionRepository.js ⭐
│   │   ├── routes/              (API endpoints)
│   │   │   ├── authRoutes.js    (Login, verify)
│   │   │   ├── userRoutes.js    (User CRUD + role-based)
│   │   │   ├── applicationRoutes.js
│   │   │   ├── hostelRoutes.js
│   │   │   ├── ticketRoutes.js
│   │   │   └── roleRequestRoutes.js
│   │   └── swagger/
│   │       └── swaggerConfig.js ⭐ (API documentation config)
│   └── sql/
│       ├── schema.sql           (Database schema with RBAC tables)
│       └── seed.sql             (Initial data + permissions)
│
└── frontend/                    (React application)
    ├── README.md
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/                 (API clients)
    │   │   ├── apiClient.js     (Axios instance with auth)
    │   │   ├── userApi.js
    │   │   ├── authApi.js
    │   │   ├── applicationApi.js
    │   │   ├── hostelApi.js
    │   │   └── ticketApi.js
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── UserList.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  (Auth state management)
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── usePermissions.js ⭐ (RBAC permissions)
    │   ├── layouts/
    │   │   └── DashboardLayout.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── UserManagement.jsx
    │   │   ├── ApplicationReview.jsx
    │   │   ├── HostelManagement.jsx
    │   │   ├── StudentApplication.jsx
    │   │   ├── StudentTickets.jsx
    │   │   ├── CounselorTickets.jsx
    │   │   ├── AdminRoleRequests.jsx
    │   │   ├── StaffRoleRequest.jsx
    │   │   └── Unauthorized.jsx
    │   ├── services/
    │   │   └── authService.js
    │   └── utils/
    │       └── mockDB.js
    └── public/
        └── _redirects           (Netlify routing)
```

---

## 🔐 Security Implementation

### Authentication Layer
- JWT token-based authentication
- Bcrypt password hashing (bcryptjs)
- Token verification on protected routes
- 1-hour token expiration

### Authorization Layer (RBAC)
- 26 granular permissions
- 4 roles with different permission sets
- Database-driven permission system
- Middleware enforces permissions on every request

### Data Protection
- 1NF normalized database (no data redundancy)
- Prepared statements (SQL injection prevention)
- Sensitive field exclusion from API responses
- CORS protection

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts with roles
- **roles** - User roles (admin, staff, counselor, student)
- **permissions** ⭐ - 26 defined permissions
- **role_permissions** ⭐ - Role-permission mapping (many-to-many)

### Domain Tables
- **applications** - Student applications (normalized fields)
- **hostels** - Hostel information
- **rooms** - Hostel rooms
- **allocations** - Student hostel assignments
- **tickets** - Support tickets
- **ticket_messages** - Ticket conversation threads
- **role_requests** - Role change requests

---

## 🧪 Testing

### Manual Testing with curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uom.local","password":"123"}'

# Get users (requires permission)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users

# Try without permission (student trying to create user)
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <student-token>" \
  -d '{"name":"Test",...}'
# Returns: 403 Forbidden
```

### Test with Swagger UI
1. Open http://localhost:5000/api/docs
2. Click "Authorize" button
3. Paste JWT token: `Bearer <your-token>`
4. Test any endpoint directly

---

## 📝 API Endpoints Summary

### Authentication (2)
| Method | Endpoint | Auth | Permission |
|--------|----------|------|-----------|
| POST | /api/auth/login | No | auth.login |
| GET | /api/auth/verify | Yes | auth.verify |

### Users (5)
| Method | Endpoint | Permission |
|--------|----------|-----------|
| GET | /api/users | users.view_all |
| POST | /api/users | users.create |
| POST | /api/users/bulk | users.bulk_create |
| PATCH | /api/users/:id/role | users.change_role |
| DELETE | /api/users/:id | users.delete |

### Applications (4)
| Method | Endpoint | Permission |
|--------|----------|-----------|
| GET | /api/applications | applications.view_all |
| GET | /api/applications/user/:id | applications.view_own OR view_all |
| POST | /api/applications/user/:id | applications.submit |
| PATCH | /api/applications/:id/status | applications.review |

### Hostels (7)
| Method | Endpoint | Permission |
|--------|----------|-----------|
| GET | /api/hostels | hostels.view |
| GET | /api/hostels/stats | hostels.view_stats |
| GET | /api/hostels/allocations | hostels.view |
| GET | /api/hostels/allocations/:id | hostels.view_allocation OR manage |
| POST | /api/hostels/assign | hostels.assign |
| DELETE | /api/hostels/allocations/:id | hostels.manage |
| POST | /api/hostels/rooms | hostels.manage |

### Tickets (5)
| Method | Endpoint | Permission |
|--------|----------|-----------|
| GET | /api/tickets/student/:id | tickets.view_own OR view_assigned |
| GET | /api/tickets/counselor/:id | tickets.view_assigned |
| POST | /api/tickets | tickets.create |
| POST | /api/tickets/:id/reply | tickets.reply |
| PATCH | /api/tickets/:id/status | tickets.resolve |

### Role Requests (3)
| Method | Endpoint | Permission |
|--------|----------|-----------|
| GET | /api/role-requests | role_requests.view_all |
| POST | /api/role-requests | role_requests.create |
| PATCH | /api/role-requests/:id/process | role_requests.process |

**Total: 27 Protected Endpoints**

---

## 🚦 Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | New resource created |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | No/invalid token |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

---

## 📖 Reading Guide

### For API Usage
1. Start: [SWAGGER_DOCUMENTATION.md](./SWAGGER_DOCUMENTATION.md)
2. Reference: [API_ENDPOINTS.md](./API_ENDPOINTS.md)
3. Integration: [INTEGRATION.md](./INTEGRATION.md)

### For RBAC Understanding
1. Quick: [RBAC_QUICK_REFERENCE.md](./RBAC_QUICK_REFERENCE.md) (5 min)
2. Setup: [RBAC_SETUP.md](./RBAC_SETUP.md) (10 min)
3. Details: [RBAC_IMPLEMENTATION.md](./RBAC_IMPLEMENTATION.md) (20 min)
4. Visuals: [RBAC_ARCHITECTURE.md](./RBAC_ARCHITECTURE.md) (15 min)

### For Backend Development
1. Backend [README.md](./backend/README.md)
2. [API_RESPONSE_SPEC.md](./API_RESPONSE_SPEC.md)
3. [RBAC_IMPLEMENTATION.md](./RBAC_IMPLEMENTATION.md)

### For Frontend Development
1. Frontend [README.md](./frontend/README.md)
2. [INTEGRATION.md](./INTEGRATION.md)
3. [ROLE_BASED_FILTERING.md](./ROLE_BASED_FILTERING.md)

---

## 🔧 Environment Setup

### Backend .env
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=db_user
DB_PASSWORD=your_password
DB_NAME=counselor_portal
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

### Frontend .env (if needed)
```
VITE_API_URL=http://localhost:5000
```

---

## 📞 Support & Troubleshooting

### Common Issues

**RBAC Not Working?**
- See [RBAC_SETUP.md](./RBAC_SETUP.md#troubleshooting)

**Permission Denied?**
- Check: [RBAC_QUICK_REFERENCE.md#important-files-location](./RBAC_QUICK_REFERENCE.md#important-files-location)

**API Not Responding?**
- Check backend logs: `npm run dev`
- Verify database connection in `backend/.env`

**Swagger Not Loading?**
- Ensure swagger packages installed: `npm install swagger-jsdoc swagger-ui-express`
- Check `backend/src/swagger/swaggerConfig.js`

---

## ✅ Checklist Before Deployment

- [ ] Database schema created with permissions tables
- [ ] Seed data inserted with permissions
- [ ] Backend and frontend dependencies installed
- [ ] JWT_SECRET configured in .env
- [ ] Database credentials configured
- [ ] API documentation accessible at /api/docs
- [ ] RBAC middleware protecting all endpoints
- [ ] Test with all 4 user roles
- [ ] Frontend consuming backend API correctly
- [ ] CORS configured for frontend domain

---

## 📚 Additional Resources

### SQL Queries

**Check user permissions:**
```sql
SELECT p.name FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'student@uom.local';
```

**View role permissions:**
```sql
SELECT r.name, GROUP_CONCAT(p.name)
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id;
```

### Useful Commands

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev              # Run with hot reload
npm start                # Run production

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Run dev server
npm run build            # Build for production

# Database
mysql -u db_user -p counselor_portal < backend/sql/schema.sql
mysql -u db_user -p counselor_portal < backend/sql/seed.sql
```

---

## 📄 License

This project is part of the University of Moratuwa Counselor Portal system.

---

## 🎯 Key Highlights

✅ **Full RBAC Implementation** - Backend-driven permission system with 26 permissions
✅ **26 Granular Permissions** - Organized by resource (users, apps, hostels, tickets, requests)
✅ **4 Configured Roles** - Admin, Staff, Counselor, Student with appropriate permissions
✅ **27 Protected Endpoints** - All endpoints enforce permission checks
✅ **Swagger/OpenAPI Documentation** - Interactive API testing at /api/docs
✅ **Layered Architecture** - Clean separation: Routes → Controllers → Services → Repositories → Database
✅ **1NF Database Design** - Normalized data with no redundancy
✅ **Secure Authentication** - JWT + Bcrypt password hashing
✅ **Comprehensive Documentation** - 13 markdown files covering every aspect

---

## 📖 Document Overview

| Document | Purpose | Read Time | Audience |
|----------|---------|-----------|----------|
| **CODEBASE_OVERVIEW.md** | **Codebase structure, technologies, architecture** | **10 min** | **All** |
| SWAGGER_DOCUMENTATION.md | API testing & documentation | 15 min | All |
| API_ENDPOINTS.md | API reference | 10 min | Developers |
| RBAC_QUICK_REFERENCE.md | RBAC overview | 5 min | All |
| RBAC_SETUP.md | RBAC setup & testing | 15 min | DevOps/QA |
| RBAC_IMPLEMENTATION.md | RBAC technical details | 25 min | Backend developers |
| RBAC_ARCHITECTURE.md | RBAC system design | 20 min | Architects |
| INTEGRATION.md | Frontend-backend integration | 15 min | Frontend developers |
| ROLE_BASED_FILTERING.md | Role-based queries | 10 min | Backend developers |
| API_RESPONSE_SPEC.md | API response standards | 10 min | Backend developers |
| backend/README.md | Backend setup | 10 min | Backend developers |
| frontend/README.md | Frontend setup | 10 min | Frontend developers |

---

**Last Updated**: February 2026
**Status**: Production Ready ✅
**RBAC Status**: Fully Implemented ✅
