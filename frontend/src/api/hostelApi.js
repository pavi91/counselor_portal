import apiClient from './apiClient';

// --- GETTERS ---

export const getHostelsAPI = async ({ gender = null, year = null } = {}) => {
  const params = {};
  if (gender) params.gender = gender;
  if (year) params.year = year;
  const response = await apiClient.get('/hostels', { params });
  return response.data;
};

export const getHostelStatsAPI = async (hostelName = null) => {
  const params = hostelName && hostelName !== 'All' ? { hostel: hostelName } : {};
  const response = await apiClient.get('/hostels/stats', { params });
  return response.data;
};

export const getAllAllocationsAPI = async () => {
  const response = await apiClient.get('/hostels/allocations');
  return response.data;
};

export const getStudentHostelDetailsAPI = async (userId) => {
  const response = await apiClient.get(`/hostels/allocations/${userId}`);
  return response.data;
};

// --- ACTION METHODS ---

export const assignRoomAPI = async (userId, roomId, startDate = null, endDate = null) => {
  const response = await apiClient.post('/hostels/assign', { userId, roomId, startDate, endDate });
  return response.data;
};

export const removeAllocationAPI = async (userId) => {
  const response = await apiClient.delete(`/hostels/allocations/${userId}`);
  return response.data;
};

export const createRoomAPI = async (roomData) => {
  const response = await apiClient.post('/hostels/rooms', roomData);
  return response.data;
};