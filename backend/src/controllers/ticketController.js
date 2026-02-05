const ticketService = require('../services/ticketService');

const getStudentTickets = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const tickets = await ticketService.getStudentTickets(studentId);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

const getCounselorTickets = async (req, res, next) => {
  try {
    const counselorId = parseInt(req.params.counselorId, 10);
    const tickets = await ticketService.getCounselorTickets(counselorId);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { studentId, counselorId, subject, initialMessage } = req.body;
    
    // Handle uploaded attachment from multer
    let attachment = null;
    if (req.file) {
      attachment = `/filestore/${req.file.filename}`;
      console.log('Attachment uploaded:', attachment);
    }

    
    const ticket = await ticketService.createTicket(
      parseInt(studentId, 10),
      parseInt(counselorId, 10),
      subject,
      initialMessage,
      attachment
    );
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

const replyToTicket = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { senderId, message } = req.body;
    
    // Handle uploaded attachment from multer
    let attachment = null;
    if (req.file) {
      attachment = `/filestore/${req.file.filename}`;
    }
    
    const ticket = await ticketService.replyToTicket(ticketId, parseInt(senderId, 10), message, attachment);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const ticket = await ticketService.updateTicketStatus(ticketId, status);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentTickets,
  getCounselorTickets,
  createTicket,
  replyToTicket,
  updateTicketStatus
};
