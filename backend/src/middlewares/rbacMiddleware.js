const db = require('../config/db');

/**
 * RBAC Middleware - Check if user has required permission
 * Usage: rbacMiddleware('users.create') or rbacMiddleware(['users.create', 'users.edit'])
 */
const rbacMiddleware = (requiredPermissions) => {
  // If single permission, convert to array
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req, res, next) => {
    try {
      // User should be set by authMiddleware
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      }

      const userId = req.user.id;

      // Get user's role and their permissions from database
      const query = `
        SELECT DISTINCT p.name
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        INNER JOIN role_permissions rp ON r.id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ?
      `;

      const [rows] = await db.query(query, [userId]);
      const userPermissions = rows.map(row => row.name);

      // Check if user has at least one of the required permissions
      const hasPermission = permissions.some(perm => userPermissions.includes(perm));

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `User lacks required permissions. Requires one of: ${permissions.join(', ')}`,
          requiredPermissions: permissions,
          userPermissions: userPermissions
        });
      }

      // Store user permissions in request for potential use in controller
      req.userPermissions = userPermissions;
      next();
    } catch (err) {
      console.error('RBAC Middleware Error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  };
};

module.exports = rbacMiddleware;
