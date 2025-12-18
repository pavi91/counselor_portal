// src/services/mockApi.js

// --- Mock Database ---
const MOCK_USERS = [
  { id: 1, email: "admin@portal.com", role: "admin", name: "Super Admin" },
  { id: 2, email: "student@portal.com", role: "student", name: "John Doe", regNo: "STU001" },
  { id: 3, email: "counselor@portal.com", role: "counselor", name: "Dr. Sarah Smith" },
];

const MOCK_COUNSELORS = [
  { id: 101, name: "Dr. Sarah Smith", specialty: "Academic Stress", available: true },
  { id: 102, name: "Dr. Alan Grant", specialty: "Career Guidance", available: false },
  { id: 103, name: "Ms. Jane Doe", specialty: "Personal Counseling", available: true },
];

// Updated Hostel Data with Floors and Capacity
const MOCK_HOSTEL_DATA = [
  { id: '101', floor: 1, type: '4-Sharing', capacity: 4, filled: 2, status: 'available' },
  { id: '102', floor: 1, type: '4-Sharing', capacity: 4, filled: 4, status: 'full' },
  { id: '103', floor: 1, type: '2-Sharing', capacity: 2, filled: 1, status: 'available' },
  { id: '201', floor: 2, type: '4-Sharing', capacity: 4, filled: 0, status: 'available' },
  { id: '202', floor: 2, type: 'Single',    capacity: 1, filled: 1, status: 'full' },
  { id: '203', floor: 2, type: '2-Sharing', capacity: 2, filled: 1, status: 'available' },
  { id: '301', floor: 3, type: '4-Sharing', capacity: 4, filled: 3, status: 'available' },
];

const MOCK_STATS = [
  { name: 'Jan', students: 40, sessions: 24 },
  { name: 'Feb', students: 30, sessions: 13 },
  { name: 'Mar', students: 20, sessions: 98 },
  { name: 'Apr', students: 27, sessions: 39 },
  { name: 'May', students: 18, sessions: 48 },
];

// --- Service Methods ---

export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === email);
        if (user) resolve(user);
        else reject("Invalid credentials");
      }, 800);
    });
  }
};

export const studentService = {
  getProfile: async () => Promise.resolve({ ...MOCK_USERS[1], address: "123 Street", phone: "555-0192" }),
  registerHostel: async (data) => {
    console.log("Submitting Hostel Data:", data);
    return Promise.resolve({ success: true });
  },
  getAvailableRooms: async () => Promise.resolve(MOCK_HOSTEL_DATA),
  getCounselors: async () => Promise.resolve(MOCK_COUNSELORS),
};

export const adminService = {
  uploadUserList: async (file) => {
    console.log("Uploading Excel file:", file.name);
    return Promise.resolve({ success: true, count: 150 }); 
  },
  getSystemStats: async () => Promise.resolve(MOCK_STATS),
};

export const counselorService = {
  uploadMCQ: async (file) => {
    console.log("Uploading MCQ CSV:", file.name);
    return Promise.resolve({ success: true });
  }
};