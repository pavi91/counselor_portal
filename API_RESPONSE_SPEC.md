# API Response Best Practices

## Principle: Return Only What's Needed

Never return sensitive or unnecessary data. Each endpoint returns a minimal, purposeful response structure.

---

## 1. Authentication

### `POST /api/auth/login`
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
**⚠️ Never returns**: password_hash, created_at, personal details

---

## 2. Users

### `GET /api/users?q=search`
```json
[
  {
    "id": 4,
    "email": "student@uom.local",
    "name": "Kasun Wijeratne",
    "role": "student",
    "index_number": "ST-2024-004",
    "mobile_phone": "0777123456"
  }
]
```
**⚠️ Never returns**: password_hash, created_at, permanent_address, resident_phone, gender

### `POST /api/users`
Returns single user object (same structure as GET list)

### `PATCH /api/users/:id/role`
```json
{
  "id": 3,
  "email": "staff@uom.local",
  "name": "Sunil Jayasinghe",
  "role": "counselor"
}
```

---

## 3. Role Requests

### `GET /api/role-requests`
```json
[
  {
    "id": 901,
    "user_id": 3,
    "userName": "Sunil Jayasinghe",
    "userEmail": "staff@uom.local",
    "message": "I have completed a counselling certificate...",
    "attachment": "certificate.pdf",
    "status": "pending",
    "created_at": "2024-03-12"
  }
]
```
**⚠️ Never returns**: user's personal details, password

---

## 4. Applications

### `GET /api/applications`
```json
[
  {
    "id": 1,
    "user_id": 5,
    "studentName": "Amal Fernando",
    "studentEmail": "amal@student.uom.lk",
    "status": "approved",
    "points": 85,
    "submission_date": "2024-02-10",
    "full_name": "Amal Sachintha Fernando",
    "index_number": "ST-2024-001",
    "email": "amal@student.uom.lk",
    "gender": "male",
    "mobile_phone": "0771234567",
    "district": "Galle",
    "closest_town": "Galle Town",
    "distance_to_town": 4,
    "distance": 120,
    "faculty": "Engineering",
    "department": "Software",
    "year": "first_year"
  }
]
```
**⚠️ Never returns**: Emergency contact details, file paths (only stored server-side), sensitive personal data

### `GET /api/applications/user/:userId`
Same structure (single object instead of array)

### `POST /api/applications/user/:userId`
```json
{
  "id": 2,
  "user_id": 4,
  "status": "pending",
  "points": 92,
  "submission_date": "2026-02-03"
}
```

---

## 5. Hostels

### `GET /api/hostels`
```json
[
  "Men's Hostel A",
  "Women's Hostel B"
]
```

### `GET /api/hostels/stats?hostel=Men's Hostel A`
```json
{
  "totalCapacity": 4,
  "occupiedBeds": 2,
  "availableBeds": 2,
  "roomStats": [
    {
      "id": 101,
      "hostel_id": 1,
      "number": "101",
      "floor": 1,
      "capacity": 2,
      "type": "Double",
      "hostel": "Men's Hostel A",
      "occupants": [
        {
          "id": 1,
          "userId": 4,
          "studentName": "Kasun Wijeratne",
          "studentEmail": "student@uom.local",
          "startDate": "2024-01-15",
          "endDate": "2024-12-15"
        }
      ],
      "currentOccupancy": 1,
      "isFull": false,
      "availableSlots": 1
    }
  ]
}
```

### `GET /api/hostels/allocations/:userId`
```json
{
  "id": 1,
  "userId": 4,
  "roomId": 101,
  "roomNumber": "101",
  "floor": 1,
  "hostelName": "Men's Hostel A",
  "startDate": "2024-01-15",
  "endDate": "2024-12-15"
}
```

---

## 6. Tickets

### `GET /api/tickets/student/:studentId`
```json
[
  {
    "id": 101,
    "student_id": 4,
    "counselor_id": 2,
    "subject": "Academic stress",
    "status": "open",
    "created_at": "2024-03-10",
    "studentName": "Kasun Wijeratne",
    "counselorName": "Dr. Nirosha Bandara",
    "messages": [
      {
        "id": 1,
        "ticket_id": 101,
        "sender_id": 4,
        "text": "I feel stressed with exams...",
        "attachment": null,
        "created_at": "2024-03-10 09:00"
      }
    ]
  }
]
```

---

## Why These Practices?

1. **Security**: Never expose password_hash, sensitive timestamps, or internal IDs
2. **Performance**: Smaller JSON responses = faster transmission
3. **API Stability**: Clients rely on specific fields; returning extras breaks contracts
4. **Privacy**: Only expose data that clients need for their function
5. **Consistency**: Predictable response structures across similar endpoints

---

## Implementation Pattern

```javascript
// ❌ BAD - Returns everything
const [rows] = await db.query(`SELECT * FROM users`);

// ✅ GOOD - Returns only needed fields
const [rows] = await db.query(`
  SELECT u.id, u.email, u.name, u.role_id, u.index_number, r.name AS role
  FROM users u
  JOIN roles r ON r.id = u.role_id
`);
```

---

## Frontend Expectations

Frontend API calls now receive **only** the fields documented above. Components must:

1. ✅ Use fields from documented response structure
2. ❌ Don't assume extra fields exist
3. ✅ Handle optional fields gracefully
4. ❌ Never expect password_hash or sensitive data

**Example**:
```javascript
// ✅ Good
const { id, name, role, email } = user;

// ❌ Bad (field doesn't exist)
const { id, name, role, passwordHash } = user;
```
