import apiClient from './apiClient';

export const getStudentTicketsAPI = async (studentId) => {
  const response = await apiClient.get(`/tickets/student/${studentId}`);
  return response.data;
};

export const getCounselorTicketsAPI = async (counselorId) => {
  const response = await apiClient.get(`/tickets/counselor/${counselorId}`);
  return response.data;
};

export const createTicketAPI = async (studentId, counselorId, subject, initialMessage, attachment = null) => {
  const response = await apiClient.post('/tickets', {
    studentId,
    counselorId,
    subject,
    initialMessage,
    attachment: attachment ? attachment.name : null
  });
  return response.data;
};

export const replyToTicketAPI = async (ticketId, senderId, message, attachment = null) => {
  const response = await apiClient.post(`/tickets/${ticketId}/reply`, {
    senderId,
    message,
    attachment: attachment ? attachment.name : null
  });
  return response.data;
};

export const updateTicketStatusAPI = async (ticketId, status) => {
  const response = await apiClient.patch(`/tickets/${ticketId}/status`, { status });
  return response.data;
};