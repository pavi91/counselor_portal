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
  const formData = new FormData();
  formData.append('studentId', studentId);
  formData.append('counselorId', counselorId);
  formData.append('subject', subject);
  formData.append('initialMessage', initialMessage);
  
  if (attachment) {
    formData.append('attachment', attachment);
  }
  
  const response = await apiClient.post('/tickets', formData);
  return response.data;
};

export const replyToTicketAPI = async (ticketId, senderId, message, attachment = null) => {
  const formData = new FormData();
  formData.append('senderId', senderId);
  formData.append('message', message);
  
  if (attachment) {
    formData.append('attachment', attachment);
  }
  
  const response = await apiClient.post(`/tickets/${ticketId}/reply`, formData);
  return response.data;
};

export const updateTicketStatusAPI = async (ticketId, status) => {
  const response = await apiClient.patch(`/tickets/${ticketId}/status`, { status });
  return response.data;
};