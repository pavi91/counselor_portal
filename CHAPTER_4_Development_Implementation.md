# Chapter 4: Development and Implementation

This chapter presents the development and implementation of the University Counselling Portal. It explains the interaction between the front-end application and the RESTful web service, as well as the relationship between the web service and the database layer. The chapter further describes the system modules, their communication mechanisms, and selected code segments of key components. Finally, it outlines the technologies and tools utilized in the development of the system.

## 4.1 Related Technologies

System-level communication is facilitated through a REST (Representational State Transfer) architectural style, which enables standardized data exchange between clients and servers within a client–server model. RESTful services support stateless communication and improve scalability and interoperability of distributed systems (Fielding, 2000).

The proposed web application adopts a three-tier architecture comprising the Presentation Tier, Business Tier, and Data Tier. This architectural pattern enhances system scalability, maintainability, and separation of concerns, thereby improving overall application performance and development efficiency (Bass, Clements and Kazman, 2013). Communication among the tiers is carried out using HTTP and HTTPS protocols to ensure secure and reliable data transmission.

**Frontend Technology Stack:**
The Client Tier is developed using React JS, a widely adopted JavaScript library for building dynamic, component-based, and responsive user interfaces. React's component-based architecture enables efficient code reuse and maintainability. The frontend is bundled using Vite, a next-generation front-end build tool providing fast hot module replacement and optimized production builds. Styling is implemented using Tailwind CSS for utility-first design patterns, enabling rapid UI development while maintaining consistency across the application.

**Backend Technology Stack:**
The Business Tier is implemented using Node.js with Express.js framework, enabling lightweight, modular server-side functionality. Node.js's event-driven, non-blocking I/O model provides efficient request handling and scalability. The backend follows the repository design pattern combined with a service layer architecture, enabling clear separation of concerns and facilitating unit testing and maintenance.

**Database Technology:**
MySQL was selected as the relational database management system due to its robustness, performance efficiency, and widespread industry adoption (DuBois, 2013). The database schema is managed through SQL migration scripts, enabling version control and reproducible deployments across environments.

**Containerization and Deployment:**
Docker containerization is employed for both frontend and backend services, ensuring consistent deployment across development, testing, and production environments. Docker Compose orchestrates the multi-container application stack, facilitating simplified local development and production deployment. This approach aligns with modern DevOps practices and enables rapid scaling of application services.

## 4.2 System Architecture

### 4.2.1 Three-Tier Architecture Overview

This section describes the proposed system architecture. Figure 4.1 illustrates the overall architecture of the system. The application adopts three-tier architecture to achieve high scalability, availability, and performance.

Each tier is developed independently, allowing flexibility in implementation and technology selection. The Client Tier (Presentation Tier) is a responsive web application developed using the React JS framework, which supports dynamic and interactive user interfaces through reusable components. The Application Tier (Business Tier) consists of backend services implemented using Node.js with Express.js, enabling lightweight and modular server-side functionality. The Data Tier is a relational database developed using MySQL (DuBois, 2013).

Secure communication between the tiers is established using HTTP and HTTPS protocols with TCP/IP. The system architecture defines the structural components, their interactions, and the overall organization of the system.

### 4.2.2 Backend Architecture

The RESTful web service follows a layered architecture pattern to facilitate maintainability and separation of concerns. As illustrated in Figure 4.2, the file structure is organized into distinct layers:

**Routes Layer:** Defines RESTful endpoints and maps HTTP requests to appropriate controllers. Routes are organized by functional modules (auth, user, application, ticket, hostel, FAQ, role request, report).

**Controllers Layer:** Handles incoming HTTP requests, validates input parameters, and orchestrates business logic through service layer methods.

**Services Layer:** Contains business logic and data processing operations. Services communicate with the data access layer through repositories, enabling decoupled business logic from database operations.

**Repositories Layer:** Implements the repository design pattern, providing an abstraction layer for data access operations. Repositories encapsulate SQL queries and database interactions, returning domain objects to the service layer.

**Middlewares Layer:** Implements cross-cutting concerns including:
- Authentication and Authorization (Role-Based Access Control)
- Request validation
- Error handling and logging
- File upload processing

**Database Layer:** MySQL database with schema managed through migration scripts, providing normalized data storage for the application.

### 4.2.3 Frontend Architecture

The React frontend follows a component-based architecture with clear separation of functional areas:

**Pages:** High-level components representing distinct user workflows (StudentApplication, CounselorTickets, AdminRoleRequests, etc.).

**Components:** Reusable UI components (Header, Sidebar, ProtectedRoute, UserList) providing consistent interface elements across the application.

