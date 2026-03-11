const roleRequestRepository = require('../repositories/roleRequestRepository');
const userRepository = require('../repositories/userRepository');

const getRoleRequests = async () => {
  return roleRequestRepository.getAll();
};

const createRoleRequest = async (userId, message, attachment) => {
  const active = await roleRequestRepository.findActiveByUserId(userId);
  if (active) {
    const statusMsg = active.status === 'pending'
      ? 'You already have a pending request. Please wait for it to be reviewed.'
      : 'Your previous request was approved. You cannot submit another request.';
    const err = new Error(statusMsg);
    err.status = 400;
    throw err;
  }

  const id = await roleRequestRepository.create({ userId, message, attachment });
  return roleRequestRepository.findById(id);
};

const getMyRoleRequests = async (userId) => {
  return roleRequestRepository.findByUserId(userId);
};

const processRoleRequest = async (requestId, action) => {
  const request = await roleRequestRepository.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }

  if (!['approved', 'rejected'].includes(action)) {
    const err = new Error('Invalid action');
    err.status = 400;
    throw err;
  }

  await roleRequestRepository.updateStatus(requestId, action);

  if (action === 'approved') {
    const roleId = await userRepository.getRoleIdByName('counselor');
    await userRepository.updateUserRole(request.user_id, roleId);
  }

  return roleRequestRepository.findById(requestId);
};

module.exports = {
  getRoleRequests,
  createRoleRequest,
  processRoleRequest,
  getMyRoleRequests
};
