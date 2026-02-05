const express = require('express');
const hostelController = require('../controllers/hostelController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const { validateHostelAssignment, validateRoomCreate } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/hostels:
 *   get:
 *     summary: Get all hostels
 *     description: Retrieve list of all hostels with capacity and occupancy info
 *     tags:
 *       - Hostels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of hostels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hostel'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, rbacMiddleware('hostels.view'), hostelController.getHostels);

/**
 * @swagger
 * /api/hostels/stats:
 *   get:
 *     summary: Get hostel statistics
 *     description: Retrieve hostel occupancy and capacity statistics
 *     tags:
 *       - Hostels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hostel statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hostelId:
 *                     type: integer
 *                   hostelName:
 *                     type: string
 *                   totalRooms:
 *                     type: integer
 *                   occupiedRooms:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authMiddleware, rbacMiddleware('hostels.view_stats'), hostelController.getHostelStats);

/**
 * @swagger
 * /api/hostels/allocations:
 *   get:
 *     summary: Get all room allocations
 *     description: Retrieve all hostel room allocations
 *     tags:
 *       - Hostels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of allocations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   allocationId:
 *                     type: integer
 *                   studentId:
 *                     type: integer
 *                   hostelId:
 *                     type: integer
 *                   roomNumber:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/allocations', authMiddleware, rbacMiddleware('hostels.view'), hostelController.getAllAllocations);

/**
 * @swagger
 * /api/hostels/allocations/{userId}:
 *   get:
 *     summary: Get student's hostel details
 *     description: Retrieve hostel allocation details for a specific student
 *     tags:
 *       - Hostels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student User ID
 *     responses:
 *       200:
 *         description: Student's hostel allocation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hostelName:
 *                   type: string
 *                 roomNumber:
 *                   type: string
 *                 bedNumber:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No allocation found
 *       500:
 *         description: Server error
 */
router.get('/allocations/:userId', authMiddleware, rbacMiddleware(['hostels.view_allocation', 'hostels.manage']), hostelController.getStudentHostelDetails);

/**
 * @swagger
 * /api/hostels/assign:
 *   post:
 *     summary: Assign room to student
 *     description: Assign a hostel room to a student
 *     tags:
 *       - Hostels
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
 *               - roomId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roomId:
 *                 type: integer
 *                 example: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-01"
 *                 description: Start date of the allocation
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2027-02-01"
 *                 description: End date of the allocation
 *     responses:
 *       201:
 *         description: Room assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Room assigned successfully
 *       400:
 *         description: Invalid input or room full
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/assign', authMiddleware, rbacMiddleware('hostels.assign'), validateHostelAssignment, hostelController.assignRoom);

/**
 * @swagger
 * /api/hostels/allocations/{userId}:
 *   delete:
 *     summary: Remove student's hostel allocation
 *     description: Remove a student's hostel room allocation
 *     tags:
 *       - Hostels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student User ID
 *     responses:
 *       200:
 *         description: Allocation removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Allocation removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Allocation not found
 *       500:
 *         description: Server error
 */
router.delete('/allocations/:userId', authMiddleware, rbacMiddleware('hostels.manage'), hostelController.removeAllocation);

/**
 * @swagger
 * /api/hostels/rooms:
 *   post:
 *     summary: Create new hostel room
 *     description: Create a new room in a hostel
 *     tags:
 *       - Hostels
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hostelId
 *               - roomNumber
 *               - capacity
 *             properties:
 *               hostelId:
 *                 type: integer
 *                 example: 1
 *               roomNumber:
 *                 type: string
 *                 example: "101"
 *               capacity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Room created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/rooms', authMiddleware, rbacMiddleware('hostels.manage'), validateRoomCreate, hostelController.createRoom);

module.exports = router;
