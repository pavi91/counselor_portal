# RBAC System Architecture & Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                     │
│                   (React + Vite)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Requests
                       │ (JWT Token in Authorization Header)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend API                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Authentication Middleware                   │   │
│  │  • Verify JWT token                                 │   │
│  │  • Extract user ID and role                         │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ req.user = { id, email, role_id }     │
│  ┌──────────────────┴───────────────────────────────────┐   │
│  │        RBAC Permission Middleware                   │   │
│  │  • Query database for user permissions              │   │
│  │  • Check if permission is granted                   │   │
│  │  • Return 403 if denied                             │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ Permission Granted?                    │
│        ┌────────────┼────────────┐                           │
│        │ YES        │ NO         │                           │
│        ↓            ↓            ↓                           │
│   Route Handler  403 Forbidden   │                           │
│        │                         │                           │
│        └─────────────┬───────────┘                           │
│                      │                                       │
│                      ↓                                       │
│    ┌────────────────────────────────────┐                   │
│    │   Response (JSON)                   │                   │
│    │  • Success: 200, 201, 204           │                   │
│    │  • Forbidden: 403                   │                   │
│    │  • Not Found: 404                   │                   │
│    │  • Error: 500                       │                   │
│    └────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ JSON Response
                       ↓
                Frontend Updates UI
```

## Database Permission Model

```
┌──────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ id | email | password_hash | role_id | name | ...    │  │
│  │ 1  | admin | hash         | 1       | Saman| ...    │  │
│  │ 2  | staff | hash         | 2       | Sunil| ...    │  │
│  │ 3  | counsel| hash        | 3       | Niro | ...    │  │
│  │ 4  | student| hash        | 4       | Kasun| ...    │  │
│  └────────────────┬───────────────────────────────────────┘  │
│                   │ role_id FK                                │
│                   ↓                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    ROLES                              │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ id | name        | description                 │ │  │
│  │  │ 1  | admin       | Full system access          │ │  │
│  │  │ 2  | staff       | Staff permissions           │ │  │
│  │  │ 3  | counselor   | Counselor permissions       │ │  │
│  │  │ 4  | student     | Student permissions         │ │  │
│  │  └──────────┬────────────────────────────────────┘ │  │
│  │             │ role_id FK                           │  │
│  │             ↓                                       │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │          ROLE_PERMISSIONS                       │ │  │
│  │  │          (Many-to-Many)                         │ │  │
│  │  │  ┌────────────────────────────────────────────┐ │ │  │
│  │  │  │ role_id | permission_id                  │ │ │  │
│  │  │  │ 1       | 1 (users.view_all)            │ │ │  │
│  │  │  │ 1       | 2 (users.create)              │ │ │  │
│  │  │  │ 1       | 3 (users.delete)              │ │ │  │
│  │  │  │ ... (all permissions for admin)          │ │ │  │
│  │  │  │ 4       | 7 (applications.submit)       │ │ │  │
│  │  │  │ 4       | 8 (tickets.create)            │ │ │  │
│  │  │  │ ...                                      │ │ │  │
│  │  │  └────────────┬────────────────────────────┘ │ │  │
│  │  │               │ permission_id FK             │ │  │
│  │  │               ↓                              │ │  │
│  │  │  ┌────────────────────────────────────────────┐ │ │  │
│  │  │  │            PERMISSIONS                    │ │ │  │
│  │  │  │  ┌──────────────────────────────────────┐ │ │ │  │
│  │  │  │  │ id | name          | resource | action │ │ │ │  │
│  │  │  │  │ 1  | users.view_all| users   | view  │ │ │ │  │
│  │  │  │  │ 2  | users.create  | users   | create│ │ │ │  │
│  │  │  │  │ 3  | users.delete  | users   | delete│ │ │ │  │
│  │  │  │  │ 4  | users.edit    | users   | edit  │ │ │ │  │
│  │  │  │  │ ... (26 permissions total)            │ │ │ │  │
│  │  │  │  │ 7  | apps.submit   | apps    | submit│ │ │ │  │
│  │  │  │  │ 8  | tickets.create| tickets | create│ │ │ │  │
│  │  │  │  │ ...                                    │ │ │ │  │
│  │  │  │  └──────────────────────────────────────┘ │ │ │  │
│  │  │  └──────────────────────────────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Permission Assignment Example

### Student Role Permissions

