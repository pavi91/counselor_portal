import apiClient from './apiClient';

// --- GETTERS ---

export const getHostelsAPI = async () => {
  const response = await apiClient.get('/hostels');
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

export const assignRoomAPI = async (userId, roomId) => {
  const response = await apiClient.post('/hostels/assign', { userId, roomId });
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