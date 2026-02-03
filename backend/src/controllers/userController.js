const userService = require('../services/userService');

const getUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const role = req.query.role;
    
    let users;
    if (role) {
      // Only return users with specific role
      users = await userService.getUsersByRole(role, query);
    } else {
      // For backward compatibility, but requires admin/staff role check in service
      users = await userService.getUsers(query);
    }
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const user = await userService.updateUserRole(userId, role);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const result = await userService.deleteUser(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const bulkCreateUsers = async (req, res, next) => {
  try {
    const users = req.body.users || [];
    const results = await userService.bulkCreateUsers(users);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  bulkCreateUsers
};
