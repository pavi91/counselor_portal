const roleRequestService = require('../services/roleRequestService');

const getRoleRequests = async (req, res, next) => {
  try {
    const requests = await roleRequestService.getRoleRequests();
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

const createRoleRequest = async (req, res, next) => {
  try {
    const { userId, message, attachment } = req.body;
    const request = await roleRequestService.createRoleRequest(userId, message, attachment);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

const processRoleRequest = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { action } = req.body;
    const request = await roleRequestService.processRoleRequest(requestId, action);
    res.json(request);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoleRequests,
  createRoleRequest,
  processRoleRequest
};
