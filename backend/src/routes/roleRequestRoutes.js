const express = require('express');
const roleRequestController = require('../controllers/roleRequestController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, roleRequestController.getRoleRequests);
router.post('/', authMiddleware, roleRequestController.createRoleRequest);
router.patch('/:id/process', authMiddleware, roleRequestController.processRoleRequest);

module.exports = router;
