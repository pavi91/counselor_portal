const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const getUsers = async (query) => {
  return userRepository.searchUsers(query);
};

const getUsersByRole = async (roleName, query = '') => {
  if (!roleName) {
    const err = new Error('Role parameter is required');
    err.status = 400;
    throw err;
  }
  return userRepository.getUsersByRole(roleName, query);
};

const createUser = async (user) => {
  const existing = await userRepository.findByEmail(user.email);
  if (existing) {
    const err = new Error(`User with email ${user.email} already exists`);
    err.status = 400;
    throw err;
  }

  const roleId = await userRepository.getRoleIdByName(user.role);
  if (!roleId) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(user.password || '123', 10);
  const userId = await userRepository.createUser({
    ...user,
    roleId,
    passwordHash
  });

  return userRepository.findById(userId);
};

const updateUserRole = async (userId, role) => {
  const roleId = await userRepository.getRoleIdByName(role);
  if (!roleId) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  await userRepository.updateUserRole(userId, roleId);
  return userRepository.findById(userId);
};

const deleteUser = async (userId) => {
  await userRepository.deleteUser(userId);
  return { success: true };
};

const bulkCreateUsers = async (users) => {
  const results = { added: 0, failed: 0, errors: [] };
  for (const user of users) {
    try {
      await createUser(user);
      results.added += 1;
    } catch (err) {
      results.failed += 1;
      results.errors.push({ email: user.email, message: err.message });
    }
  }
  return results;
};

module.exports = {
  getUsers,
  getUsersByRole,
  createUser,
  updateUserRole,
  deleteUser,
  bulkCreateUsers
};
