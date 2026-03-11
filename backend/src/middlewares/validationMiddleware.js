/**
 * Validation middleware for request body validation
 */

// User validation
const validateUserCreate = (req, res, next) => {
  const { email, password, role, name } = req.body;
  const errors = [];

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 3) {
    errors.push('Password must be at least 3 characters');
  }
  if (!role || !['student', 'counselor', 'staff', 'admin'].includes(role)) {
    errors.push('Valid role is required (student, counselor, staff, admin)');
  }
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// Application validation
const validateApplicationSubmit = (req, res, next) => {
  const {
    fullName, indexNumber, email, gender, mobilePhone, district,
    faculty, department, year, hostelPref
  } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length === 0) {
    errors.push('Full name is required');
  }
  if (!indexNumber || indexNumber.trim().length === 0) {
    errors.push('Index number is required');
  }
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }
  if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase())) {
    errors.push('Valid gender is required (male, female, other)');
  }
  if (!mobilePhone || !mobilePhone.match(/^[0-9]{10}$/)) {
    errors.push('Valid 10-digit mobile phone number is required');
  }
  if (!district || district.trim().length === 0) {
    errors.push('District is required');
  }
  if (!faculty || faculty.trim().length === 0) {
    errors.push('Faculty is required');
  }
  if (!department || department.trim().length === 0) {
    errors.push('Department is required');
  }
  if (!year || year.trim().length === 0) {
    errors.push('Year is required');
  }
  if (!hostelPref || hostelPref.trim().length === 0) {
    errors.push('Hostel preference is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// Ticket validation
const validateTicketCreate = (req, res, next) => {
  const { studentId, counselorId, subject, initialMessage } = req.body;
  const errors = [];

  if (!studentId || isNaN(parseInt(studentId))) {
    errors.push('Valid student ID is required');
  }
  if (!counselorId || isNaN(parseInt(counselorId))) {
    errors.push('Valid counselor ID is required');
  }
  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required');
  }
  if (!initialMessage || initialMessage.trim().length === 0) {
    errors.push('Initial message is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// Ticket reply validation
const validateTicketReply = (req, res, next) => {
  const { senderId, message } = req.body;
  const errors = [];

  if (!senderId || isNaN(parseInt(senderId))) {
    errors.push('Valid sender ID is required');
  }
  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// Role request validation
const validateRoleRequest = (req, res, next) => {
  const { userId, message } = req.body;
  const errors = [];

  if (!userId || isNaN(parseInt(userId))) {
    errors.push('Valid user ID is required');
  }
  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// Hostel assignment validation
const validateHostelAssignment = (req, res, next) => {
  const { userId, roomId, startDate, endDate } = req.body;
  const errors = [];

  if (!userId || isNaN(parseInt(userId))) {
    errors.push('Valid user ID is required');
  }
  if (!roomId || isNaN(parseInt(roomId))) {
    errors.push('Valid room ID is required');
  }
  if (!startDate || isNaN(Date.parse(startDate))) {
    errors.push('Valid start date is required');
  }
  if (!endDate || isNaN(Date.parse(endDate))) {
    errors.push('Valid end date is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// Room creation validation
const validateRoomCreate = (req, res, next) => {
  const { hostelId, number, floor, capacity, type } = req.body;
  const errors = [];

  if (!hostelId || isNaN(parseInt(hostelId))) {
    errors.push('Valid hostel ID is required');
  }
  if (!number || number.trim().length === 0) {
    errors.push('Room number is required');
  }
  if (!floor || isNaN(parseInt(floor))) {
    errors.push('Valid floor number is required');
  }
  if (!capacity || isNaN(parseInt(capacity)) || parseInt(capacity) < 1) {
    errors.push('Valid capacity (at least 1) is required');
  }
  if (!type || type.trim().length === 0) {
    errors.push('Room type is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// FAQ create validation
const validateFaqCreate = (req, res, next) => {
  const { question, answer, category } = req.body;
  const errors = [];

  if (!question || question.trim().length === 0) {
    errors.push('Question is required');
  }
  if (!answer || answer.trim().length === 0) {
    errors.push('Answer is required');
  }
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

// FAQ update validation
const validateFaqUpdate = (req, res, next) => {
  const { question, answer, category } = req.body;
  const errors = [];

  if (!question || question.trim().length === 0) {
    errors.push('Question is required');
  }
  if (!answer || answer.trim().length === 0) {
    errors.push('Answer is required');
  }
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }
  if (req.body.isActive === undefined || req.body.isActive === null) {
    errors.push('Active status is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation Error', messages: errors });
  }
  next();
};

module.exports = {
  validateUserCreate,
  validateApplicationSubmit,
  validateTicketCreate,
  validateTicketReply,
  validateRoleRequest,
  validateHostelAssignment,
  validateRoomCreate,
  validateFaqCreate,
  validateFaqUpdate
};
