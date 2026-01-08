// src/api/userApi.js
import { MOCK_USERS, MOCK_ROLE_REQUESTS } from '../utils/mockDB';


let dbUsers = [...MOCK_USERS];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// FETCH with optional Search Query
export const getUsersAPI = async (query = '') => {
  await delay(400);
  if (!query) return [...dbUsers];

  const lowerQuery = query.toLowerCase();
  return dbUsers.filter(u => 
    u.name.toLowerCase().includes(lowerQuery) || 
    u.email.toLowerCase().includes(lowerQuery) ||
    u.role.toLowerCase().includes(lowerQuery)
  );
};

export const createUserAPI = async (user) => {
  await delay(400);
  if (dbUsers.some(u => u.email === user.email)) {
    throw new Error(`User with email ${user.email} already exists`);
  }
  const newUser = { ...user, id: Date.now() + Math.random() };
  dbUsers.push(newUser);
  return newUser;
};

export const updateUserRoleAPI = async (userId, newRole) => {
  await delay(300);
  const index = dbUsers.findIndex(u => u.id === userId);
  if (index === -1) throw new Error("User not found");
  dbUsers[index] = { ...dbUsers[index], role: newRole };
  return dbUsers[index];
};

export const bulkCreateUsersAPI = async (users) => {
  await delay(600);
  const results = { added: 0, failed: 0, errors: [] };
  users.forEach(user => {
    if (dbUsers.some(u => u.email === user.email)) {
      results.failed++;
    } else {
      dbUsers.push({ ...user, id: Date.now() + Math.random() });
      results.added++;
    }
  });
  return results;
};

export const deleteUserAPI = async (userId) => {
  await delay(300);
  dbUsers = dbUsers.filter(u => u.id !== userId);
  return { success: true };
};

export const getRoleRequestsAPI = async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(300);
  return [...MOCK_ROLE_REQUESTS];
};

export const createRoleRequestAPI = async (userId, message, attachment) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(500);

  const user = MOCK_USERS.find(u => u.id === userId);
  
  // Basic validation: Check if pending request exists
  const existing = MOCK_ROLE_REQUESTS.find(r => r.userId === userId && r.status === 'pending');
  if (existing) throw new Error("You already have a pending request.");

  const newRequest = {
    id: Date.now(),
    userId,
    userName: user ? user.name : 'Unknown Staff',
    message,
    attachment: attachment ? attachment.name : null,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  };

  MOCK_ROLE_REQUESTS.push(newRequest);
  return newRequest;
};

export const processRoleRequestAPI = async (requestId, action) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(400);

  const reqIndex = MOCK_ROLE_REQUESTS.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error("Request not found");

  const request = MOCK_ROLE_REQUESTS[reqIndex];
  request.status = action; // 'approved' or 'rejected'

  // If approved, ELEVATE the user role
  if (action === 'approved') {
    const userIndex = MOCK_USERS.findIndex(u => u.id === request.userId);
    if (userIndex !== -1) {
      MOCK_USERS[userIndex].role = 'counselor';
    }
  }

  return request;
};

