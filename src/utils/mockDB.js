// src/utils/mockDB.js

// --- ROLE PERMISSIONS ---

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
    canManageRoleRequests: true,
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
    canRequestCounselorRole: true,
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

// --- USERS ---

export const MOCK_USERS = [
  {
    id: 1,
    email: "admin@uom.local",
    password: "123",
    role: "admin",
    name: "Saman Perera"
  },
  {
    id: 2,
    email: "counselor@uom.local",
    password: "123",
    role: "counselor",
    name: "Dr. Nirosha Bandara"
  },
  {
    id: 3,
    email: "staff@uom.local",
    password: "123",
    role: "staff",
    name: "Sunil Jayasinghe"
  },
  {
    id: 4,
    email: "student@uom.local",
    password: "123",
    role: "student",
    name: "Kasun Wijeratne",

    indexNumber: "ST-2024-004",
    fullName: "Kasun Chathuranga Wijeratne",
    nameWithInitials: "K. C. Wijeratne",
    permanentAddress: "No. 45, Temple Road, Kandy",
    residentPhone: "0812233445",
    mobilePhone: "0777123456",
    gender: "male"
  },
  {
    id: 5,
    email: "amal@uom.local",
    password: "123",
    role: "student",
    name: "Amal Fernando"
  },
  {
    id: 6,
    email: "nuwan@uom.local",
    password: "123",
    role: "student",
    name: "Nuwan Silva"
  },
  {
    id: 7,
    email: "tharindu@uom.local",
    password: "123",
    role: "student",
    name: "Tharindu Kumara"
  },
  {
    id: 8,
    email: "dinithi@uom.local",
    password: "123",
    role: "student",
    name: "Dinithi Abeysekera"
  }
];

// --- JWT MOCK ---

export const generateMockJWT = (user) => {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 3600000
  });
  return `fake-jwt-header.${btoa(payload)}.fake-signature`;
};

// --- HOSTEL ROOMS ---

export let MOCK_HOSTEL_ROOMS = [
  { id: 101, hostel: "Men's Hostel A", floor: 1, number: "101", capacity: 2, type: "Double" },
  { id: 102, hostel: "Men's Hostel A", floor: 1, number: "102", capacity: 2, type: "Double" },
  { id: 201, hostel: "Men's Hostel A", floor: 2, number: "201", capacity: 1, type: "Single" },
  { id: 301, hostel: "Women's Hostel B", floor: 1, number: "101", capacity: 2, type: "Double" },
  { id: 302, hostel: "Women's Hostel B", floor: 1, number: "102", capacity: 4, type: "Dorm" },
];

// --- ALLOCATIONS ---

export let MOCK_ALLOCATIONS = [
  {
    id: 1,
    userId: 4,
    roomId: 101,
    startDate: "2024-01-15",
    endDate: "2024-12-15"
  }
];

// --- APPLICATIONS ---

export let MOCK_APPLICATIONS = [
  {
    id: 1,
    userId: 5,
    status: "approved",
    points: 85,
    submissionDate: "2024-02-10",

    fullName: "Amal Sachintha Fernando",
    indexNumber: "ST-2024-001",
    permanentAddress: "No. 12, Lake Road, Galle",
    email: "amal@student.uom.lk",
    gender: "male",
    mobilePhone: "0771234567",
    district: "Galle",
    closestTown: "Galle Town",
    distanceToTown: 4,
    distance: 120,
    faculty: "Engineering",
    department: "Software",
    year: "first_year",

    misconduct: "no",
    isMahapolaRecipient: "yes",
    bursaryAmount: "5000",
    incomeRange: "below_100k",
    isSamurdhiRecipient: "no",

    motherAlive: "yes",
    fatherAlive: "yes",
    siblingsSchool: 1,
    siblingsUni: 0,

    isCaptain: "no",
    isMember: "yes",
    memberTeam: "Debate Team",
    hasColours: "no",

    hostelPref: "First Lane",

    emergencyName: "Somapala Fernando",
    emergencyMobile: "0711112222",
    emergencyAddress: "Same as permanent",

    file_residence: "gn_certificate_amal.pdf",
    file_income: "salary_slip_father.png",
    file_siblings: "school_letter_sibling.jpg",
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
    subject: "Academic stress",
    status: "open",
    messages: [
      {
        senderId: 4,
        text: "I feel stressed with exams and assignments.",
        timestamp: "2024-03-10 09:00"
      },
      {
        senderId: 2,
        text: "That’s understandable. Let’s create a simple study plan.",
        timestamp: "2024-03-10 09:15"
      }
    ],
    createdAt: "2024-03-10"
  }
];

// --- ROLE REQUESTS ---

export let MOCK_ROLE_REQUESTS = [
  {
    id: 901,
    userId: 3,
    userName: "Sunil Jayasinghe",
    message: "I have completed a counselling-related certificate and wish to support students.",
    attachment: "counselling_certificate.pdf",
    status: "pending",
    createdAt: "2024-03-12"
  }
];
