# Role-Based Access Control (RBAC) Implementation

## Overview

This backend now implements a comprehensive **Role-Based Access Control (RBAC)** system at the database and middleware level. All API endpoints are protected by permission checks stored in the MySQL database, not just authentication.

## Architecture

### Three-Layer Permission System

```
Users → Roles → Permissions
 ↓
Each user has ONE role
Each role has MANY permissions
Each permission represents a specific action on a resource
```

## Database Schema

### New Tables Added

#### 1. **roles** Table
Stores available roles in the system.

```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `admin` - Full system access
- `staff` - Manage applications and hostels
- `counselor` - Student support and guidance
- `student` - Student user

#### 2. **permissions** Table
Stores all available permissions in the system.

```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  resource VARCHAR(100) NOT NULL,    -- Resource being accessed
  action VARCHAR(50) NOT NULL,        -- Action being performed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Permission Naming Convention:** `resource.action`

Examples:
- `users.view_all` - View all users
- `users.create` - Create new user
- `applications.submit` - Submit application
- `hostels.assign` - Assign rooms

#### 3. **role_permissions** Table (Many-to-Many Junction)
Links roles to permissions.

```sql
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  UNIQUE KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);
```

### Modified Tables

#### **users** Table
Added `role_id` foreign key to reference the roles table.

```sql
ALTER TABLE users ADD COLUMN role_id INT NOT NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_role 
  FOREIGN KEY (role_id) REFERENCES roles(id);
```

## Permission List

### User Management (`users.*`)
| Permission | Description | Who Has It |
|------------|-------------|-----------|
| `users.view_all` | View all users | Admin, Staff, Counselor |
| `users.create` | Create new user | Admin, Staff |
| `users.edit` | Edit user details | Admin |
| `users.delete` | Delete user | Admin |
| `users.change_role` | Change user role | Admin |
| `users.bulk_create` | Bulk create users | Admin, Staff |

### Application Management (`applications.*`)
| Permission | Description | Who Has It |
|------------|-------------|-----------|
| `applications.view_all` | View all applications | Admin, Staff, Counselor |
| `applications.view_own` | View own application | Student |
| `applications.submit` | Submit application | Student |
| `applications.review` | Review/approve applications | Admin, Staff |
| `applications.edit_own` | Edit own application | Student |

### Hostel Management (`hostels.*`)
| Permission | Description | Who Has It |
|------------|-------------|-----------|
| `hostels.view` | View hostels | All |
| `hostels.view_stats` | View statistics | Admin, Staff, Counselor |
| `hostels.manage` | Manage hostels and rooms | Admin, Staff |
| `hostels.assign` | Assign rooms to students | Admin, Staff |
| `hostels.view_allocation` | View own allocation | Student |

### Ticket Management (`tickets.*`)
| Permission | Description | Who Has It |
|------------|-------------|-----------|
| `tickets.create` | Create support ticket | Student, Counselor |
| `tickets.view_own` | View own tickets | Student, Counselor |
| `tickets.view_assigned` | View assigned tickets | Counselor, Staff |
| `tickets.reply` | Reply to ticket | Counselor, Staff |
| `tickets.resolve` | Resolve ticket | Counselor, Staff |

### Role Requests (`role_requests.*`)
| Permission | Description | Who Has It |
|------------|-------------|-----------|
| `role_requests.view_all` | View all requests | Admin, Staff |
| `role_requests.create` | Create role request | Student, Counselor |
| `role_requests.process` | Approve/reject requests | Admin |

### Authentication (`auth.*`)
| Permission | Description | Who Has It |
|------------|-------------|-----------|
| `auth.login` | Login to system | All |
| `auth.verify` | Verify token | All |

## RBAC Middleware

### Implementation

The `rbacMiddleware` is implemented in [src/middlewares/rbacMiddleware.js](src/middlewares/rbacMiddleware.js):

```javascript
const rbacMiddleware = (requiredPermissions) => {
  // Convert single permission to array
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  return async (req, res, next) => {
    // Get user's permissions from database
    const userPermissions = await getUserPermissions(req.user.id);
    
    // Check if user has at least one required permission
    const hasPermission = permissions.some(
      perm => userPermissions.includes(perm)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User lacks required permissions',
        requiredPermissions: permissions,
        userPermissions: userPermissions
      });
    }
    
    next();
  };
};
```

### Usage in Routes

```javascript
// Single permission required
router.post('/create', 
  authMiddleware, 
  rbacMiddleware('users.create'), 
  controller.create
);

// Multiple permissions (user needs ONE of them)
router.get('/:id', 
  authMiddleware, 
  rbacMiddleware(['applications.view_own', 'applications.view_all']), 
  controller.getApplication
);
```

## Permission Repository

The `permissionRepository.js` provides utility functions:

```javascript
// Get all permissions for a user
const userPerms = await permissionRepository.getUserPermissions(userId);

// Check if user has specific permission
const canDelete = await permissionRepository.hasPermission(userId, 'users.delete');

// Check if user has ANY of multiple permissions
const canView = await permissionRepository.hasAnyPermission(
  userId, 
  ['users.view_all', 'users.view_own']
);

// Get all roles with their permissions
const rolesWithPerms = await permissionRepository.getRolesWithPermissions();

// Assign permission to role
await permissionRepository.assignPermissionToRole(roleId, permissionId);
```

## Permission Check Flow

```
Request → Auth Middleware → RBAC Middleware → Check Database → Route Handler
              ↓                    ↓                 ↓
          Verify JWT         Check Permission    Query role_permissions
          Extract User       Get User's Role     Return 403 if denied
```

## Default Role Permissions

### Admin (Full Access)
- All permissions in the system

### Staff
- User bulk creation
- Application review
- Hostel management and assignment
- Ticket handling
- Role request processing
- User and application viewing

### Counselor
- User viewing
- Application viewing
- Hostel viewing and statistics
- Ticket assignment and resolution
- Role request creation
- Auth operations

### Student
- Application submission and editing
- Own ticket creation and viewing
- Hostel allocation viewing
- Ticket replies
- Role request creation
- Auth operations

## API Response Examples

### Successful Request (200)
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student"
}
```

### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "message": "User not authenticated"
}
```

### Forbidden (403) - Missing Permission
```json
{
  "error": "Forbidden",
  "message": "User lacks required permissions. Requires one of: users.create",
  "requiredPermissions": ["users.create"],
  "userPermissions": ["students.view", "students.create"]
}
```

## Testing Permissions

### 1. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uom.local","password":"123"}'
```

Response includes JWT token - copy it.

### 2. Test Permission Access
```bash
# With token in header
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users

# Should work for admin
# Should fail with 403 for student trying to view all users
```

### 3. Test Permission Denial
```bash
# Login as student
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"student@uom.local","password":"123"}'

# Try to create user (permission denied)
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com",...}'

# Returns 403 Forbidden
```

## Adding New Permissions

### Step 1: Define Permission in Database
```sql
INSERT INTO permissions (name, description, resource, action)
VALUES ('invoices.create', 'Create invoice', 'invoices', 'create');
```

### Step 2: Assign to Roles
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'invoices.create';
```

### Step 3: Use in Route
```javascript
router.post('/create', 
  authMiddleware, 
  rbacMiddleware('invoices.create'), 
  controller.create
);
```

## Modifying Role Permissions

### Grant Permission to Role
```javascript
const permissionRepo = require('../repositories/permissionRepository');

await permissionRepo.assignPermissionToRole(
  roleId,    // Role ID
  permissionId  // Permission ID
);
```

### Revoke Permission from Role
```javascript
await permissionRepo.removePermissionFromRole(
  roleId,
  permissionId
);
```

## Security Best Practices

1. **Always use RBAC middleware** - Every protected endpoint should have permission checks
2. **Principle of Least Privilege** - Grant only necessary permissions
3. **Database permissions** - Store permissions in DB for runtime flexibility
4. **Audit logging** - Consider logging permission denials
5. **Regular reviews** - Periodically audit role-permission mappings
6. **No hardcoded checks** - Avoid `if (user.role === 'admin')` in code

## Permission Hierarchy

```
auth.login (no auth required)
    ↓
User logged in, has role
    ↓
Check permissions for each endpoint
    ↓
Grant or deny access based on role permissions
```

## Monitoring and Debugging

### Query User Permissions
```sql
SELECT DISTINCT p.name, p.resource, p.action
FROM users u
INNER JOIN roles r ON u.role_id = r.id
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'student@uom.local';
```

### Query All Roles with Permissions
```sql
SELECT r.name as role, GROUP_CONCAT(p.name) as permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id, r.name;
```

### Check Specific Permission
```sql
SELECT COUNT(*) as hasPermission
FROM users u
INNER JOIN roles r ON u.role_id = r.id
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE u.id = 1 AND p.name = 'users.create';
```

## Future Enhancements

1. **Resource-Level Permissions** - User can edit only their own data
2. **Time-Based Access** - Permissions valid for specific time periods
3. **Conditional Permissions** - Permission depends on data state
4. **Audit Trail** - Log all permission checks and access
5. **Permission Groups** - Bundle related permissions
6. **API Rate Limiting by Permission** - Different limits for different roles

## Summary

✅ **Backend RBAC is fully implemented**
- Database-driven permission system
- Middleware for automatic permission checking
- Flexible, scalable, and maintainable
- All endpoints protected by permissions
- Admin can modify permissions without code changes