**API Layer:** Centralized API client using Axios for RESTful service communication, with dedicated API modules for each backend service (authApi, applicationApi, ticketApi, etc.).

**Context & Hooks:** React Context API for global state management (AuthContext) and custom hooks for reusable logic (useAuth, usePermissions).

**Layouts:** Template components defining page structure and common UI elements (DashboardLayout).

## 4.3 Modules of the System

The proposed University Counselling Portal is organized into the following functional modules:

**User Management Module:** Manages user accounts, roles, and permissions. Supports different user types: students, counselors, and administrators with role-based access control.

**Application Module:** Handles student application submissions, tracking, and status management throughout the review process.

**Ticket/Support Module:** Enables counselors and students to create, manage, and resolve support tickets with status tracking and assignment capabilities.

**Hostel Management Module:** Manages hostel information, availability, and allocation.

**FAQ Module:** Provides frequently asked questions and knowledge base management for self-service support.

**Role Request Module:** Manages user requests for role elevation or permission modifications, with administrative approval workflows.

**Report Module:** Generates analytics and reports on applications, tickets, and system usage for administrative oversight.

**Authentication Module:** Implements secure authentication, authorization, and session management using JWT tokens.

These modules are designed to be interoperable, ensuring that the system functions cohesively. They are developed with low coupling and high cohesion, allowing future enhancements or additions to be integrated seamlessly without disrupting existing functionality (Sommerville, 2022).

## 4.4 Major Code Segments

### 4.4.1 Repository Pattern Implementation

The repository pattern provides an abstraction layer for data access operations. The following code segment illustrates the userRepository implementation:

```javascript
// File: backend/src/repositories/userRepository.js
class UserRepository {
  async findById(userId) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await db.query(query, [userId]);
    return rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(query, [email]);
    return rows[0];
  }

  async create(userData) {
    const { email, password, firstName, lastName, role } = userData;
    const query = 'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [email, password, firstName, lastName, role]);
    return result.insertId;
  }

  async update(userId, userData) {
    const { firstName, lastName, status } = userData;
    const query = 'UPDATE users SET first_name = ?, last_name = ?, status = ? WHERE id = ?';
    await db.query(query, [firstName, lastName, status, userId]);
  }

  async delete(userId) {
    const query = 'DELETE FROM users WHERE id = ?';
    await db.query(query, [userId]);
  }
}

module.exports = new UserRepository();
```

### 4.4.2 Service Layer Implementation

The service layer encapsulates business logic and coordinates operations between controllers and repositories. The following code segment illustrates the userService implementation:

```javascript
// File: backend/src/services/userService.js
const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

class UserService {
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Remove sensitive data before returning
    delete user.password;
    return user;
  }

  async createUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await hashPassword(userData.password);
    const userId = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    return this.getUserById(userId);
  }

  async updateUser(userId, userData) {
    await userRepository.update(userId, userData);
    return this.getUserById(userId);
  }

  async deleteUser(userId) {
    await userRepository.delete(userId);
  }
}

module.exports = new UserService();
```

### 4.4.3 Controller Implementation

Controllers handle HTTP requests, validate input, and invoke service methods. The following code segment illustrates the userController:

```javascript
// File: backend/src/controllers/userController.js
const userService = require('../services/userService');

class UserController {
  async getUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await userService.updateUser(userId, req.body);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
```

### 4.4.4 React Component Implementation

The following code segment illustrates a functional React component with hooks for the frontend:

```javascript
// File: frontend/src/pages/StudentApplication.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getApplications, submitApplication } from '../api/applicationApi';
import DashboardLayout from '../layouts/DashboardLayout';

export default function StudentApplication() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attachments: []
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await getApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitApplication(formData);
      setApplications([...applications, response.data]);
      setFormData({ title: '', description: '', attachments: [] });
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Applications</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
          <input
            type="text"
            name="title"
            placeholder="Application Title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded mb-4"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded mb-4"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Application
          </button>
        </form>

        {loading ? (
          <p>Loading applications...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold">{app.title}</h3>
                <p className="text-gray-600">{app.description}</p>
                <p className="text-sm text-gray-500">Status: {app.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

### 4.4.5 API Client Layer

The frontend utilizes a centralized API client for RESTful service communication:

```javascript
// File: frontend/src/api/applicationApi.js
import apiClient from './apiClient';

export const getApplications = async () => {
  return apiClient.get('/api/applications');
};

export const getApplicationById = async (id) => {
  return apiClient.get(`/api/applications/${id}`);
};

