// src/utils/mockDB.js

// ... [Permissions code remains unchanged] ...
export const ROLE_PERMISSIONS = {
  admin: {
    canViewUsers: true,
    canCreateUser: true,
    canDeleteUser: true,
    canUpdateRole: true,
    canBulkUpload: true,
    canViewHostelStats: true,
    canViewHostelDetails: true,
    canManageTenants: true,
    canCreateRoom: true,
    canViewApplications: true,
    canProcessApplications: true,
    canApplyHostel: false,
    canViewTickets: true,
  },
  staff: {
    canViewUsers: true,
    canCreateUser: true,
    canDeleteUser: false,
    canUpdateRole: false,
    canBulkUpload: false,
    canViewHostelStats: true,
    canViewHostelDetails: true,
    canManageTenants: true,
    canCreateRoom: false,
    canViewApplications: true,
    canProcessApplications: true,
    canApplyHostel: false,
    canViewTickets: false,
  },
  counselor: {
    canViewUsers: true,
    canCreateUser: false,
    canDeleteUser: false,
    canUpdateRole: false,
    canBulkUpload: false,
    canViewHostelStats: false,
    canViewHostelDetails: false,
    canManageTenants: false,
    canViewApplications: false,
    canApplyHostel: false,
    canViewTickets: true,
    canManageTickets: true,
  },
  student: {
    canViewUsers: false,
    canManageTenants: false,
    canViewApplications: false,
    canApplyHostel: true,
    canCreateTicket: true,
  }
};

// --- DATA ---

export const MOCK_USERS = [
  { id: 1, email: "admin@school.com", password: "123", role: "admin", name: "Principal Skinner" },
  { id: 2, email: "counselor@school.com", password: "123", role: "counselor", name: "Mr. Mackey" },
  { id: 3, email: "staff@school.com", password: "123", role: "staff", name: "Groundskeeper Willie" },
  { id: 4, email: "student@school.com", password: "123", role: "student", name: "Bart Simpson" },
  { id: 5, email: "milhouse@school.com", password: "123", role: "student", name: "Milhouse Van Houten" },
  { id: 6, email: "nelson@school.com", password: "123", role: "student", name: "Nelson Muntz" },
  { id: 7, email: "ralph@school.com", password: "123", role: "student", name: "Ralph Wiggum" },
  { id: 8, email: "martin@school.com", password: "123", role: "student", name: "Martin Prince" },
];

export const generateMockJWT = (user) => {
  const payload = JSON.stringify({ ...user, exp: Date.now() + 3600000 }); 
  return `fake-jwt-header.${btoa(payload)}.fake-signature`;
};

// Rooms
export let MOCK_HOSTEL_ROOMS = [
  { id: 101, floor: 1, number: "101", capacity: 2, type: "Double" },
  { id: 102, floor: 1, number: "102", capacity: 2, type: "Double" },
  { id: 201, floor: 2, number: "201", capacity: 1, type: "Single" },
  { id: 202, floor: 2, number: "202", capacity: 2, type: "Double" },
];

// Allocations
export let MOCK_ALLOCATIONS = [
  { id: 1, userId: 4, roomId: 101, startDate: "2024-01-15", endDate: "2024-12-15" }, 
];

// Applications
export let MOCK_APPLICATIONS = [
  { 
    id: 1, 
    userId: 5, // Milhouse
    status: 'pending',
    points: 85,
    submissionDate: '2024-02-10',

    fullName: "Milhouse Van Houten", 
    indexNumber: "ST-2024-001",
    permanentAddress: "742 Evergreen Terrace, Springfield",
    email: "milhouse@school.com",
    gender: 'male',
    mobilePhone: "0771234567",
    district: 'Springfield',
    closestTown: 'Downtown',
    distanceToTown: 5,
    distance: 120, 
    faculty: 'Engineering',
    department: 'Software',
    year: 'first_year',
    misconduct: 'no',
    incomeRange: 'below_100k',
    isSamurdhiRecipient: 'no',
    isMahapolaRecipient: 'yes',
    bursaryAmount: '5000',
    motherAlive: 'yes',
    fatherAlive: 'yes',
    siblingsSchool: 1,
    siblingsUni: 0,
    isCaptain: 'no',
    isMember: 'yes',
    memberTeam: 'Debate Team',
    hasColours: 'no',
    hostelPref: 'First Lane',
    emergencyName: 'Kirk Van Houten',
    emergencyMobile: '0711112222',
    emergencyAddress: 'Same as permanent',

    // MOCK FILES
    file_residence: "gn_certificate_milhouse.pdf",
    file_income: "dad_salary_slip.png",
    file_siblings: "school_letter_lisa.jpg",
    file_samurdhi: null,
    file_sports: "debate_team_membership.pdf"
  }
];

// --- TICKETS ---
export let MOCK_TICKETS = [
  {
    id: 101,
    studentId: 4, 
    counselorId: 2, 
    subject: "Feeling overwhelmed",
    status: "open", 
    messages: [
      { senderId: 4, text: "I have too much homework and don't know where to start.", timestamp: "2024-03-10 09:00" },
      { senderId: 2, text: "It's okay, Bart. Let's break it down. What's due first?", timestamp: "2024-03-10 09:15" }
    ],
    createdAt: "2024-03-10"
  }
];