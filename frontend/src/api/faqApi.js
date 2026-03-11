import apiClient from './apiClient';

export const getAllFaqsAPI = async (includeInactive = false) => {
  const response = await apiClient.get('/faqs', { params: { includeInactive } });
  return response.data;
};

export const getFaqByIdAPI = async (id) => {
  const response = await apiClient.get(`/faqs/${id}`);
  return response.data;
};

export const createFaqAPI = async (question, answer, category) => {
  const response = await apiClient.post('/faqs', { question, answer, category });
  return response.data;
};

export const updateFaqAPI = async (id, question, answer, category, isActive) => {
  const response = await apiClient.put(`/faqs/${id}`, { question, answer, category, isActive });
  return response.data;
};

export const deleteFaqAPI = async (id) => {
  const response = await apiClient.delete(`/faqs/${id}`);
  return response.data;
};

export const logFaqUsageAPI = async (faqId) => {
  const response = await apiClient.post(`/faqs/${faqId}/use`);
  return response.data;
};

export const getFaqReportAPI = async () => {
  const response = await apiClient.get('/faqs/reports/data');
  return response.data;
};

export const exportFaqCsvAPI = async () => {
  const response = await apiClient.get('/faqs/reports/csv', { responseType: 'blob' });
  return response.data;
};
