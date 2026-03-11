import apiClient from './apiClient';

export const getApplicationReportAPI = async () => {
  const response = await apiClient.get('/reports/applications');
  return response.data;
};

export const getTicketReportAPI = async () => {
  const response = await apiClient.get('/reports/tickets');
  return response.data;
};
