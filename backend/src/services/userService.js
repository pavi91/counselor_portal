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
  // Check if user has any dependencies
  const dependencies = await userRepository.checkUserDependencies(userId);
  
  if (dependencies.hasDependencies) {
    const err = new Error(
      `Cannot delete user. This user has ${dependencies.count} active ${dependencies.type}. ` +
      `Please remove all associated ${dependencies.type} before deleting the user.`
    );
    err.status = 409; // Conflict status code
    throw err;
  }

  await userRepository.deleteUser(userId);
  return { success: true, message: 'User deleted successfully' };
};

const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
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

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    const err = new Error('Current password and new password are required');
    err.status = 400;
    throw err;
  }
  if (newPassword.length < 3) {
    const err = new Error('New password must be at least 3 characters');
    err.status = 400;
    throw err;
  }

  const passwordHash = await userRepository.getPasswordHashById(userId);
  if (!passwordHash) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  let isMatch = false;
  if (passwordHash && passwordHash.startsWith('$2')) {
    isMatch = await bcrypt.compare(currentPassword, passwordHash);
  } else {
    isMatch = currentPassword === passwordHash;
  }

  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.status = 401;
    throw err;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updatePasswordHash(userId, newHash);
  return { success: true, message: 'Password updated successfully' };
};

module.exports = {
  getUsers,
  getUsersByRole,
  createUser,
  updateUserRole,
  deleteUser,
  bulkCreateUsers,
  getUserById,
  changePassword
};
