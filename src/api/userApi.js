// src/api/userApi.js
import { MOCK_USERS } from '../utils/mockDB';

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