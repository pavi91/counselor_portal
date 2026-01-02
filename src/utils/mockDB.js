// src/utils/mockDB.js

// --- PERMISSIONS CONFIGURATION ---
export const ROLE_PERMISSIONS = {
  admin: {
    canViewUsers: true,
    canCreateUser: true,
    canDeleteUser: true,
    canUpdateRole: true,
    canBulkUpload: true,
    canViewHostelStats: true,
    canViewHostelDetails: true,
  },
  staff: {
    canViewUsers: true,
    canCreateUser: true,       // Staff can create users
    canDeleteUser: false,      // But cannot delete
    canUpdateRole: false,      // Or change roles
    canBulkUpload: false,      // No bulk upload
    canViewHostelStats: true,  // Can see capacity
    canViewHostelDetails: true,// Can track students
  },
  counselor: {
    canViewUsers: true,
    canCreateUser: false,
    canDeleteUser: false,
    canUpdateRole: false,
    canBulkUpload: false,
    canViewHostelStats: false,
    canViewHostelDetails: false,
  },
  student: {
    canViewUsers: false,
    // ... limited access
  }
};

// --- EXISTING DATA ---

export const MOCK_USERS = [
  { id: 1, email: "admin@school.com", password: "123", role: "admin", name: "Principal Skinner" },
  { id: 2, email: "counselor@school.com", password: "123", role: "counselor", name: "Mr. Mackey" },
  { id: 3, email: "staff@school.com", password: "123", role: "staff", name: "Groundskeeper Willie" },
  { id: 4, email: "student@school.com", password: "123", role: "student", name: "Bart Simpson" },
  { id: 5, email: "milhouse@school.com", password: "123", role: "student", name: "Milhouse Van Houten" },
  { id: 6, email: "nelson@school.com", password: "123", role: "student", name: "Nelson Muntz" },
];

export const generateMockJWT = (user) => {
  const payload = JSON.stringify({ ...user, exp: Date.now() + 3600000 }); 
  return `fake-jwt-header.${btoa(payload)}.fake-signature`;
};

export const MOCK_HOSTEL_ROOMS = [
  { id: 101, floor: 1, number: "101", capacity: 2 },
  { id: 102, floor: 1, number: "102", capacity: 2 },
  { id: 201, floor: 2, number: "201", capacity: 4 }, 
  { id: 202, floor: 2, number: "202", capacity: 1 }, 
];

export const MOCK_ALLOCATIONS = [
  { id: 1, userId: 4, roomId: 101, startDate: "2024-01-15", endDate: "2024-12-15" }, 
  { id: 2, userId: 5, roomId: 101, startDate: "2024-02-01", endDate: "2024-12-15" }, 
  { id: 3, userId: 6, roomId: 201, startDate: "2024-03-10", endDate: "2025-03-10" }, 
];