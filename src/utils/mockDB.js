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
    canManageTenants: true,      // Manage Rooms/Allocations
    canCreateRoom: true,         // Structural changes
    canViewApplications: true,   // View student applications
    canProcessApplications: true,// Approve/Reject
    canApplyHostel: false,
  },
  staff: {
    canViewUsers: true,
    canCreateUser: true,
    canDeleteUser: false,
    canUpdateRole: false,
    canBulkUpload: false,
    canViewHostelStats: true,
    canViewHostelDetails: true,
    canManageTenants: true,      // Staff can assign rooms
    canCreateRoom: false,
    canViewApplications: true,   // Staff can view apps
    canProcessApplications: true,// Staff can approve/reject
    canApplyHostel: false,
  },
  counselor: {
    // ... (unchanged mainly)
    canViewUsers: true,
    canCreateUser: false,
    canDeleteUser: false,
    canManageTenants: false,
    canViewApplications: false,
    canApplyHostel: false,
  },
  student: {
    canViewUsers: false,
    canManageTenants: false,
    canViewApplications: false,
    canApplyHostel: true,        // Student can apply
  }
};

// --- DATA ---

export const MOCK_USERS = [
  { id: 1, email: "admin@school.com", password: "123", role: "admin", name: "Principal Skinner" },
  { id: 3, email: "staff@school.com", password: "123", role: "staff", name: "Groundskeeper Willie" },
  { id: 4, email: "student@school.com", password: "123", role: "student", name: "Bart Simpson" },
  { id: 5, email: "milhouse@school.com", password: "123", role: "student", name: "Milhouse Van Houten" },
  { id: 6, email: "nelson@school.com", password: "123", role: "student", name: "Nelson Muntz" },
  // ... others
];

export const generateMockJWT = (user) => {
  const payload = JSON.stringify({ ...user, exp: Date.now() + 3600000 }); 
  return `fake-jwt-header.${btoa(payload)}.fake-signature`;
};

// Rooms (Tenant Management)
export let MOCK_HOSTEL_ROOMS = [
  { id: 101, floor: 1, number: "101", capacity: 2, type: "Double" },
  { id: 102, floor: 1, number: "102", capacity: 2, type: "Double" },
  { id: 201, floor: 2, number: "201", capacity: 1, type: "Single" },
  { id: 202, floor: 2, number: "202", capacity: 2, type: "Double" },
];

export let MOCK_ALLOCATIONS = [
  { id: 1, userId: 4, roomId: 101, startDate: "2024-01-15", endDate: "2024-12-15" }, 
];

// Applications (New)
// Status: 'pending', 'approved', 'rejected'
export let MOCK_APPLICATIONS = [
  { 
    id: 1, 
    userId: 5, // Milhouse
    distance: 120, // km
    income: 25000, 
    gpa: 3.8,
    points: 85, 
    status: 'pending',
    submissionDate: '2024-02-10'
  }
];