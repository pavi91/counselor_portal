# Frontend-Backend Integration Guide

## Overview

The counselor portal frontend is now fully integrated with the Express + MySQL backend using a layered architecture.

## Architecture

### Backend Layers
```
Routes → Controllers → Services → Repositories → Database
```

- **Routes**: Define API endpoints and apply middleware
- **Controllers**: Handle HTTP requests/responses
- **Services**: Implement business logic
- **Repositories**: Direct database access
- **Database**: MySQL with 1NF normalized schema

### Frontend API Layer
```
Components → API Files → apiClient → Backend
```

- **Components/Pages**: UI logic
- **API Files**: Clean API interfaces per domain
- **apiClient**: Axios instance with auth interceptor
- **Backend**: Express REST API

## API Integration

### Authentication Flow

1. **Login**:
   - Frontend: `authApi.loginAPI(email, password)`
   - Backend: `POST /api/auth/login`
   - Response: `{ user: {...}, token: "jwt..." }`
   - Token stored in localStorage via `authService`

2. **Authenticated Requests**:
   - apiClient automatically adds `Authorization: Bearer <token>` header
   - Backend validates token via `authMiddleware`
   - Invalid tokens return 401

3. **Token Verification**:
   - On app load, AuthContext checks for existing token
   - Calls `GET /api/auth/verify` to restore session
   - Removes token if invalid/expired

### API Modules

#### 1. Authentication (`authApi.js`)
- `loginAPI(email, password)` → Backend user validation
- `verifyTokenAPI(token)` → Token verification

#### 2. Users (`userApi.js`)
- `getUsersAPI(query)` → Search/list users
- `createUserAPI(user)` → Single user creation
- `updateUserRoleAPI(userId, role)` → Role updates
- `bulkCreateUsersAPI(users)` → Bulk import
- `deleteUserAPI(userId)` → User deletion
- `getRoleRequestsAPI()` → Counselor role requests
- `createRoleRequestAPI(userId, message, attachment)` → Submit request
- `processRoleRequestAPI(requestId, action)` → Approve/reject

#### 3. Applications (`applicationApi.js`)
- `getMyApplicationAPI(userId)` → Student's application
- `getAllApplicationsAPI()` → All applications (admin view)
- `submitApplicationAPI(userId, formData)` → Submit/update
- `updateApplicationStatusAPI(appId, status)` → Process application
- `calculatePoints(data)` → Client-side point preview

#### 4. Hostels (`hostelApi.js`)
- `getHostelsAPI()` → List hostel names
- `getHostelStatsAPI(hostelName)` → Room statistics
- `getAllAllocationsAPI()` → All allocations
- `getStudentHostelDetailsAPI(userId)` → Student's room
- `assignRoomAPI(userId, roomId)` → Assign room
- `removeAllocationAPI(userId)` → Remove assignment
- `createRoomAPI(roomData)` → Add new room

#### 5. Tickets (`ticketApi.js`)
- `getStudentTicketsAPI(studentId)` → Student's tickets
- `getCounselorTicketsAPI(counselorId)` → Counselor's tickets
- `createTicketAPI(studentId, counselorId, subject, message, attachment)` → New ticket
- `replyToTicketAPI(ticketId, senderId, message, attachment)` → Reply
- `updateTicketStatusAPI(ticketId, status)` → Close/reopen

## Configuration

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=db_user
DB_PASSWORD=your_password
DB_NAME=counselor_portal
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

### Frontend (apiClient.js)
```javascript
const API_URL = 'http://localhost:5000/api';
```

## Error Handling

### Backend
- Services throw errors with `status` and `message`
- `errorHandler` middleware catches and formats responses
- 4xx errors: Client mistakes (validation, not found, etc.)
- 5xx errors: Server errors (logged to console)

### Frontend
- API calls wrapped in try-catch
- Axios errors contain `response.data.message`
- UI displays error messages to users
- 401 errors trigger logout/redirect

## Data Format Normalization

### Camel Case Conversion
- **Database**: snake_case (e.g., `user_id`, `start_date`)
- **Backend**: camelCase in responses (e.g., `userId`, `startDate`)
- **Frontend**: camelCase throughout

Repositories handle conversion using SQL aliases:
```sql
SELECT user_id AS userId, start_date AS startDate FROM allocations
```

## Best Practices Implemented

1. **Separation of Concerns**
   - Each layer has single responsibility
   - Services contain business logic, not SQL
   - Controllers don't call repositories directly

2. **DRY Principle**
   - apiClient handles auth headers globally
   - Point calculation logic shared where needed
   - Reusable error handling

3. **Security**
   - JWT tokens for authentication
   - Middleware validates all protected routes
   - Passwords hashed with bcrypt (production)

4. **Database Normalization**
   - 1NF compliance
   - Atomic columns only
   - Separate tables for repeating groups

5. **Consistent API Design**
   - RESTful endpoints
   - Predictable response formats
   - Proper HTTP status codes

## Testing the Integration

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Test Login**:
   - Email: `student@uom.local`
   - Password: `123`

4. **Verify Integration**:
   - Check browser Network tab for API calls
   - Backend logs show incoming requests
   - Database updates reflect in UI

## Common Issues

### CORS Errors
- Backend has `cors()` middleware enabled
- Accepts requests from any origin in development

### 401 Unauthorized
- Token expired or invalid
- Clear localStorage and re-login

### Database Connection
- Check `.env` credentials
- Verify MySQL service is running
- Test with `/api/health` endpoint

### Data Not Showing
- Check browser console for errors
- Verify backend returns expected format
- Check Network tab for response data
