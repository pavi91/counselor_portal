const db = require('../config/db');

const getTicketsByStudent = async (studentId) => {
  const [rows] = await db.query(
    `SELECT t.id, t.student_id, t.counselor_id, t.subject, t.status, t.created_at,
            s.name AS studentName, c.name AS counselorName
     FROM tickets t
     JOIN users s ON s.id = t.student_id
     JOIN users c ON c.id = t.counselor_id
     WHERE t.student_id = ?
     ORDER BY t.created_at DESC`,
    [studentId]
  );
  return rows;
};

const getTicketsByCounselor = async (counselorId) => {
  const [rows] = await db.query(
    `SELECT t.id, t.student_id, t.counselor_id, t.subject, t.status, t.created_at,
            s.name AS studentName, c.name AS counselorName
     FROM tickets t
     JOIN users s ON s.id = t.student_id
     JOIN users c ON c.id = t.counselor_id
     WHERE t.counselor_id = ?
     ORDER BY t.created_at DESC`,
    [counselorId]
  );
  return rows;
};

const getMessagesByTicketId = async (ticketId) => {
  const [rows] = await db.query(
    `SELECT id, ticket_id, sender_id, text, attachment, created_at
     FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
    [ticketId]
  );
  return rows;
};

const createTicket = async (ticket) => {
  const [result] = await db.query(
    `INSERT INTO tickets (student_id, counselor_id, subject, status, created_at)
     VALUES (?, ?, ?, ?, CURRENT_DATE())`,
    [ticket.studentId, ticket.counselorId, ticket.subject, ticket.status]
  );
  return result.insertId;
};

const addMessage = async (message) => {
  const [result] = await db.query(
    `INSERT INTO ticket_messages (ticket_id, sender_id, text, attachment, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [message.ticketId, message.senderId, message.text, message.attachment, message.createdAt]
  );
  return result.insertId;
};

const updateTicketStatus = async (ticketId, status) => {
  await db.query(`UPDATE tickets SET status = ? WHERE id = ?`, [status, ticketId]);
};

const findTicketById = async (ticketId) => {
  const [rows] = await db.query(
    `SELECT id, student_id, counselor_id, subject, status, created_at FROM tickets WHERE id = ?`,
    [ticketId]
  );
  return rows[0] || null;
};

module.exports = {
  getTicketsByStudent,
  getTicketsByCounselor,
  getMessagesByTicketId,
  createTicket,
  addMessage,
  updateTicketStatus,
  findTicketById
};
