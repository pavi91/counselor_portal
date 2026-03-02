const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const { validateUserCreate } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users list
 *     description: Retrieve list of users with optional role filter and search query
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [student, counselor, staff, admin]
 *         description: Filter users by role
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, rbacMiddleware(['users.view_all', 'users.view_by_role']), userController.getUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's full profile for prefilling forms
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/me', authMiddleware, userController.getMe);

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Change current user password
 *     description: Update the authenticated user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpass123
 *               newPassword:
 *                 type: string
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/me/password', authMiddleware, userController.changeMyPassword);

/**
 * @swagger
 * /api/users/me/profile:
 *   patch:
 *     summary: Update current user profile
 *     description: Update the authenticated user's editable profile fields (permanent address, resident phone, mobile phone)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permanentAddress:
 *                 type: string
 *                 example: 123 Main St, Colombo
 *               residentPhone:
 *                 type: string
 *                 example: '0112345678'
 *               mobilePhone:
 *                 type: string
 *                 example: '0771234567'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/me/profile', authMiddleware, userController.updateMyProfile);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user account (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [student, counselor, staff, admin]
 *                 example: student
 *               indexNumber:
 *                 type: string
 *                 example: 2021/CS/001
 *               fullName:
 *                 type: string
 *                 example: John Michael Doe
 *               nameWithInitials:
 *                 type: string
 *                 example: J.M. Doe
 *               permanentAddress:
 *                 type: string
 *               residentPhone:
 *                 type: string
 *               mobilePhone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, rbacMiddleware('users.create'), validateUserCreate, userController.createUser);

/**
 * @swagger
 * /api/users/bulk:
 *   post:
 *     summary: Bulk create users
 *     description: Create multiple users from CSV data (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - users
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     role:
 *                       type: string
 *     responses:
 *       201:
 *         description: Users created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/bulk', authMiddleware, rbacMiddleware('users.bulk_create'), userController.bulkCreateUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Update a user's role (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, counselor, staff, admin]
 *                 example: counselor
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/role', authMiddleware, rbacMiddleware('users.change_role'), userController.updateUserRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account (admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, rbacMiddleware('users.delete'), userController.deleteUser);

module.exports = router;
