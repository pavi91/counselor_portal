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
    
    // Handle uploaded files from multer
    const applicationData = { ...req.body };
    
    if (req.files) {
      const first = (key) => (req.files[key] && req.files[key][0]) ? req.files[key][0] : null;

      // Store file paths instead of files (support both camelCase and snake_case)
      const fileResidence = first('fileResidence') || first('file_residence');
      const fileIncome = first('fileIncome') || first('file_income');
      const fileSiblings = first('fileSiblings') || first('file_siblings');
      const fileSamurdhi = first('fileSamurdhi') || first('file_samurdhi');
      const fileSports = first('fileSports') || first('file_sports');

      if (fileResidence) applicationData.fileResidence = `/filestore/${fileResidence.filename}`;
      if (fileIncome) applicationData.fileIncome = `/filestore/${fileIncome.filename}`;
      if (fileSiblings) applicationData.fileSiblings = `/filestore/${fileSiblings.filename}`;
      if (fileSamurdhi) applicationData.fileSamurdhi = `/filestore/${fileSamurdhi.filename}`;
      if (fileSports) applicationData.fileSports = `/filestore/${fileSports.filename}`;
    }
    
    const application = await applicationService.submitApplication(userId, applicationData);
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