export const submitApplication = async (data) => {
  return apiClient.post('/api/applications', data);
};

export const updateApplication = async (id, data) => {
  return apiClient.put(`/api/applications/${id}`, data);
};

export const deleteApplication = async (id) => {
  return apiClient.delete(`/api/applications/${id}`);
};
```

### 4.4.6 Middleware Implementation

The following code segment illustrates authentication middleware for protecting routes:

```javascript
// File: backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
```

## 4.5 Implementation Environment

### 4.5.1 Hardware Environment

Below are the hardware specifications of the development and deployment environment:

- **Operating System:** Linux (Ubuntu 20.04 LTS or later) / macOS / Windows with Docker
- **Processor:** Multi-core processor (Intel Core i5/i7 or equivalent)
- **RAM:** Minimum 8GB (16GB recommended for development)
- **Storage:** SSD with minimum 100GB free space for development and Docker images

### 4.5.2 Software Technologies and Tools

The development and deployment of the system utilized the following technologies and tools:

**Runtime and Build Tools:**
- **Node.js:** JavaScript runtime for server-side development
- **npm:** Package manager for JavaScript dependencies
- **Vite:** Modern frontend build tool providing fast development server and optimized production builds

**Backend Framework:**
- **Express.js:** Lightweight web application framework for Node.js, handling routing, middleware, and HTTP operations

**Frontend Framework:**
- **React JS:** JavaScript library for building component-based user interfaces with efficient state management and rendering

**Styling:**
- **Tailwind CSS:** Utility-first CSS framework enabling rapid UI development with consistent design patterns

**Database:**
- **MySQL:** Open-source relational database management system for data persistence (DuBois, 2013)

**Containerization and Orchestration:**
- **Docker:** Containerization platform ensuring consistent application behavior across development, testing, and production environments
- **Docker Compose:** Container orchestration tool managing multi-container application stacks (frontend, backend, database)

**Development Tools:**
- **Visual Studio Code:** Lightweight integrated development environment with extensive extension ecosystem
- **Git:** Version control system for source code management
- **Postman:** API testing and documentation tool for validating RESTful endpoints
- **MySQL Workbench:** GUI tool for database design and management

**Authentication:**
- **JWT (JSON Web Tokens):** Stateless authentication mechanism for secure client-server communication

**API Documentation:**
- **Swagger/OpenAPI:** API documentation and testing framework integrated into backend services

**Testing:**
- **Jest:** JavaScript testing framework for unit and integration testing
- **Supertest:** HTTP assertion library for API endpoint testing

### 4.5.3 Development Workflow

The development process follows an iterative approach with the following stages:

1. **Requirement Analysis:** Gathering and documenting functional and non-functional requirements from stakeholders
2. **System Design:** Designing database schema, API endpoints, and component architecture
3. **Development:** Implementing backend services and frontend components with regular integration
4. **Unit Testing:** Writing and executing unit tests for services and API endpoints
5. **Integration Testing:** Testing interactions between frontend, backend, and database
6. **User Acceptance Testing:** Validating system against requirements with stakeholder feedback
7. **Deployment:** Containerizing and deploying application using Docker Compose
8. **Maintenance:** Monitoring system performance and addressing issues in production environment

## References (Harvard Style)

Abramov, D. and Clark, B. (2015) React: A JavaScript library for building user interfaces. Available at: https://reactjs.org/ (Accessed: 21 April 2026).

Bass, L., Clements, P., & Kazman, R. (2012). Software architecture in practice (3rd ed.). Addison-Wesley Professional.

Bass, L., Clements, P. and Kazman, R. (2013) Software Architecture in Practice, 3rd ed. Boston, MA, USA: Addison-Wesley.

DuBois, P. (2013) MySQL, 5th ed. Indianapolis, IN, USA: Addison-Wesley.

Fielding, R.T. (2000) Architectural Styles and the Design of Network-based Software Architectures, Ph.D. dissertation, University of California, Irvine, CA, USA.

Sommerville, I. (2022). Software engineering (11th ed.). Pearson.

Tilkov, S., & Vinoski, S. (2010). Node.js: Using JavaScript to build high-performance network programs. IEEE Internet Computing, 14(6), 80–83. https://doi.org/10.1109/MIC.2010.145

Vite Contributors (2024) Vite - Next Generation Frontend Tooling. Available at: https://vitejs.dev/ (Accessed: 21 April 2026).

Zakas, N.C. (2021) Understanding ECMAScript 6: The Definitive Guide for JavaScript Developers. San Francisco, CA, USA: No Starch Press.
