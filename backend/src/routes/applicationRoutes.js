const express = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const { uploadApplicationFiles } = require('../middlewares/uploadMiddleware');
const { validateApplicationSubmit } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications
 *     description: Retrieve all applications (requires applications.view_all permission)
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, rbacMiddleware('applications.view_all'), applicationController.getAllApplications);

/**
 * @swagger
 * /api/applications/user/{userId}:
 *   get:
 *     summary: Get user's application
 *     description: Retrieve a specific user's application (requires applications.view_own or applications.view_all)
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's application
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', authMiddleware, rbacMiddleware(['applications.view_own', 'applications.view_all']), applicationController.getMyApplication);

/**
 * @swagger
 * /api/applications/user/{userId}:
 *   post:
 *     summary: Submit application
 *     description: Submit or update a user's application (requires applications.submit permission)
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - indexNumber
 *               - email
 *               - gender
 *               - mobilePhone
 *               - district
 *               - faculty
 *               - department
 *               - year
 *               - hostelPref
 *             properties:
 *               fullName:
 *                 type: string
 *               indexNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               mobilePhone:
 *                 type: string
 *               district:
 *                 type: string
 *               faculty:
 *                 type: string
 *               department:
 *                 type: string
 *               year:
 *                 type: string
 *               hostelPref:
 *                 type: string
 *               fileResidence:
 *                 type: string
 *                 format: binary
 *               fileIncome:
 *                 type: string
 *                 format: binary
 *               fileSiblings:
 *                 type: string
 *                 format: binary
 *               fileSamurdhi:
 *                 type: string
 *                 format: binary
 *               fileSports:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/user/:userId', authMiddleware, rbacMiddleware('applications.submit'), uploadApplicationFiles, validateApplicationSubmit, applicationController.submitApplication);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     description: Update application status to approved or rejected (requires applications.review permission)
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
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
 *     responses:
 *       200:
 *         description: Application status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', authMiddleware, rbacMiddleware('applications.review'), applicationController.updateStatus);

/**
 * @swagger
 * /api/applications/user/{userId}:
 *   delete:
 *     summary: Delete user's application
 *     description: Delete a user's application (requires applications.review permission)
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Application deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.delete('/user/:userId', authMiddleware, rbacMiddleware('applications.review'), applicationController.deleteByUserId);

module.exports = router;