```
┌─────────────────────────────────────────────────────────┐
│              STUDENT ROLE (id=4)                         │
│  Assigned Permissions:                                  │
│  ├─ applications.view_own        (view own app)         │
│  ├─ applications.submit          (submit app)           │
│  ├─ applications.edit_own        (edit own app)         │
│  ├─ hostels.view                 (view hostels)         │
│  ├─ hostels.view_allocation      (view own room)        │
│  ├─ tickets.create               (create ticket)        │
│  ├─ tickets.view_own             (view own tickets)     │
│  ├─ tickets.reply                (reply to ticket)      │
│  ├─ role_requests.create         (request role change)  │
│  ├─ auth.login                   (login)                │
│  └─ auth.verify                  (verify token)         │
└─────────────────────────────────────────────────────────┘

NOT PERMITTED:
├─ users.view_all (cannot see all users)
├─ users.create (cannot create users)
├─ applications.view_all (cannot see all apps)
├─ applications.review (cannot review apps)
├─ hostels.manage (cannot manage hostels)
├─ tickets.view_assigned (cannot see assigned tickets)
├─ role_requests.view_all (cannot see role requests)
└─ role_requests.process (cannot process requests)
```

### Admin Role Permissions

```
┌─────────────────────────────────────────────────────────┐
│              ADMIN ROLE (id=1)                           │
│  Assigned Permissions: ALL 26 PERMISSIONS               │
│  ├─ USER MANAGEMENT                                     │
│  │  ├─ users.view_all                                  │
│  │  ├─ users.create                                    │
│  │  ├─ users.edit                                      │
│  │  ├─ users.delete                                    │
│  │  ├─ users.change_role                               │
│  │  └─ users.bulk_create                               │
│  ├─ APPLICATION MANAGEMENT                              │
│  │  ├─ applications.view_all                           │
│  │  ├─ applications.view_own                           │
│  │  ├─ applications.submit                             │
│  │  ├─ applications.review                             │
│  │  └─ applications.edit_own                           │
│  ├─ HOSTEL MANAGEMENT                                   │
│  │  ├─ hostels.view                                    │
│  │  ├─ hostels.view_stats                              │
│  │  ├─ hostels.manage                                  │
│  │  ├─ hostels.assign                                  │
│  │  └─ hostels.view_allocation                         │
│  ├─ TICKET MANAGEMENT                                   │
│  │  ├─ tickets.create                                  │
│  │  ├─ tickets.view_own                                │
│  │  ├─ tickets.view_assigned                           │
│  │  ├─ tickets.reply                                   │
│  │  └─ tickets.resolve                                 │
│  ├─ ROLE REQUEST MANAGEMENT                             │
│  │  ├─ role_requests.view_all                          │
│  │  ├─ role_requests.create                            │
│  │  └─ role_requests.process                           │
│  └─ AUTHENTICATION                                       │
│     ├─ auth.login                                      │
│     └─ auth.verify                                     │
└─────────────────────────────────────────────────────────┘
```

## Request Flow with RBAC

```
Student tries to POST /api/users (create new user)
        │
        ↓
Authentication Middleware
├─ Extract JWT token from Authorization header
├─ Verify JWT signature with secret key
├─ Check if token is expired
├─ Extract user data: { id: 4, email: 'student@uom.local', role_id: 4 }
└─ ✅ Authentication successful, proceed to next middleware
        │
        ↓
RBAC Middleware [requires: 'users.create']
├─ Query database:
│  SELECT DISTINCT p.name 
│  FROM users u
│  JOIN roles r ON u.role_id = r.id
│  JOIN role_permissions rp ON r.id = rp.role_id
│  JOIN permissions p ON rp.permission_id = p.id
│  WHERE u.id = 4
│
├─ Result: ['applications.submit', 'tickets.create', ...]
│          (No 'users.create' permission)
│
├─ Check: Does student have 'users.create'?
│  → NO
│
└─ ❌ Permission denied
        │
        ↓
Return 403 Forbidden Response
{
  "error": "Forbidden",
  "message": "User lacks required permissions. Requires one of: users.create",
  "requiredPermissions": ["users.create"],
  "userPermissions": [
    "applications.view_own",
    "applications.submit",
    "applications.edit_own",
    "hostels.view",
    "hostels.view_allocation",
    "tickets.create",
    "tickets.view_own",
    "tickets.reply",
    "role_requests.create",
    "auth.login",
    "auth.verify"
  ]
}
```

## Permission Check Decision Tree

```
                    API Request
                        │
                        ↓
            Is JWT token present?
              /              \
            NO               YES
            ↓                ↓
        401 Unauthorized   Verify JWT
                            │
                    ┌───────┴────────┐
                    │ Token valid?   │
                  NO│               │YES
                    ↓               ↓
              401 Unauthorized  Check Permission
                            │
                    ┌───────┴────────┐
                    │ Permission?    │
                  NO│               │YES
                    ↓               ↓
              403 Forbidden   Execute Route
                (with error    Handler
                 details)       │
                                ↓
                            200/201/204
                        (Success Response)
```

