const ticketRepository = require('../repositories/ticketRepository');

const hydrateTickets = async (tickets) => {
  const result = [];
  for (const ticket of tickets) {
    const messages = await ticketRepository.getMessagesByTicketId(ticket.id);
    result.push({
      ...ticket,
      messages
    });
  }
  return result;
};

const getStudentTickets = async (studentId) => {
  const tickets = await ticketRepository.getTicketsByStudent(studentId);
  return hydrateTickets(tickets);
};

const getCounselorTickets = async (counselorId) => {
  const tickets = await ticketRepository.getTicketsByCounselor(counselorId);
  return hydrateTickets(tickets);
};

const createTicket = async (studentId, counselorId, subject, initialMessage, attachment) => {
  const ticketId = await ticketRepository.createTicket({
    studentId,
    counselorId,
    subject,
    status: 'open'
  });

  await ticketRepository.addMessage({
    ticketId,
    senderId: studentId,
    text: initialMessage,
    attachment: attachment || null,
    createdAt: new Date().toLocaleString()
  });

  const ticket = await ticketRepository.findTicketById(ticketId);
  const messages = await ticketRepository.getMessagesByTicketId(ticketId);
  return { ...ticket, messages };
};

const replyToTicket = async (ticketId, senderId, message, attachment) => {
  const ticket = await ticketRepository.findTicketById(ticketId);
  if (!ticket) {
    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  }

  await ticketRepository.addMessage({
    ticketId,
    senderId,
    text: message,
    attachment: attachment || null,
    createdAt: new Date().toLocaleString()
  });

  const messages = await ticketRepository.getMessagesByTicketId(ticketId);
  return { ...ticket, messages };
};

const updateTicketStatus = async (ticketId, status) => {
  await ticketRepository.updateTicketStatus(ticketId, status);
  const ticket = await ticketRepository.findTicketById(ticketId);
  const messages = await ticketRepository.getMessagesByTicketId(ticketId);
  return { ...ticket, messages };
};

module.exports = {
  getStudentTickets,
  getCounselorTickets,
  createTicket,
  replyToTicket,
  updateTicketStatus
};
