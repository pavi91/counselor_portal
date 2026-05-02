const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.query(
    `SELECT rr.id, rr.user_id, rr.message, rr.attachment, rr.status, rr.created_at,
            u.name AS userName, u.email AS userEmail
     FROM role_requests rr
     JOIN users u ON u.id = rr.user_id
     ORDER BY rr.created_at DESC`
  );
  return rows;
};

const findPendingByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM role_requests WHERE user_id = ? AND status = 'pending'`,
    [userId]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO role_requests (user_id, message, attachment, status, created_at)
     VALUES (?, ?, ?, 'pending', CURRENT_DATE())`,
    [data.userId, data.message, data.attachment || null]
  );
  return result.insertId;
};

const updateStatus = async (id, status) => {
  await db.query(`UPDATE role_requests SET status = ? WHERE id = ?`, [status, id]);
};

const findById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM role_requests WHERE id = ?`, [id]);
  return rows[0] || null;
};

const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM role_requests WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

const findActiveByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM role_requests WHERE user_id = ? AND status IN ('pending', 'approved') ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

module.exports = {
  getAll,
  findPendingByUserId,
  findByUserId,
  findActiveByUserId,
  create,
  updateStatus,
  findById
};
