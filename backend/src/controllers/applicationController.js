const applicationService = require('../services/applicationService');

const getMyApplication = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const application = await applicationService.getMyApplication(userId);
    res.json(application);
  } catch (err) {
    next(err);
  }
};

const getAllApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getAllApplications();
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

const submitApplication = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const application = await applicationService.submitApplication(userId, req.body);
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const appId = parseInt(req.params.id, 10);
    const { status } = req.body;
    await applicationService.updateApplicationStatus(appId, status);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyApplication,
  getAllApplications,
  submitApplication,
  updateStatus
};
