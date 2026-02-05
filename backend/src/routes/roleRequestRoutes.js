const express = require('express');
const roleRequestController = require('../controllers/roleRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const { uploadRoleRequestAttachment } = require('../middlewares/uploadMiddleware');
const { validateRoleRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/role-requests:
 *   get:
 *     summary: Get role requests
 *     description: Retrieve pending role requests (admin/staff only)
 *     tags:
 *       - Role Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of role requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoleRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, rbacMiddleware('role_requests.view_all'), roleRequestController.getRoleRequests);

/**
 * @swagger
 * /api/role-requests:
 *   post:
 *     summary: Create a role request
 *     description: Submit a request to get a new role
 *     tags:
 *       - Role Requests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - requestedRole
 *               - reason
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               requestedRole:
 *                 type: string
 *                 enum: [counselor, staff, admin]
 *                 example: counselor
 *               reason:
 *                 type: string
 *                 example: I want to help other students as a counselor
 *     responses:
 *       201:
 *         description: Role request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleRequest'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, rbacMiddleware('role_requests.create'), uploadRoleRequestAttachment, validateRoleRequest, roleRequestController.createRoleRequest);

/**
 * @swagger
 * /api/role-requests/{id}/process:
 *   patch:
 *     summary: Process role request
 *     description: Approve or reject a role request (admin only)
 *     tags:
 *       - Role Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *               notes:
 *                 type: string
 *                 example: You have been approved to be a counselor
 *     responses:
 *       200:
 *         description: Role request processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request processed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/process', authMiddleware, rbacMiddleware('role_requests.process'), roleRequestController.processRoleRequest);

module.exports = router;
