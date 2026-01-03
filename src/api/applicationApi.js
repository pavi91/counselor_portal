// src/api/applicationApi.js
import { MOCK_APPLICATIONS, MOCK_USERS } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- POINT CALCULATION LOGIC ---
const calculatePoints = (data) => {
  let points = 0;
  
  // 1. Distance (Max 50)
  const dist = parseFloat(data.distance || 0);
  if (dist >= 200) points += 50;
  else if (dist >= 150) points += 42;
  else if (dist >= 100) points += 34;
  else if (dist >= 70) points += 20;
  else if (dist >= 40) points += 18;
  else if (dist >= 30) points += 10;
  else points += 0;

  // 2. Annual Family Income (Max 25)
  const incomeCode = data.incomeRange; 
  const incomePoints = {
    "below_100k": 25,
    "100k_150k": 23,
    "150k_200k": 20,
    "200k_250k": 17,
    "250k_300k": 14,
    "300k_350k": 11,
    "350k_400k": 8,
    "400k_450k": 5,
    "above_450k": 3
  };
  points += (incomePoints[incomeCode] || 0);

  // 3. Siblings (School) (Max 7)
  const schoolSibs = parseInt(data.siblingsSchool || 0);
  if (schoolSibs >= 2) points += 7;
  else if (schoolSibs === 1) points += 3.5;

  // 4. Siblings (University) (Max 10)
  const uniSibs = parseInt(data.siblingsUni || 0);
  if (uniSibs >= 2) points += 10;
  else if (uniSibs === 1) points += 5;

  // 5. Parent Disability (Max 5)
  if (data.parentDisability === 'yes') points += 5;

  // 6. Extra Curricular
  if (data.isCaptain === 'yes') points += 3;
  if (data.isMember === 'yes') points += 2;
  if (data.hasColours === 'yes') points += 5;

  return points;
};

// --- API METHODS ---

export const getMyApplicationAPI = async (userId) => {
  await delay(300);
  return MOCK_APPLICATIONS.find(a => a.userId === userId) || null;
};

export const getAllApplicationsAPI = async () => {
  await delay(400);
  return MOCK_APPLICATIONS.map(app => {
    const user = MOCK_USERS.find(u => u.id === app.userId);
    return {
      ...app,
      studentName: app.fullName || (user ? user.name : 'Unknown'),
      studentEmail: app.email || (user ? user.email : 'Unknown')
    };
  }).sort((a, b) => b.points - a.points);
};

export const submitApplicationAPI = async (userId, formData) => {
  await delay(800);
  
  const existingIndex = MOCK_APPLICATIONS.findIndex(a => a.userId === userId);
  const points = calculatePoints(formData);
  
  const newApp = {
    id: existingIndex >= 0 ? MOCK_APPLICATIONS[existingIndex].id : Date.now(),
    userId,
    ...formData, // This now includes file_residence, file_income, etc.
    points,
    status: existingIndex >= 0 ? MOCK_APPLICATIONS[existingIndex].status : 'pending',
    submissionDate: new Date().toISOString().split('T')[0]
  };

  if (existingIndex >= 0) {
      MOCK_APPLICATIONS[existingIndex] = newApp;
  } else {
      MOCK_APPLICATIONS.push(newApp);
  }
  
  return newApp;
};

export const updateApplicationStatusAPI = async (appId, status) => {
  await delay(300);
  const appIndex = MOCK_APPLICATIONS.findIndex(a => a.id === appId);
  if (appIndex === -1) throw new Error("Application not found");
  
  MOCK_APPLICATIONS[appIndex] = { ...MOCK_APPLICATIONS[appIndex], status };
  return MOCK_APPLICATIONS[appIndex];
};