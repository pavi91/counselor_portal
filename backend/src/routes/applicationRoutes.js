const express = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, applicationController.getAllApplications);
router.get('/user/:userId', authMiddleware, applicationController.getMyApplication);
router.post('/user/:userId', authMiddleware, applicationController.submitApplication);
router.patch('/:id/status', authMiddleware, applicationController.updateStatus);

module.exports = router;
