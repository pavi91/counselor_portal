const reportService = require('../services/reportService');

const getApplicationReport = async (req, res, next) => {
  try {
    const report = await reportService.getApplicationReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
};

const getTicketReport = async (req, res, next) => {
  try {
    const report = await reportService.getTicketReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplicationReport,
  getTicketReport
};
