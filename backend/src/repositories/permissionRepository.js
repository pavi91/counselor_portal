const db = require('../config/db');

/**
 * Get all permissions for a user
 */
const getUserPermissions = async (userId) => {
  const query = `
    SELECT DISTINCT p.id, p.name, p.description, p.resource, p.action
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    INNER JOIN role_permissions rp ON r.id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = ?
  `;
  const [rows] = await db.query(query, [userId]);
  return rows;
};

/**
 * Get all permissions for a role
 */
const getRolePermissions = async (roleId) => {
  const query = `
    SELECT DISTINCT p.id, p.name, p.description, p.resource, p.action
    FROM role_permissions rp
    INNER JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = ?
  `;
  const [rows] = await db.query(query, [roleId]);
  return rows;
};

/**
 * Check if user has a specific permission
 */
const hasPermission = async (userId, permissionName) => {
  const query = `
    SELECT COUNT(*) as count
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    INNER JOIN role_permissions rp ON r.id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = ? AND p.name = ?
  `;
  const [rows] = await db.query(query, [userId, permissionName]);
  return rows[0].count > 0;
};

/**
 * Check if user has any of the specified permissions
 */
const hasAnyPermission = async (userId, permissionNames) => {
  if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
    return false;
  }

  const placeholders = permissionNames.map(() => '?').join(',');
  const query = `
    SELECT COUNT(*) as count
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    INNER JOIN role_permissions rp ON r.id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = ? AND p.name IN (${placeholders})
  `;
  const [rows] = await db.query(query, [userId, ...permissionNames]);
  return rows[0].count > 0;
};

/**
 * Get all permissions
 */
const getAllPermissions = async () => {
  const query = `
    SELECT id, name, description, resource, action
    FROM permissions
    ORDER BY resource, action
  `;
  const [rows] = await db.query(query);
  return rows;
};

/**
 * Get all roles with their permissions
 */
const getRolesWithPermissions = async () => {
  const query = `
    SELECT 
      r.id as roleId,
      r.name as roleName,
      r.description,
      JSON_ARRAYAGG(
        JSON_OBJECT('id', p.id, 'name', p.name, 'resource', p.resource, 'action', p.action)
      ) as permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY r.id, r.name, r.description
  `;
  const [rows] = await db.query(query);
  return rows;
};

/**
 * Assign permission to role
 */
const assignPermissionToRole = async (roleId, permissionId) => {
  const query = `
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
  `;
  await db.query(query, [roleId, permissionId]);
};

/**
 * Remove permission from role
 */
const removePermissionFromRole = async (roleId, permissionId) => {
  const query = `
    DELETE FROM role_permissions
    WHERE role_id = ? AND permission_id = ?
  `;
  await db.query(query, [roleId, permissionId]);
};

module.exports = {
  getUserPermissions,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  getAllPermissions,
  getRolesWithPermissions,
  assignPermissionToRole,
  removePermissionFromRole
};
