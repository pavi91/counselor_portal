const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, userController.getUsers);
router.post('/', authMiddleware, userController.createUser);
router.post('/bulk', authMiddleware, userController.bulkCreateUsers);
router.patch('/:id/role', authMiddleware, userController.updateUserRole);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