## Permission Matrix by Role

```
┌─────────────────┬───────┬─────────┬───────────┬─────────┐
│ Permission      │ Admin │ Staff   │ Counselor │ Student │
├─────────────────┼───────┼─────────┼───────────┼─────────┤
│ users.view_all  │   ✓   │    ✓    │     ✓     │    ✗    │
│ users.create    │   ✓   │    ✓    │     ✗     │    ✗    │
│ users.edit      │   ✓   │    ✗    │     ✗     │    ✗    │
│ users.delete    │   ✓   │    ✗    │     ✗     │    ✗    │
│ users.change_role│  ✓   │    ✗    │     ✗     │    ✗    │
│ users.bulk_create│  ✓   │    ✓    │     ✗     │    ✗    │
├─────────────────┼───────┼─────────┼───────────┼─────────┤
│ apps.view_all   │   ✓   │    ✓    │     ✓     │    ✗    │
│ apps.view_own   │   ✓   │    ✗    │     ✗     │    ✓    │
│ apps.submit     │   ✓   │    ✗    │     ✗     │    ✓    │
│ apps.review     │   ✓   │    ✓    │     ✗     │    ✗    │
│ apps.edit_own   │   ✓   │    ✗    │     ✗     │    ✓    │
├─────────────────┼───────┼─────────┼───────────┼─────────┤
│ hostels.view    │   ✓   │    ✓    │     ✓     │    ✓    │
│ hostels.view_stats│ ✓   │    ✓    │     ✓     │    ✗    │
│ hostels.manage  │   ✓   │    ✓    │     ✗     │    ✗    │
│ hostels.assign  │   ✓   │    ✓    │     ✗     │    ✗    │
│ hostels.view_alloc│ ✓   │    ✗    │     ✗     │    ✓    │
├─────────────────┼───────┼─────────┼───────────┼─────────┤
│ tickets.create  │   ✓   │    ✗    │     ✗     │    ✓    │
│ tickets.view_own│   ✓   │    ✗    │     ✗     │    ✓    │
│ tickets.view_assigned│ ✓ │  ✓     │     ✓     │    ✗    │
│ tickets.reply   │   ✓   │    ✓    │     ✓     │    ✓    │
│ tickets.resolve │   ✓   │    ✓    │     ✓     │    ✗    │
├─────────────────┼───────┼─────────┼───────────┼─────────┤
│ role_req.view_all│  ✓   │    ✓    │     ✗     │    ✗    │
│ role_req.create │   ✓   │    ✗    │     ✓     │    ✓    │
│ role_req.process│   ✓   │    ✗    │     ✗     │    ✗    │
├─────────────────┼───────┼─────────┼───────────┼─────────┤
│ auth.login      │   ✓   │    ✓    │     ✓     │    ✓    │
│ auth.verify     │   ✓   │    ✓    │     ✓     │    ✓    │
└─────────────────┴───────┴─────────┴───────────┴─────────┘
```

## Middleware Execution Order

```
Request Arrives
    │
    ↓
1. CORS Middleware
    │ (Allow cross-origin requests)
    ↓
2. JSON Parser Middleware
    │ (Parse request body)
    ↓
3. Morgan Logger
    │ (Log HTTP requests)
    ↓
4. Authentication Middleware ← Mandatory for protected routes
    │ (Verify JWT, extract user)
    ↓
5. RBAC Middleware ← Mandatory for protected routes
    │ (Check permissions in database)
    ↓
6. Route Handler
    │ (Execute business logic)
    ↓
7. Error Handler Middleware
    │ (Catch and format errors)
    ↓
Response Sent
```

## Database Query Performance

### Efficient Permission Check

The RBAC middleware uses an optimized query:

```sql
-- Single query to get user permissions
SELECT DISTINCT p.name
FROM users u
INNER JOIN roles r ON u.role_id = r.id
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE u.id = ?

-- Indexes help performance:
-- - users.id (PRIMARY KEY)
-- - roles.id (PRIMARY KEY)
-- - role_permissions.role_id
-- - role_permissions.permission_id
-- - permissions.id (PRIMARY KEY)
```

### Performance Optimization Tips

1. **Cache Permissions** (for high traffic)
   - Cache user permissions in Redis
   - Invalidate when role permissions change

2. **Use Connection Pooling**
   - MySQL2 provides built-in pooling
   - Reduce connection overhead

3. **Batch Permission Checks**
   - Check multiple users in single query if needed
   - Reduce round trips to database

---

## Summary

The RBAC system provides:
- ✅ Centralized permission management
- ✅ Database-driven security
- ✅ Flexible role assignment
- ✅ Scalable architecture
- ✅ Detailed access logging
- ✅ Enterprise-grade security
