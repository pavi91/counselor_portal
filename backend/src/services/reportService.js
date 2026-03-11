const reportRepository = require('../repositories/reportRepository');

const getApplicationReport = async () => {
  const [
    byStatus,
    byMonth,
    pointsStats,
    pointsByStatus,
    byGender,
    byDistrict,
    byFaculty,
    byIncomeRange,
    distanceStats,
    aidStats,
    byHostelPref
  ] = await Promise.all([
    reportRepository.getApplicationCountsByStatus(),
    reportRepository.getApplicationCountsByMonth(),
    reportRepository.getApplicationPointsStats(),
    reportRepository.getApplicationPointsByStatus(),
    reportRepository.getApplicationsByGender(),
    reportRepository.getApplicationsByDistrict(),
    reportRepository.getApplicationsByFaculty(),
    reportRepository.getApplicationsByIncomeRange(),
    reportRepository.getApplicationDistanceStats(),
    reportRepository.getApplicationAidStats(),
    reportRepository.getApplicationsByHostelPref()
  ]);

  return {
    byStatus,
    byMonth,
    pointsStats,
    pointsByStatus,
    byGender,
    byDistrict,
    byFaculty,
    byIncomeRange,
    distanceStats,
    aidStats,
    byHostelPref
  };
};

const getTicketReport = async () => {
  const [
    overview,
    byStatus,
    byMonth,
    perCounselor,
    messageStats,
    subjectFrequency,
    agingBuckets
  ] = await Promise.all([
    reportRepository.getTicketOverview(),
    reportRepository.getTicketCountsByStatus(),
    reportRepository.getTicketCountsByMonth(),
    reportRepository.getTicketsPerCounselor(),
    reportRepository.getTicketMessageStats(),
    reportRepository.getTicketSubjectFrequency(),
    reportRepository.getTicketAgingBuckets()
  ]);

  return {
    overview,
    byStatus,
    byMonth,
    perCounselor,
    messageStats,
    subjectFrequency,
    agingBuckets
  };
};

module.exports = {
  getApplicationReport,
  getTicketReport
};
