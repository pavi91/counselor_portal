# Role-Based User Filtering

## Problem Solved

Previously, `/api/users` returned **all users** regardless of the calling context. This is inefficient and violates the principle of minimal data return.

Now, the backend supports **role-based filtering** to return only users you actually need.

---

## New API: `/api/users` with Role Parameter

### Get Counselors Only
```bash
GET /api/users?role=counselor
```

**Response**:
```json
[
  {
    "id": 2,
    "email": "counselor@uom.local",
    "name": "Dr. Nirosha Bandara",
    "role": "counselor",
    "index_number": null,
    "full_name": null,
    "mobile_phone": null
  }
]
```

### Get Students Only
```bash
GET /api/users?role=student
```

### Get Staff Only
```bash
GET /api/users?role=staff
```

### Get Admins Only
```bash
GET /api/users?role=admin
```

---

## With Search Filter

Combine role filtering with text search:

```bash
GET /api/users?role=counselor&q=nirosha
GET /api/users?role=student&q=kasun
```

---

## Frontend Usage

### Method 1: Get All Users (with admin/staff check)
```javascript
import { getUsersAPI } from '../api/userApi';

const users = await getUsersAPI(); // No role = all users
```

### Method 2: Get Specific Role (RECOMMENDED)
```javascript
import { getUsersByRoleAPI } from '../api/userApi';

// Get only counselors
const counselors = await getUsersByRoleAPI('counselor');

// Get only students  
const students = await getUsersByRoleAPI('student');

// Get only students named "kasun"
const filteredStudents = await getUsersByRoleAPI('student', 'kasun');
```

---

## Why This Is Better

| Aspect | Before | After |
|--------|--------|-------|
| Data Returned | All users (unfiltered) | Only requested role |
| Response Size | Large | Small & focused |
| Network Usage | High | Minimized |
| Security | All user data exposed | Only needed data |
| Performance | Slower | Faster |
| API Contract | Unclear what client needs | Explicit intent |

---

## Examples by Use Case

### 1. Counselor Selection Form (StudentTickets.jsx)
```javascript
// Only fetch counselors for the dropdown
const counselors = await getUsersByRoleAPI('counselor');
```

### 2. Hostel Occupancy (HostelManagement.jsx)
```javascript
// Get allocated students
const students = await getUsersByRoleAPI('student');
```

### 3. Admin User Management (UserManagement.jsx)
```javascript
// Get all users for admin dashboard
const allUsers = await getUsersAPI(); // No role filter

// Or with search
const searchResults = await getUsersAPI('john');
```

### 4. Role Requests (AdminRoleRequests.jsx)
```javascript
// Get only staff who might request counselor role
const staff = await getUsersByRoleAPI('staff');
```

---

## Implementation Details

### Backend
```javascript
// userRepository.js - New method
const getUsersByRole = async (roleName, query = '') => {
  // Filters users by role with optional text search
};

// userService.js - New method
const getUsersByRole = async (roleName, query = '') => {
  // Validates role, calls repository
};

// userController.js - Updated
const getUsers = async (req, res, next) => {
  const role = req.query.role;
  if (role) {
    users = await userService.getUsersByRole(role, query);
  } else {
    users = await userService.getUsers(query);
  }
};
```

### Frontend
```javascript
// userApi.js - Enhanced
export const getUsersByRoleAPI = async (role, query = '') => {
  return getUsersAPI(query, role); // Adds ?role=X to query
};
```

---

## Migration Guide

### Update Your Pages

**Before**:
```javascript
const users = await getUsersAPI();
const counselors = users.filter(u => u.role === 'counselor');
```

**After**:
```javascript
const counselors = await getUsersByRoleAPI('counselor');
```

Benefits:
- ✅ Network request returns only 1 counselor instead of 8 users
- ✅ No client-side filtering needed
- ✅ Clearer intent in code
- ✅ Server handles optimization

---

## Role Values

Use these exact strings:
- `student` - Students
- `counselor` - Counselors
- `staff` - Staff members
- `admin` - Administrators

---

## Security Note

The backend validates the role parameter and only returns users with that role. No sensitive data (password_hash, created_at, permanent_address) is ever exposed regardless of filtering.
