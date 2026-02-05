const applicationRepository = require('../repositories/applicationRepository');

const calculatePoints = (data) => {
  let points = 0;
  const dist = parseFloat(data.distance || 0);
  if (dist >= 200) points += 50;
  else if (dist >= 150) points += 42;
  else if (dist >= 100) points += 34;
  else if (dist >= 70) points += 20;
  else if (dist >= 40) points += 18;
  else if (dist >= 30) points += 10;

  const incomePoints = {
    below_100k: 25,
    '100k_150k': 23,
    '150k_200k': 20,
    '200k_250k': 17,
    '250k_300k': 14,
    '300k_350k': 11,
    '350k_400k': 8,
    '400k_450k': 5,
    above_450k: 3
  };
  points += incomePoints[data.incomeRange] || 0;

  const schoolSibs = parseInt(data.siblingsSchool || 0, 10);
  if (schoolSibs >= 2) points += 7;
  else if (schoolSibs === 1) points += 3.5;

  const uniSibs = parseInt(data.siblingsUni || 0, 10);
  if (uniSibs >= 2) points += 10;
  else if (uniSibs === 1) points += 5;

  if (data.parentDisability === 'yes') points += 5;
  if (data.isCaptain === 'yes') points += 3;
  if (data.isMember === 'yes') points += 2;
  if (data.hasColours === 'yes') points += 5;

  return points;
};

const getMyApplication = async (userId) => {
  return applicationRepository.findByUserId(userId);
};

const getAllApplications = async () => {
  return applicationRepository.findAll();
};

const submitApplication = async (userId, formData) => {
  const points = calculatePoints(formData);
  const application = {
    userId,
    status: formData.status || 'pending',
    points,
    submissionDate: new Date().toISOString().split('T')[0],
    fullName: formData.fullName || null,
    indexNumber: formData.indexNumber || null,
    permanentAddress: formData.permanentAddress || null,
    email: formData.email || null,
    gender: formData.gender || null,
    mobilePhone: formData.mobilePhone || null,
    district: formData.district || null,
    closestTown: formData.closestTown || null,
    distanceToTown: formData.distanceToTown || null,
    distance: formData.distance || null,
    faculty: formData.faculty || null,
    department: formData.department || null,
    year: formData.year || null,
    misconduct: formData.misconduct || null,
    isMahapolaRecipient: formData.isMahapolaRecipient || null,
    bursaryAmount: formData.bursaryAmount || null,
    incomeRange: formData.incomeRange || null,
    isSamurdhiRecipient: formData.isSamurdhiRecipient || null,
    motherAlive: formData.motherAlive || null,
    fatherAlive: formData.fatherAlive || null,
    siblingsSchool: formData.siblingsSchool || null,
    siblingsUni: formData.siblingsUni || null,
    isCaptain: formData.isCaptain || null,
    isMember: formData.isMember || null,
    memberTeam: formData.memberTeam || null,
    hasColours: formData.hasColours || null,
    hostelPref: formData.hostelPref || null,
    emergencyName: formData.emergencyName || null,
    emergencyMobile: formData.emergencyMobile || null,
    emergencyAddress: formData.emergencyAddress || null,
    fileResidence: formData.fileResidence || formData.file_residence || null,
    fileIncome: formData.fileIncome || formData.file_income || null,
    fileSiblings: formData.fileSiblings || formData.file_siblings || null,
    fileSamurdhi: formData.fileSamurdhi || formData.file_samurdhi || null,
    fileSports: formData.fileSports || formData.file_sports || null
  };

  const id = await applicationRepository.upsert(application);
  return { id, ...application };
};

const updateApplicationStatus = async (appId, status) => {
  await applicationRepository.updateStatus(appId, status);
};

module.exports = {
  getMyApplication,
  getAllApplications,
  submitApplication,
  updateApplicationStatus
};
