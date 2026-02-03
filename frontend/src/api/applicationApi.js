import apiClient from './apiClient';

// --- POINT CALCULATION LOGIC (Keep client-side for immediate feedback) ---
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
  const response = await apiClient.get(`/applications/user/${userId}`);
  return response.data;
};

export const getAllApplicationsAPI = async () => {
  const response = await apiClient.get('/applications');
  return response.data;
};

export const submitApplicationAPI = async (userId, formData) => {
  const response = await apiClient.post(`/applications/user/${userId}`, formData);
  return response.data;
};

export const updateApplicationStatusAPI = async (appId, status) => {
  const response = await apiClient.patch(`/applications/${appId}/status`, { status });
  return response.data;
};

// Export point calculator for UI preview
export { calculatePoints };