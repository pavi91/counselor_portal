# Counselor Portal — Setup & Running Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Option A — Run with Docker (Recommended)](#option-a--run-with-docker-recommended)
4. [Option B — Run Manually (Without Docker)](#option-b--run-manually-without-docker)
5. [Default Login Credentials](#default-login-credentials)
6. [Accessing the Application](#accessing-the-application)
7. [API Documentation (Swagger)](#api-documentation-swagger)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Project Structure](#project-structure)
10. [Database Schema](#database-schema)

---

## Overview

The **Counselor Portal** is a full-stack web application for university hostel and student management. It supports:

- **Student** — Submit hostel applications, view allocations, create support tickets, request role promotions
- **Counselor** — View applications, manage assigned support tickets
- **Staff** — Review applications, manage hostels & rooms, assign rooms, process role requests
- **Admin** — Full system access including user management, bulk user creation, and all staff capabilities

| Component | Technology |
|-----------|-----------|
| Frontend  | React 19, Vite, Tailwind CSS |
| Backend   | Node.js, Express 4 |
| Database  | MySQL 8.0 |
| Auth      | JWT (JSON Web Tokens) |
| Docs      | Swagger / OpenAPI 3.0 |

---

## Prerequisites

### For Docker deployment (Option A)
- **Docker** ≥ 20.x
- **Docker Compose** ≥ 2.x

### For manual deployment (Option B)
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MySQL** ≥ 8.0

---

## Option A — Run with Docker (Recommended)

This is the simplest way to get the entire stack running.

### 1. Clone or extract the project

```bash
cd counselor_portal
```

### 2. Start all services

```bash
docker-compose up --build -d
```

This starts three containers:
| Container | Port | Description |
|-----------|------|------------|
| `counselor_portal_db` | 3306 | MySQL database (auto-initialized with schema & seed data) |
| `counselor_portal_backend` | 5000 | Express API server |
| `counselor_portal_frontend` | 3000 | Nginx serving the React app |

### 3. Verify everything is running

```bash
docker-compose ps
```

All three services should show status **Up**.

### 4. Access the application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Docs (Swagger):** http://localhost:5000/api/docs
- **Health Check:** http://localhost:5000/api/health

### 5. Stop the application

```bash
docker-compose down
```

To also remove the database volume (resets all data):
```bash
docker-compose down -v
```

---

## Option B — Run Manually (Without Docker)

### Step 1 — Set up MySQL

1. Install MySQL 8.0 and start the service.

2. Log in to MySQL and run the schema and seed scripts:

```bash
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p counselor_portal < backend/sql/seed.sql
```

3. Create the application database user (or use your own):

```sql
CREATE USER 'db_user'@'localhost' IDENTIFIED BY 'Str0ng!Pass#2026';
GRANT ALL PRIVILEGES ON counselor_portal.* TO 'db_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2 — Configure the backend

1. Navigate to the backend folder:

```bash
cd backend
```

2. Create a `.env` file (or edit the existing one):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=db_user
DB_PASSWORD=Str0ng!Pass#2026
DB_NAME=counselor_portal
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
TICKET_ENCRYPTION_KEY=your-encryption-key-here
```

> **Note:** Replace `JWT_SECRET` and `TICKET_ENCRYPTION_KEY` with your own secure random strings for production use.

3. Install dependencies and start the server:

```bash
npm install
npm run dev      # Development mode (auto-restart on changes)
# OR
npm start        # Production mode
```

The backend will run on **http://localhost:5000**.

### Step 3 — Configure and run the frontend

1. Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on **http://localhost:5173**.

> For a production build:
> ```bash
> npm run build
> ```
> The output will be in the `frontend/dist/` folder. Serve it with any static file server (Nginx, Apache, etc).

---

## Default Login Credentials

The seed data creates the following test accounts. All passwords are `123`.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@uom.local | 123 |
| **Staff** | staff@uom.local | 123 |
| **Counselor** | counselor@uom.local | 123 |
| **Student** | student@uom.local | 123 |

> **Important:** Change these passwords immediately in a production environment.

---

## Accessing the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend (dev mode) |
| http://localhost:3000 | Frontend (Docker/production) |
| http://localhost:5000/api | Backend API base URL |
| http://localhost:5000/api/docs | Swagger API documentation |
| http://localhost:5000/api/health | Health check endpoint |

---

## API Documentation (Swagger)

Interactive API documentation is available at:

```
http://localhost:5000/api/docs
```

To authenticate in Swagger:
1. Call `POST /api/auth/login` with email and password
2. Copy the `token` from the response
3. Click the **Authorize** button (top right)
4. Enter: `Bearer <your-token>`
5. Click **Authorize**

All subsequent API calls will use that token.

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `db_user` | MySQL username |
| `DB_PASSWORD` | `Str0ng!Pass#2026` | MySQL password |
| `DB_NAME` | `counselor_portal` | Database name |
| `JWT_SECRET` | `dev_secret` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | `1h` | JWT token expiration duration |
| `TICKET_ENCRYPTION_KEY` | — | Key for encrypting ticket data |

---

## Project Structure

```
counselor_portal/
├── docker-compose.yml              # Docker orchestration
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env                        # Environment config
│   ├── sql/
│   │   ├── schema.sql              # Database schema
│   │   └── seed.sql                # Default data (roles, permissions, users)
│   ├── filestore/                  # Uploaded files storage
│   └── src/
│       ├── app.js                  # Express app setup
│       ├── server.js               # Server entry point
│       ├── config/                 # DB & env configuration
│       ├── controllers/            # Route handlers
│       ├── middlewares/            # Auth, RBAC, validation, uploads
│       ├── repositories/          # Database queries
│       ├── routes/                 # API route definitions + Swagger docs
│       ├── services/              # Business logic
│       ├── swagger/               # Swagger configuration
│       └── utils/                 # Utility functions
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── nginx.conf                  # Nginx config (Docker production)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                 # Root component & routing
│       ├── api/                    # API client functions
│       ├── components/             # Reusable UI components
│       ├── context/                # Auth context provider
│       ├── hooks/                  # Custom React hooks
│       ├── layouts/                # Page layouts
│       └── pages/                  # Page components
```

---

## Database Schema

### ER Diagram (Tables & Relationships)

```
roles ──────────< role_permissions >────────── permissions
  │
  └──< users
         │
         ├──< applications
         ├──< allocations >── rooms ──< hostels
         ├──< role_requests
         ├──< tickets (as student)
         ├──< tickets (as counselor)
         └──< ticket_messages (as sender)
```

### Tables

#### `roles`
Stores the four system roles.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Role ID |
| name | VARCHAR(50), UNIQUE | Role name (admin, staff, counselor, student) |
| description | VARCHAR(255) | Human-readable description |
| created_at | TIMESTAMP | Creation timestamp |

#### `permissions`
Stores individual permission definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Permission ID |
| name | VARCHAR(100), UNIQUE | Permission identifier (e.g. `users.view_all`) |
| description | VARCHAR(255) | Description |
| resource | VARCHAR(100) | Resource category (users, applications, etc.) |
| action | VARCHAR(50) | Action type (view, create, edit, delete) |
| created_at | TIMESTAMP | Creation timestamp |

#### `role_permissions`
Many-to-many mapping between roles and permissions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Row ID |
| role_id | INT, FK → roles.id | Role |
| permission_id | INT, FK → permissions.id | Permission |
| created_at | TIMESTAMP | Creation timestamp |

#### `users`
All user accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | User ID |
| email | VARCHAR(255), UNIQUE | Login email |
| password_hash | VARCHAR(255) | Hashed password |
| role_id | INT, FK → roles.id | Assigned role |
| name | VARCHAR(255) | Display name |
| index_number | VARCHAR(100) | Student index number |
| full_name | VARCHAR(255) | Full name |
| name_with_initials | VARCHAR(255) | Name with initials |
| permanent_address | VARCHAR(500) | Permanent address |
| resident_phone | VARCHAR(50) | Resident phone number |
| mobile_phone | VARCHAR(50) | Mobile phone number |
| gender | VARCHAR(20) | Gender |
| created_at | TIMESTAMP | Creation timestamp |

#### `role_requests`
Requests from users to change their role.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Request ID |
| user_id | INT, FK → users.id | Requesting user |
| message | TEXT | Request reason/message |
| attachment | VARCHAR(255) | Attachment file path |
| status | VARCHAR(20) | pending / approved / rejected |
| created_at | DATE | Submission date |

#### `hostels`
Hostel buildings.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Hostel ID |
| name | VARCHAR(255), UNIQUE | Hostel name |
| gender | VARCHAR(20) | male / female / any |
| year_group | VARCHAR(50) | first_year / final_year / any |

#### `rooms`
Rooms within hostels.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Room ID |
| hostel_id | INT, FK → hostels.id | Parent hostel |
| number | VARCHAR(20) | Room number |
| floor | INT | Floor number |
| capacity | INT | Maximum occupants |
| type | VARCHAR(50) | Room type (Double, Dorm, etc.) |

#### `allocations`
Room allocations for students.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Allocation ID |
| user_id | INT, FK → users.id | Allocated student |
| room_id | INT, FK → rooms.id | Assigned room |
| start_date | DATE | Start of allocation |
| end_date | DATE | End of allocation |

#### `applications`
Hostel applications submitted by students.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Application ID |
| user_id | INT, FK → users.id | Applicant |
| status | VARCHAR(20) | pending / approved / rejected |
| points | DECIMAL(6,2) | Calculated priority points |
| submission_date | DATE | Date submitted |
| full_name | VARCHAR(255) | Applicant full name |
| index_number | VARCHAR(100) | Index number |
| permanent_address | VARCHAR(500) | Address |
| email | VARCHAR(255) | Contact email |
| gender | VARCHAR(20) | Gender |
| mobile_phone | VARCHAR(50) | Mobile phone |
| district | VARCHAR(100) | District |
| closest_town | VARCHAR(100) | Nearest town |
| distance_to_town | DECIMAL(8,2) | Distance to town (km) |
| distance | DECIMAL(8,2) | Distance to university (km) |
| faculty | VARCHAR(100) | Faculty |
| department | VARCHAR(100) | Department |
| year | VARCHAR(50) | Academic year |
| misconduct | VARCHAR(10) | Disciplinary record flag |
| is_mahapola_recipient | VARCHAR(10) | Mahapola scholarship recipient |
| bursary_amount | VARCHAR(50) | Bursary amount |
| income_range | VARCHAR(50) | Family income range |
| is_samurdhi_recipient | VARCHAR(10) | Samurdhi recipient |
| mother_alive | VARCHAR(10) | Mother living status |
| father_alive | VARCHAR(10) | Father living status |
| siblings_school | INT | Siblings in school |
| siblings_uni | INT | Siblings in university |
| is_captain | VARCHAR(10) | Sports captain |
| is_member | VARCHAR(10) | Sports team member |
| member_team | VARCHAR(100) | Team name |
| has_colours | VARCHAR(10) | University colours awarded |
| hostel_pref | VARCHAR(100) | Preferred hostel |
| emergency_name | VARCHAR(255) | Emergency contact name |
| emergency_mobile | VARCHAR(50) | Emergency contact phone |
| emergency_address | VARCHAR(500) | Emergency contact address |
| file_residence | VARCHAR(255) | Residence proof file |
| file_income | VARCHAR(255) | Income proof file |
| file_siblings | VARCHAR(255) | Siblings proof file |
| file_samurdhi | VARCHAR(255) | Samurdhi proof file |
| file_sports | VARCHAR(255) | Sports proof file |

#### `tickets`
Support tickets between students and counselors.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Ticket ID |
| student_id | INT, FK → users.id | Student who created the ticket |
| counselor_id | INT, FK → users.id | Assigned counselor |
| subject | VARCHAR(255) | Ticket subject |
| status | VARCHAR(20) | open / in_progress / resolved |
| created_at | DATE | Creation date |

#### `ticket_messages`
Messages within a support ticket conversation.

| Column | Type | Description |
|--------|------|-------------|
| id | INT, PK, AUTO_INCREMENT | Message ID |
| ticket_id | INT, FK → tickets.id | Parent ticket |
| sender_id | INT, FK → users.id | Message sender |
| text | TEXT | Message content |
| attachment | VARCHAR(255) | Attachment file path |
| created_at | VARCHAR(50) | Timestamp |

### Raw SQL Schema

```sql
CREATE DATABASE IF NOT EXISTS counselor_portal;
USE counselor_portal;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY uq_role_permission (role_id, permission_id)
) ENGINE=InnoDB;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  index_number VARCHAR(100),
  full_name VARCHAR(255),
  name_with_initials VARCHAR(255),
  permanent_address VARCHAR(500),
  resident_phone VARCHAR(50),
  mobile_phone VARCHAR(50),
  gender VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Role Requests
CREATE TABLE IF NOT EXISTS role_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  attachment VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATE NOT NULL,
  CONSTRAINT fk_role_requests_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Hostels
CREATE TABLE IF NOT EXISTS hostels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  gender VARCHAR(20) DEFAULT NULL,
  year_group VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB;

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  number VARCHAR(20) NOT NULL,
  floor INT NOT NULL,
  capacity INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  CONSTRAINT fk_rooms_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id),
  UNIQUE KEY uq_room (hostel_id, number)
) ENGINE=InnoDB;

-- Allocations
CREATE TABLE IF NOT EXISTS allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  CONSTRAINT fk_allocations_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_allocations_room FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB;

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  points DECIMAL(6,2) NOT NULL DEFAULT 0,
  submission_date DATE NOT NULL,
  full_name VARCHAR(255),
  index_number VARCHAR(100),
  permanent_address VARCHAR(500),
  email VARCHAR(255),
  gender VARCHAR(20),
  mobile_phone VARCHAR(50),
  district VARCHAR(100),
  closest_town VARCHAR(100),
  distance_to_town DECIMAL(8,2),
  distance DECIMAL(8,2),
  faculty VARCHAR(100),
  department VARCHAR(100),
  year VARCHAR(50),
  misconduct VARCHAR(10),
  is_mahapola_recipient VARCHAR(10),
  bursary_amount VARCHAR(50),
  income_range VARCHAR(50),
  is_samurdhi_recipient VARCHAR(10),
  mother_alive VARCHAR(10),
  father_alive VARCHAR(10),
  siblings_school INT,
  siblings_uni INT,
  is_captain VARCHAR(10),
  is_member VARCHAR(10),
  member_team VARCHAR(100),
  has_colours VARCHAR(10),
  hostel_pref VARCHAR(100),
  emergency_name VARCHAR(255),
  emergency_mobile VARCHAR(50),
  emergency_address VARCHAR(500),
  file_residence VARCHAR(255),
  file_income VARCHAR(255),
  file_siblings VARCHAR(255),
  file_samurdhi VARCHAR(255),
  file_sports VARCHAR(255),
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  counselor_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at DATE NOT NULL,
  CONSTRAINT fk_tickets_student FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT fk_tickets_counselor FOREIGN KEY (counselor_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  sender_id INT NOT NULL,
  text TEXT NOT NULL,
  attachment VARCHAR(255),
  created_at VARCHAR(50) NOT NULL,
  CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  CONSTRAINT fk_ticket_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend can't connect to DB | Verify `.env` DB credentials match your MySQL user. Ensure MySQL is running on port 3306. |
| Frontend shows blank page | Check browser console. Ensure backend is running at `http://localhost:5000`. |
| Docker containers won't start | Run `docker-compose logs` to check errors. Ensure ports 3000, 3306, 5000 are not in use. |
| "Unauthorized" on API calls | JWT token may have expired. Log in again. Token expires after 1 hour by default. |
| File uploads fail | Ensure the `backend/filestore/` directory exists and has write permissions. |
