import apiClient from './apiClient';

// FETCH with optional role filter
export const getUsersAPI = async (query = '', role = null) => {
  const params = {};
  if (query) params.q = query;
  if (role) params.role = role;
  const response = await apiClient.get('/users', { params });
  return response.data;
};

// Get users by specific role (recommended approach)
export const getUsersByRoleAPI = async (role, query = '') => {
  return getUsersAPI(query, role);
};

export const getMyProfileAPI = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const changeMyPasswordAPI = async (currentPassword, newPassword) => {
  const response = await apiClient.patch('/users/me/password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

export const createUserAPI = async (user) => {
  const response = await apiClient.post('/users', user);
  return response.data;
};

export const updateUserRoleAPI = async (userId, newRole) => {
  const response = await apiClient.patch(`/users/${userId}/role`, { role: newRole });
  return response.data;
};

export const bulkCreateUsersAPI = async (users) => {
  const response = await apiClient.post('/users/bulk', { users });
  return response.data;
};

export const deleteUserAPI = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};

export const getRoleRequestsAPI = async () => {
  const response = await apiClient.get('/role-requests');
  return response.data;
};

export const createRoleRequestAPI = async (userId, message, attachment) => {
  const response = await apiClient.post('/role-requests', {
    userId,
    message,
    attachment: attachment ? attachment.name : null
  });
  return response.data;
};

export const processRoleRequestAPI = async (requestId, action) => {
  const response = await apiClient.patch(`/role-requests/${requestId}/process`, { action });
  return response.data;
};

