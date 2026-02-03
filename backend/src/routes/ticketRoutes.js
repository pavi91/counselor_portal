const express = require('express');
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/student/:studentId', authMiddleware, ticketController.getStudentTickets);
router.get('/counselor/:counselorId', authMiddleware, ticketController.getCounselorTickets);
router.post('/', authMiddleware, ticketController.createTicket);
router.post('/:id/reply', authMiddleware, ticketController.replyToTicket);
router.patch('/:id/status', authMiddleware, ticketController.updateTicketStatus);

module.exports = router;
