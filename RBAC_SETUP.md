# RBAC Setup Instructions

## Quick Summary

**Yes, we are now doing full RBAC at the backend level!** 

All API endpoints are protected by permission checks stored in the MySQL database. Permissions are NOT hardcoded - they're managed entirely in the database.

## What Changed

### 1. Database Schema Updates
- ✅ Added `permissions` table - stores all available permissions
- ✅ Added `role_permissions` table - links roles to permissions
- ✅ Updated `users` table - now has `role_id` foreign key
- ✅ Updated `roles` table - added description field

### 2. Backend Middleware
- ✅ Created `rbacMiddleware.js` - enforces permission checks on all protected endpoints
- ✅ Middleware queries database to get user permissions
- ✅ Returns 403 Forbidden if user lacks permission

### 3. All Routes Updated with RBAC
- ✅ `/api/users/*` - require specific user permissions
- ✅ `/api/applications/*` - require specific application permissions
- ✅ `/api/hostels/*` - require specific hostel permissions
- ✅ `/api/tickets/*` - require specific ticket permissions
- ✅ `/api/role-requests/*` - require specific role request permissions

### 4. Permission Repository
- ✅ Created `permissionRepository.js` for permission operations
- ✅ Functions to get, assign, revoke permissions

## Database Setup

### Run These SQL Commands

The schema changes are in `backend/sql/schema.sql` and seed data is in `backend/sql/seed.sql`.

If your database is already created, you need to:

1. **Drop and recreate the database:**
```bash
mysql -u db_user -p counselor_portal < backend/sql/schema.sql
mysql -u db_user -p counselor_portal < backend/sql/seed.sql
```

Or manually run:

2. **Create permission tables:**
```sql
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY uq_role_permission (role_id, permission_id)
) ENGINE=InnoDB;
```

3. **Insert permissions and role mappings** - Use `seed.sql` which includes all permissions and role assignments.

## How It Works

```
User makes API request
    ↓
authMiddleware validates JWT token
    ↓
rbacMiddleware checks permission
    ↓
Query database: "Does this user's role have this permission?"
    ↓
If YES → Route handler executes
If NO  → Return 403 Forbidden
```

## Example: User Permission Flow

### Admin User (All Permissions)
```
POST /api/users (create user)
↓
rbacMiddleware('users.create')
↓
Query: SELECT permissions for admin role
↓
Result: Admin has 'users.create' permission
↓
✅ Route executes, user created
```

### Student User (Limited Permissions)
```
POST /api/users (create user)
↓
rbacMiddleware('users.create')
↓
Query: SELECT permissions for student role
↓
Result: Student does NOT have 'users.create' permission
↓
❌ Returns 403 Forbidden
```

## File Changes Summary

### New Files
- `backend/src/middlewares/rbacMiddleware.js` - Permission checking middleware
- `backend/src/repositories/permissionRepository.js` - Permission management functions
- `backend/src/swagger/swaggerConfig.js` - Swagger configuration (from earlier)
- `RBAC_IMPLEMENTATION.md` - Detailed RBAC documentation
- `SWAGGER_DOCUMENTATION.md` - Swagger documentation (from earlier)

### Modified Files
- `backend/sql/schema.sql` - Added permissions and role_permissions tables
- `backend/sql/seed.sql` - Added permission definitions and role-permission mappings
- `backend/src/routes/userRoutes.js` - Added RBAC middleware to all endpoints
- `backend/src/routes/applicationRoutes.js` - Added RBAC middleware to all endpoints
- `backend/src/routes/hostelRoutes.js` - Added RBAC middleware to all endpoints
- `backend/src/routes/ticketRoutes.js` - Added RBAC middleware to all endpoints
- `backend/src/routes/roleRequestRoutes.js` - Added RBAC middleware to all endpoints
- `backend/src/app.js` - Added Swagger UI (from earlier)

## Testing the RBAC System

### Test 1: Login as Admin and Access User List
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uom.local","password":"123"}'

# Should return token
# Copy the token and use it

# Access users (admin has permission)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users

# ✅ Should return list of users
```

### Test 2: Login as Student and Try to Create User
```bash
# Login as student
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@uom.local","password":"123"}'

# Try to create user (student doesn't have permission)
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@test.com","password":"pass123","role":"student"}'

# ❌ Should return 403 Forbidden
# {
#   "error": "Forbidden",
#   "message": "User lacks required permissions. Requires one of: users.create",
#   "requiredPermissions": ["users.create"],
#   "userPermissions": ["applications.view_own", "applications.submit", ...]
# }
```

### Test 3: Check Swagger Documentation
```
http://localhost:5000/api/docs
```
All endpoints now show permission requirements in descriptions.

## Default Users for Testing

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@uom.local | 123 | Admin | All |
| staff@uom.local | 123 | Staff | User management, Applications, Hostels, Tickets |
| counselor@uom.local | 123 | Counselor | Users, Applications, Hostels, Tickets |
| student@uom.local | 123 | Student | Own applications, Tickets, Hostel allocation |

## Managing Permissions

### Change Role Permissions in Database

```sql
-- Add permission to role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p
WHERE r.name = 'counselor' AND p.name = 'users.delete';

-- Remove permission from role
DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE name = 'counselor')
AND permission_id = (SELECT id FROM permissions WHERE name = 'users.delete');
```

### View All Permissions
```sql
SELECT * FROM permissions ORDER BY resource, action;
```

### View Role Permissions
```sql
SELECT r.name, GROUP_CONCAT(p.name)
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id;
```

## Key Differences from Before

### Before (No RBAC)
```javascript
router.get('/users', authMiddleware, userController.getUsers);
// Anyone authenticated could access this
```

### After (With RBAC)
```javascript
router.get('/users', 
  authMiddleware, 
  rbacMiddleware('users.view_all'),  // Permission check
  userController.getUsers
);
// Only users with 'users.view_all' permission can access
```

## Next Steps

1. ✅ Database schema updated with permissions
2. ✅ All routes now require specific permissions
3. ✅ RBAC middleware implemented
4. Test your endpoints with different user roles
5. Adjust permissions in database as needed
6. Monitor access denied (403) responses
7. Scale to more granular permissions as needed

## API Error Responses

### 401 Unauthorized (Authentication Failed)
```json
{
  "error": "Unauthorized",
  "message": "User not authenticated"
}
```

### 403 Forbidden (Authentication OK, Permission Denied)
```json
{
  "error": "Forbidden",
  "message": "User lacks required permissions. Requires one of: users.create",
  "requiredPermissions": ["users.create"],
  "userPermissions": ["students.view", "applications.submit"]
}
```

## Troubleshooting

### Permission Denied When It Shouldn't Be
1. Check user's role: `SELECT role_id FROM users WHERE id = ?`
2. Check role permissions: `SELECT p.name FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id WHERE rp.role_id = ?`
3. Verify permission exists: `SELECT * FROM permissions WHERE name = 'xxx.yyy'`

### New User Can't Access Endpoint
1. Verify user's role is set correctly
2. Verify role has the required permission assigned
3. Check permission name in middleware matches exactly
4. Ensure role_permissions record exists

### See All Available Permissions
```sql
SELECT id, name, description, resource, action 
FROM permissions 
ORDER BY resource, action;
```

## Performance Considerations

- Permissions are queried on **every request** to protected endpoints
- For high-traffic systems, consider caching permissions in memory
- Redis can cache user permissions for faster lookups
- Invalidate cache when role permissions change
