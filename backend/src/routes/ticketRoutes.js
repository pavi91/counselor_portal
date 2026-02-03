const express = require('express');
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/tickets/student/{studentId}:
 *   get:
 *     summary: Get student's tickets
 *     description: Retrieve all support tickets for a specific student
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student User ID
 *     responses:
 *       200:
 *         description: List of student's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/student/:studentId', authMiddleware, rbacMiddleware(['tickets.view_own', 'tickets.view_assigned']), ticketController.getStudentTickets);

/**
 * @swagger
 * /api/tickets/counselor/{counselorId}:
 *   get:
 *     summary: Get counselor's assigned tickets
 *     description: Retrieve all support tickets assigned to a specific counselor
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: counselorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Counselor User ID
 *     responses:
 *       200:
 *         description: List of counselor's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/counselor/:counselorId', authMiddleware, rbacMiddleware('tickets.view_assigned'), ticketController.getCounselorTickets);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new support ticket
 *     description: Create a new support ticket for a student
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - title
 *               - description
 *             properties:
 *               studentId:
 *                 type: integer
 *                 example: 1
 *               counselorId:
 *                 type: integer
 *                 example: 2
 *               title:
 *                 type: string
 *                 example: Hostel room issue
 *               description:
 *                 type: string
 *                 example: There is a water leak in my room
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, rbacMiddleware('tickets.create'), ticketController.createTicket);

/**
 * @swagger
 * /api/tickets/{id}/reply:
 *   post:
 *     summary: Reply to a ticket
 *     description: Add a reply message to an existing ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - senderId
 *             properties:
 *               message:
 *                 type: string
 *                 example: The maintenance team will fix this soon
 *               senderId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Reply added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reply added
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.post('/:id/reply', authMiddleware, rbacMiddleware('tickets.reply'), ticketController.replyToTicket);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     description: Update the status of a support ticket
 *     tags:
 *       - Tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
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
 *                 enum: [open, in_progress, resolved]
 *                 example: resolved
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket status updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', authMiddleware, rbacMiddleware('tickets.resolve'), ticketController.updateTicketStatus);

module.exports = router;
