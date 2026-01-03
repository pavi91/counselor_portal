// src/api/ticketApi.js
import { MOCK_TICKETS, MOCK_USERS } from '../utils/mockDB';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to hydrate user details into tickets
const hydrateTicket = (ticket) => {
  const student = MOCK_USERS.find(u => u.id === ticket.studentId);
  const counselor = MOCK_USERS.find(u => u.id === ticket.counselorId);
  return {
    ...ticket,
    studentName: student ? student.name : 'Unknown Student',
    counselorName: counselor ? counselor.name : 'Unknown Counselor'
  };
};

export const getStudentTicketsAPI = async (studentId) => {
  await delay(300);
  return MOCK_TICKETS
    .filter(t => t.studentId === studentId)
    .map(hydrateTicket)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getCounselorTicketsAPI = async (counselorId) => {
  await delay(300);
  return MOCK_TICKETS
    .filter(t => t.counselorId === counselorId)
    .map(hydrateTicket)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const createTicketAPI = async (studentId, counselorId, subject, initialMessage) => {
  await delay(500);
  
  const newTicket = {
    id: Date.now(),
    studentId: parseInt(studentId),
    counselorId: parseInt(counselorId),
    subject,
    status: 'open',
    messages: [
      { 
        senderId: parseInt(studentId), 
        text: initialMessage, 
        timestamp: new Date().toLocaleString() 
      }
    ],
    createdAt: new Date().toISOString().split('T')[0]
  };

  MOCK_TICKETS.push(newTicket);
  return hydrateTicket(newTicket);
};

export const replyToTicketAPI = async (ticketId, senderId, message) => {
  await delay(300);
  const ticket = MOCK_TICKETS.find(t => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found");

  ticket.messages.push({
    senderId: parseInt(senderId),
    text: message,
    timestamp: new Date().toLocaleString()
  });

  return hydrateTicket(ticket);
};

export const updateTicketStatusAPI = async (ticketId, status) => {
  await delay(300);
  const ticket = MOCK_TICKETS.find(t => t.id === ticketId);
  if (!ticket) throw new Error("Ticket not found");
  
  ticket.status = status;
  return hydrateTicket(ticket);
};