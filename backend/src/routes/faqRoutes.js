const express = require('express');
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');
const { validateFaqCreate, validateFaqUpdate } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/faqs/reports/data:
 *   get:
 *     summary: Get FAQ report data
 *     description: Admin-only analytics on FAQ usage
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQ report data
 */
router.get('/reports/data', authMiddleware, rbacMiddleware('faqs.report'), faqController.getFaqReport);

/**
 * @swagger
 * /api/faqs/reports/csv:
 *   get:
 *     summary: Export FAQ report as CSV
 *     description: Admin-only CSV export of FAQ usage data
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/reports/csv', authMiddleware, rbacMiddleware('faqs.report'), faqController.exportFaqCsv);

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Get all FAQ questions
 *     description: Retrieve all active FAQ questions. Counselors can include inactive ones.
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: includeInactive
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Include inactive FAQs (counselor/admin only)
 *     responses:
 *       200:
 *         description: List of FAQ questions
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, rbacMiddleware(['faqs.view', 'faqs.manage']), faqController.getAllFaqs);

/**
 * @swagger
 * /api/faqs/{id}:
 *   get:
 *     summary: Get a single FAQ question
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: FAQ question details
 *       404:
 *         description: FAQ not found
 */
router.get('/:id', authMiddleware, rbacMiddleware(['faqs.view', 'faqs.manage']), faqController.getFaqById);

/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Create a new FAQ question
 *     description: Counselors can create new FAQ questions
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - category
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authMiddleware, rbacMiddleware('faqs.manage'), validateFaqCreate, faqController.createFaq);

/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     summary: Update a FAQ question
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - category
 *               - isActive
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: FAQ updated
 *       404:
 *         description: FAQ not found
 */
router.put('/:id', authMiddleware, rbacMiddleware('faqs.manage'), validateFaqUpdate, faqController.updateFaq);

/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     summary: Delete a FAQ question
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: FAQ deleted
 *       404:
 *         description: FAQ not found
 */
router.delete('/:id', authMiddleware, rbacMiddleware('faqs.manage'), faqController.deleteFaq);

/**
 * @swagger
 * /api/faqs/{id}/use:
 *   post:
 *     summary: Log FAQ usage by student
 *     description: Students can log when they use/view a FAQ question
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usage logged
 *       404:
 *         description: FAQ not found
 */
router.post('/:id/use', authMiddleware, rbacMiddleware('faqs.use'), faqController.logFaqUsage);

module.exports = router;
