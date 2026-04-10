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
      const all = (key) => req.files[key] || [];
      const toPathList = (files) => files.map(file => `/filestore/${file.filename}`).join(',');

      // Store uploaded file paths (support both camelCase and snake_case field names)
      const fileResidence = [...all('fileResidence'), ...all('file_residence')];
      const fileIncome = [...all('fileIncome'), ...all('file_income')];
      const fileSiblings = [...all('fileSiblings'), ...all('file_siblings')];
      const fileSamurdhi = [...all('fileSamurdhi'), ...all('file_samurdhi')];
      const fileSports = [...all('fileSports'), ...all('file_sports')];

      if (fileResidence.length > 0) applicationData.fileResidence = toPathList(fileResidence);
      if (fileIncome.length > 0) applicationData.fileIncome = toPathList(fileIncome);
      if (fileSiblings.length > 0) applicationData.fileSiblings = toPathList(fileSiblings);
      if (fileSamurdhi.length > 0) applicationData.fileSamurdhi = toPathList(fileSamurdhi);
      if (fileSports.length > 0) applicationData.fileSports = toPathList(fileSports);
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

const deleteByUserId = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const result = await applicationService.deleteApplicationByUserId(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyApplication,
  getAllApplications,
  submitApplication,
  updateStatus,
  deleteByUserId
};
