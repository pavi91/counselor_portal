const express = require('express');
const hostelController = require('../controllers/hostelController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, hostelController.getHostels);
router.get('/stats', authMiddleware, hostelController.getHostelStats);
router.get('/allocations', authMiddleware, hostelController.getAllAllocations);
router.get('/allocations/:userId', authMiddleware, hostelController.getStudentHostelDetails);
router.post('/assign', authMiddleware, hostelController.assignRoom);
router.delete('/allocations/:userId', authMiddleware, hostelController.removeAllocation);
router.post('/rooms', authMiddleware, hostelController.createRoom);

module.exports = router;
