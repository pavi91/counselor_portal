const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT u.id, u.password_hash, u.role_id, u.email, u.name, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.name, u.role_id, u.index_number,
            u.full_name, u.name_with_initials, u.permanent_address,
            u.resident_phone, u.mobile_phone, u.gender, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const getPasswordHashById = async (id) => {
  const [rows] = await db.query(
    `SELECT password_hash FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] ? rows[0].password_hash : null;
};

const searchUsers = async (query) => {
  const baseSelect = `SELECT u.id, u.email, u.name, u.role_id, u.index_number, 
                             u.full_name, u.mobile_phone, r.name AS role
                      FROM users u
                      JOIN roles r ON r.id = u.role_id`;
  
  if (!query) {
    const [rows] = await db.query(
      `${baseSelect} ORDER BY u.id DESC`
    );
    return rows;
  }

  const like = `%${query.toLowerCase()}%`;
  const [rows] = await db.query(
    `${baseSelect}
     WHERE LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(r.name) LIKE ?
     ORDER BY u.id DESC`,
    [like, like, like]
  );
  return rows;
};

const getUsersByRole = async (roleName, query = '') => {
  const baseSelect = `SELECT u.id, u.email, u.name, u.role_id, u.index_number, 
                             u.full_name, u.mobile_phone, r.name AS role
                      FROM users u
                      JOIN roles r ON r.id = u.role_id
                      WHERE LOWER(r.name) = LOWER(?)`;
  
  if (!query) {
    const [rows] = await db.query(
      `${baseSelect} ORDER BY u.name ASC`,
      [roleName]
    );
    return rows;
  }

  const like = `%${query.toLowerCase()}%`;
  const [rows] = await db.query(
    `${baseSelect} AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)
     ORDER BY u.name ASC`,
    [roleName, like, like]
  );
  return rows;
};

const createUser = async (user) => {
  const [result] = await db.query(
    `INSERT INTO users (
      email, password_hash, role_id, name, index_number, full_name, name_with_initials,
      permanent_address, resident_phone, mobile_phone, gender
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      user.email,
      user.passwordHash,
      user.roleId,
      user.name,
      user.indexNumber || null,
      user.fullName || null,
      user.nameWithInitials || null,
      user.permanentAddress || null,
      user.residentPhone || null,
      user.mobilePhone || null,
      user.gender || null
    ]
  );
  return result.insertId;
};

const updateUserRole = async (userId, roleId) => {
  await db.query(`UPDATE users SET role_id = ? WHERE id = ?`, [roleId, userId]);
};

const checkUserDependencies = async (userId) => {
  // Check for applications
  const [applications] = await db.query(
    `SELECT COUNT(*) as count FROM applications WHERE user_id = ?`,
    [userId]
  );
  if (applications[0].count > 0) {
    return { hasDependencies: true, type: 'applications', count: applications[0].count };
  }

  // Check for allocations
  const [allocations] = await db.query(
    `SELECT COUNT(*) as count FROM allocations WHERE user_id = ?`,
    [userId]
  );
  if (allocations[0].count > 0) {
    return { hasDependencies: true, type: 'allocations', count: allocations[0].count };
  }

  // Check for tickets
  const [tickets] = await db.query(
    `SELECT COUNT(*) as count FROM tickets WHERE student_id = ? OR counselor_id = ?`,
    [userId, userId]
  );
  if (tickets[0].count > 0) {
    return { hasDependencies: true, type: 'tickets', count: tickets[0].count };
  }

  return { hasDependencies: false };
};

const deleteUser = async (userId) => {
  await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
};

const updatePasswordHash = async (userId, passwordHash) => {
  await db.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
};

const updateProfile = async (userId, { permanentAddress, residentPhone, mobilePhone }) => {
  await db.query(
    `UPDATE users SET permanent_address = ?, resident_phone = ?, mobile_phone = ? WHERE id = ?`,
    [permanentAddress, residentPhone, mobilePhone, userId]
  );
};

const getRoleIdByName = async (roleName) => {
  const [rows] = await db.query(`SELECT id FROM roles WHERE name = ?`, [roleName]);
  return rows[0] ? rows[0].id : null;
};

module.exports = {
  findByEmail,
  findById,
  getPasswordHashById,
  searchUsers,
  getUsersByRole,
  createUser,
  updateUserRole,
  deleteUser,
  checkUserDependencies,
  updatePasswordHash,
  updateProfile,
  getRoleIdByName
};
