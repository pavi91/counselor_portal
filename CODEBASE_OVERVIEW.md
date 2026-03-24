# Codebase Overview

A developer-oriented guide to understanding the **Counselor Portal** codebase — its purpose, structure, technologies, and architectural patterns.

---

## Table of Contents

- [What This Application Does](#what-this-application-does)
- [Technology Stack](#technology-stack)
- [Repository Layout](#repository-layout)
  - [Root](#root)
  - [Backend (`backend/`)](#backend-backend)
  - [Frontend (`frontend/`)](#frontend-frontend)
- [Architecture & Patterns](#architecture--patterns)
  - [Layered Backend Architecture](#layered-backend-architecture)
  - [Request Lifecycle](#request-lifecycle)
  - [Frontend Architecture](#frontend-architecture)
- [Database Schema](#database-schema)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Key Files — Where to Start](#key-files--where-to-start)
- [Local Development Commands](#local-development-commands)

---

## What This Application Does

The Counselor Portal is a full-stack web application for a university counseling department. It manages:

| Feature | Who uses it |
|---------|-------------|
| **User management** – create / delete / assign roles | Admin |
| **Hostel allocation** – hostels, rooms, assign students | Admin / Staff |
| **Application review** – students apply; staff/counselors approve | Student → Staff/Counselor |
| **Support tickets** – students raise issues; counselors respond | Student ↔ Counselor |
| **Role requests** – staff request role changes; admins approve | Staff → Admin |

Every action is protected by **JWT authentication** and a database-driven **RBAC** system with 26 named permissions across 4 roles (admin, staff, counselor, student).

---

## Technology Stack

### Backend

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express | 4.19 | REST API server |
| Database | MySQL | 8.0 | Relational storage |
| DB driver | mysql2/promise | 3.11 | Connection pool, prepared statements |
| Auth tokens | jsonwebtoken | 9.0 | Stateless JWT (1 h expiry) |
| Password hashing | bcryptjs | 2.4 | Secure credential storage |
| File uploads | Multer | 2.0 | `multipart/form-data` handling |
| API docs | swagger-jsdoc + swagger-ui-express | 6/5 | OpenAPI 3 at `/api/docs` |
| HTTP logging | Morgan | 1.10 | Request log to stdout |
| Hot reload | Nodemon | 3.1 | Dev-only auto-restart |

### Frontend

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| UI library | React | 19.2 | Component-based SPA |
| Routing | React Router DOM | 7.11 | Client-side navigation |
| Build tool | Vite | 7.2 | Dev server + production bundler |
| HTTP client | Axios | 1.13 | API requests with interceptors |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS |
| Icons | Lucide React | 0.56 | SVG icon set |
| Charts | Recharts | 3.5 | Dashboard visualizations |
| Linter | ESLint | 9.4 | Code quality |

### Infrastructure

| Tool | Role |
|------|------|
| Docker | Container images for all three services |
| Docker Compose | Orchestrates `db`, `backend`, `frontend` containers |
| Nginx (Alpine) | Serves the built React SPA in production |

---

## Repository Layout

### Root

```
counselor_portal/
├── backend/               # Express API server
├── frontend/              # React SPA
├── docker-compose.yml     # Multi-container orchestration
├── .env.docker            # Environment variables for Docker deployment
├── README.md              # Project entry point
├── CODEBASE_OVERVIEW.md   # This file
├── API_ENDPOINTS.md       # All 27 API routes with examples
├── API_RESPONSE_SPEC.md   # Response field specifications
├── INTEGRATION.md         # Frontend ↔ Backend integration guide
├── SWAGGER_DOCUMENTATION.md
├── DOCKER_DEPLOYMENT.md
├── CLIENT_SETUP_GUIDE.md
├── ROLE_BASED_FILTERING.md
└── RBAC_*.md              # Six documents on the RBAC system
```

### Backend (`backend/`)

```
backend/
├── src/
│   ├── server.js                  # Entry point — creates HTTP server
│   ├── app.js                     # Express app, global middleware, route mounting
│   │
│   ├── config/
│   │   ├── db.js                  # mysql2 connection pool (10 connections)
│   │   └── env.js                 # Loads and validates environment variables
│   │
│   ├── routes/                    # Endpoint definitions (URL + verb + middleware)
│   │   ├── authRoutes.js          # POST /auth/login, GET /auth/verify
│   │   ├── userRoutes.js          # CRUD /users
│   │   ├── applicationRoutes.js   # CRUD /applications
│   │   ├── hostelRoutes.js        # CRUD /hostels, /rooms, /allocations
│   │   ├── ticketRoutes.js        # CRUD /tickets, /tickets/:id/reply
│   │   └── roleRequestRoutes.js   # CRUD /role-requests
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js      # Verifies JWT; attaches user to req
│   │   ├── rbacMiddleware.js      # Checks named permission against DB
│   │   ├── errorHandler.js        # Global catch-all error handler
│   │   ├── uploadMiddleware.js    # Multer file-upload config
│   │   └── validationMiddleware.js # Request body validation
│   │
│   ├── controllers/               # Parse req, call service, send res
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── applicationController.js
│   │   ├── hostelController.js
│   │   ├── ticketController.js
│   │   └── roleRequestController.js
│   │
│   ├── services/                  # Business logic; no Express objects
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── applicationService.js
│   │   ├── hostelService.js
│   │   ├── ticketService.js
│   │   └── roleRequestService.js
│   │
│   ├── repositories/              # All SQL queries; returns plain objects
│   │   ├── userRepository.js
│   │   ├── applicationRepository.js
│   │   ├── hostelRepository.js
│   │   ├── ticketRepository.js
│   │   ├── roleRequestRepository.js
│   │   └── permissionRepository.js   # Loads permissions for RBAC checks
│   │
│   ├── swagger/
│   │   └── swaggerConfig.js          # OpenAPI 3 spec; served at /api/docs
│   │
│   └── utils/
│       └── ticketEncryption.js       # Encryption helpers for ticket data
│
├── sql/
│   ├── schema.sql    # All CREATE TABLE statements (11 tables)
│   └── seed.sql      # Test users, roles, permissions, sample data
│
├── filestore/        # Uploaded files land here (gitignored)
├── Dockerfile        # node:18-alpine, port 5000
├── package.json
└── .env              # Local dev environment variables
```

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── main.jsx               # ReactDOM.render entry point
│   ├── App.jsx                # Root component; declares all routes
│   │
│   ├── api/                   # Thin wrappers around Axios calls
│   │   ├── apiClient.js       # Axios instance; attaches Bearer token
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   ├── applicationApi.js
│   │   ├── hostelApi.js
│   │   └── ticketApi.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state (user, token, login, logout)
│   │
│   ├── hooks/
│   │   ├── useAuth.js         # Consumes AuthContext
│   │   └── usePermissions.js  # Derives per-action booleans from user.permissions
│   │
│   ├── layouts/
│   │   └── DashboardLayout.jsx  # Wraps authenticated pages (Header + Sidebar)
│   │
│   ├── components/            # Shared, reusable UI pieces
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx        # Role-aware navigation links
│   │   ├── ProtectedRoute.jsx # Redirects unauthenticated users to /login
│   │   └── UserList.jsx
│   │
│   ├── pages/                 # One file per route
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── HostelManagement.jsx
│   │   ├── ApplicationReview.jsx
│   │   ├── StudentApplication.jsx
│   │   ├── StudentTickets.jsx
│   │   ├── CounselorTickets.jsx
│   │   ├── StaffRoleRequest.jsx
│   │   ├── AdminRoleRequests.jsx
│   │   ├── Profile.jsx
│   │   └── Unauthorized.jsx
│   │
│   ├── services/
│   │   └── authService.js     # Token read/write helpers (localStorage)
│   │
│   └── utils/
│       └── mockDB.js          # Static fallback data for offline development
│
├── public/
│   └── _redirects             # Netlify SPA routing fallback
├── Dockerfile                 # Multi-stage: build → nginx:alpine
├── nginx.conf                 # Serve /dist; proxy /api to backend
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

---

## Architecture & Patterns

### Layered Backend Architecture

The backend follows a **four-layer MVC-S** (Model-View-Controller-Service) pattern. Each layer has a single responsibility and only talks to the layer directly below it.

```
┌──────────────────────────────────────────────────────────────┐
│  Routes  (routes/*.js)                                       │
│  Declares URL + verb, attaches authMiddleware +              │
│  rbacMiddleware, then delegates to a controller function.    │
└────────────────────────┬─────────────────────────────────────┘
                         │  req / res
┌────────────────────────▼─────────────────────────────────────┐
│  Controllers  (controllers/*.js)                             │
│  Parses and validates the HTTP request, calls the matching   │
│  service method, and formats the HTTP response.              │
└────────────────────────┬─────────────────────────────────────┘
                         │  plain JS objects / primitives
┌────────────────────────▼─────────────────────────────────────┐
│  Services  (services/*.js)                                   │
│  Contains all business logic (calculations, decisions,       │
│  orchestration of multiple repository calls).                │
│  No Express objects (req/res) ever appear here.              │
└────────────────────────┬─────────────────────────────────────┘
                         │  SQL parameters / result rows
┌────────────────────────▼─────────────────────────────────────┐
│  Repositories  (repositories/*.js)                           │
│  Executes prepared SQL statements via the mysql2 pool.       │
│  Returns raw rows; never contains business logic.            │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  MySQL Database  (sql/schema.sql)                            │
│  11 normalised (1NF) tables.                                 │
└──────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

Every authenticated, permission-protected request follows this exact path:

```
Client
  │
  │  HTTP request + Authorization: Bearer <token>
  ▼
Express Router  (routes/*.js)
  │
  ├─▶ authMiddleware.js
  │     Verifies JWT signature and expiry.
  │     Attaches decoded payload to req.user.
  │     → 401 if missing or invalid token.
  │
  ├─▶ rbacMiddleware.js  (requirePermission('resource.action'))
  │     Queries permissionRepository for the user's role permissions.
  │     → 403 if the required permission is not present.
  │
  ├─▶ Controller function
  │     Reads req.params / req.body / req.query.
  │     Calls the matching service method.
  │
  ├─▶ Service method
  │     Applies business rules.
  │     Calls one or more repository functions.
  │
  ├─▶ Repository function
  │     Runs a prepared SQL query.
  │     Returns result rows.
  │
  └─▶ Controller sends JSON response to client
        200 / 201 / 204 on success, 4xx/5xx on error.
        Global errorHandler.js catches any unhandled throws.
```

### Frontend Architecture

```
App.jsx
  └── React Router routes
        ├── /login          → Login.jsx  (public)
        └── <ProtectedRoute>
              └── DashboardLayout.jsx
                    ├── Header.jsx
                    ├── Sidebar.jsx  (role-aware links)
                    └── <Outlet>  — one of the page components
                          ↓
                    Page component
                          │  useAuth()        — gets current user + token
                          │  usePermissions() — derives canCreateUser, canReviewApplication, …
                          ▼
                    api/*.js  →  apiClient.js (Axios)
                          │  Automatically adds Authorization: Bearer <token>
                          │  Handles 401 by redirecting to login
                          ▼
                    Backend REST API
```

**State management** is intentionally minimal: `AuthContext` holds the single global state (current user and JWT token). All other state is local to the page component that owns it.

---

## Database Schema

Eleven tables in a 1NF normalised MySQL database:

| Table | Purpose |
|-------|---------|
| `roles` | Four roles: admin, staff, counselor, student |
| `permissions` | 26 named permissions (e.g. `users.create`, `hostels.assign`) |
| `role_permissions` | Many-to-many: which permissions each role holds |
| `users` | User accounts; each user has one `role_id` |
| `applications` | Student hostel applications; status: pending / approved / rejected |
| `hostels` | Hostel buildings |
| `rooms` | Rooms inside a hostel |
| `allocations` | Assigns a student (user) to a room |
| `tickets` | Support tickets created by students |
| `ticket_messages` | Threaded messages on a ticket |
| `role_requests` | Requests to change a user's role; status: pending / approved / rejected |

Schema source: [`backend/sql/schema.sql`](./backend/sql/schema.sql)  
Seed data (test users + permissions): [`backend/sql/seed.sql`](./backend/sql/seed.sql)

---

## Role-Based Access Control (RBAC)

The permission system is **database-driven and enforced on the backend**.

```
User → role_id → roles → role_permissions → permissions
                                               ↑
                                   "users.create", "tickets.reply", …
```

On every protected request, `rbacMiddleware.js` calls `permissionRepository.js` to fetch the current user's permissions, then checks whether the required permission (declared inline in the route) is present.

**Four roles and their scope:**

| Role | Can do |
|------|--------|
| **admin** | Full access: manage users, hostels, allocations, role requests |
| **staff** | View + review applications; request role change |
| **counselor** | View and reply to tickets assigned to them |
| **student** | Submit own application; create and view own tickets |

For full permission matrices and implementation details see [`RBAC_QUICK_REFERENCE.md`](./RBAC_QUICK_REFERENCE.md) and [`RBAC_IMPLEMENTATION.md`](./RBAC_IMPLEMENTATION.md).

---

## Key Files — Where to Start

If you are new to this codebase, read these files in order:

| # | File | Why |
|---|------|-----|
| 1 | `backend/src/app.js` | How the Express app is wired together (middleware stack, route mounting) |
| 2 | `backend/src/routes/userRoutes.js` | Representative example of a route file: see auth + RBAC middleware in use |
| 3 | `backend/src/middlewares/rbacMiddleware.js` | The heart of the permission system |
| 4 | `backend/src/repositories/permissionRepository.js` | How permissions are fetched from MySQL |
| 5 | `backend/sql/schema.sql` | The full database structure |
| 6 | `frontend/src/App.jsx` | All client-side routes and `ProtectedRoute` usage |
| 7 | `frontend/src/context/AuthContext.jsx` | Global auth state |
| 8 | `frontend/src/api/apiClient.js` | Axios instance with JWT interceptor |
| 9 | `frontend/src/hooks/usePermissions.js` | How the UI hides/shows features by permission |

---

## Local Development Commands

```bash
# ── Backend ──────────────────────────────────────────
cd backend
npm install
cp .env.example .env         # set DB credentials, JWT_SECRET
mysql -u <user> -p < sql/schema.sql
mysql -u <user> -p < sql/seed.sql
npm run dev                  # http://localhost:5000
                             # Swagger: http://localhost:5000/api/docs

# ── Frontend ─────────────────────────────────────────
cd frontend
npm install
npm run dev                  # http://localhost:5173
npm run build                # production build → dist/
npm run lint                 # ESLint check

# ── Docker (all three services) ──────────────────────
docker-compose up -d         # Frontend: :3001  Backend: :5001
docker-compose down
```

**Default test accounts** (seeded by `seed.sql`):

| Email | Password | Role |
|-------|----------|------|
| admin@uom.local | 123 | admin |
| staff@uom.local | 123 | staff |
| counselor@uom.local | 123 | counselor |
| student@uom.local | 123 | student |

---

*For deeper dives, refer to the topic-specific documentation files listed in [`README.md`](./README.md#documentation-map).*
