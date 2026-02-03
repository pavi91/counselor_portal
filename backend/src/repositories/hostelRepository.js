const db = require('../config/db');

const getHostels = async () => {
  const [rows] = await db.query(`SELECT id, name FROM hostels ORDER BY name`);
  return rows;
};

const getRooms = async (hostelId = null) => {
  if (hostelId) {
    const [rows] = await db.query(
      `SELECT r.id, r.hostel_id, r.number, r.floor, r.capacity, r.type, h.name AS hostel
       FROM rooms r
       JOIN hostels h ON h.id = r.hostel_id
       WHERE r.hostel_id = ?
       ORDER BY r.floor, r.number`,
      [hostelId]
    );
    return rows;
  }

  const [rows] = await db.query(
    `SELECT r.id, r.hostel_id, r.number, r.floor, r.capacity, r.type, h.name AS hostel
     FROM rooms r
     JOIN hostels h ON h.id = r.hostel_id
     ORDER BY h.name, r.floor, r.number`
  );
  return rows;
};

const getAllocations = async () => {
  const [rows] = await db.query(
    `SELECT
        a.id,
        a.user_id AS userId,
        a.room_id AS roomId,
        a.start_date AS startDate,
        a.end_date AS endDate,
        u.name AS studentName,
        u.email AS studentEmail,
        r.number AS roomNumber,
        h.name AS hostelName
     FROM allocations a
     JOIN users u ON u.id = a.user_id
     JOIN rooms r ON r.id = a.room_id
     JOIN hostels h ON h.id = r.hostel_id
     ORDER BY a.start_date DESC`
  );
  return rows;
};

const getAllocationByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT
        a.id,
        a.user_id AS userId,
        a.room_id AS roomId,
        a.start_date AS startDate,
        a.end_date AS endDate,
        r.number AS roomNumber,
        r.floor,
        h.name AS hostelName
     FROM allocations a
     JOIN rooms r ON r.id = a.room_id
     JOIN hostels h ON h.id = r.hostel_id
     WHERE a.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

const getAllocationsByRoomId = async (roomId) => {
  const [rows] = await db.query(
    `SELECT id, user_id AS userId, room_id AS roomId, start_date AS startDate, end_date AS endDate
     FROM allocations WHERE room_id = ?`,
    [roomId]
  );
  return rows;
};

const createAllocation = async (allocation) => {
  const [result] = await db.query(
    `INSERT INTO allocations (user_id, room_id, start_date, end_date)
     VALUES (?, ?, ?, ?)`,
    [allocation.userId, allocation.roomId, allocation.startDate, allocation.endDate]
  );
  return result.insertId;
};

const removeAllocationByUserId = async (userId) => {
  await db.query(`DELETE FROM allocations WHERE user_id = ?`, [userId]);
};

const createRoom = async (room) => {
  const [result] = await db.query(
    `INSERT INTO rooms (hostel_id, number, floor, capacity, type)
     VALUES (?, ?, ?, ?, ?)`,
    [room.hostelId, room.number, room.floor, room.capacity, room.type]
  );
  return result.insertId;
};

const findRoomByHostelAndNumber = async (hostelId, number) => {
  const [rows] = await db.query(
    `SELECT id, hostel_id, number, floor, capacity, type FROM rooms WHERE hostel_id = ? AND number = ?`,
    [hostelId, number]
  );
  return rows[0] || null;
};

const getRoomById = async (roomId) => {
  const [rows] = await db.query(
    `SELECT id, hostel_id, number, floor, capacity, type FROM rooms WHERE id = ?`,
    [roomId]
  );
  return rows[0] || null;
};

module.exports = {
  getHostels,
  getRooms,
  getAllocations,
  getAllocationByUserId,
  getAllocationsByRoomId,
  createAllocation,
  removeAllocationByUserId,
  createRoom,
  findRoomByHostelAndNumber,
  getRoomById
};
