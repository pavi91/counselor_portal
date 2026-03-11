const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/reports/applications:
 *   get:
 *     summary: Get application reports
 *     description: >
 *       Comprehensive application analytics including status breakdown, monthly trends,
 *       point statistics, demographics (gender, district, faculty), financial aid uptake,
 *       distance stats, income ranges, and hostel preferences. Admin only.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 byStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: pending
 *                       count:
 *                         type: integer
 *                         example: 12
 *                 byMonth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: '2026-01'
 *                       count:
 *                         type: integer
 *                         example: 5
 *                 pointsStats:
 *                   type: object
 *                   properties:
 *                     avg_points:
 *                       type: number
 *                       example: 42.5
 *                     min_points:
 *                       type: number
 *                       example: 10.0
 *                     max_points:
 *                       type: number
 *                       example: 92.0
 *                     total:
 *                       type: integer
 *                       example: 25
 *                 pointsByStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       avg_points:
 *                         type: number
 *                       count:
 *                         type: integer
 *                 byGender:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       gender:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 byDistrict:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       district:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 byFaculty:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       faculty:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 byIncomeRange:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       income_range:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 distanceStats:
 *                   type: object
 *                   properties:
 *                     avg_distance:
 *                       type: number
 *                     min_distance:
 *                       type: number
 *                     max_distance:
 *                       type: number
 *                 aidStats:
 *                   type: object
 *                   properties:
 *                     mahapola_count:
 *                       type: integer
 *                     samurdhi_count:
 *                       type: integer
 *                     misconduct_count:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 byHostelPref:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hostel_pref:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.get('/applications', authMiddleware, rbacMiddleware('reports.view'), reportController.getApplicationReport);

/**
 * @swagger
 * /api/reports/tickets:
 *   get:
 *     summary: Get ticket reports
 *     description: >
 *       Comprehensive ticket analytics including overview totals, status breakdown,
 *       monthly trends, per-counselor workload, message statistics, subject frequency,
 *       and open ticket aging buckets. Admin only.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     open_count:
 *                       type: integer
 *                       example: 10
 *                     in_progress_count:
 *                       type: integer
 *                       example: 15
 *                     resolved_count:
 *                       type: integer
 *                       example: 25
 *                 byStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 byMonth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 perCounselor:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       counselor_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 messageStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ticket_id:
 *                         type: integer
 *                       subject:
 *                         type: string
 *                       status:
 *                         type: string
 *                       message_count:
 *                         type: integer
 *                       first_message_at:
 *                         type: string
 *                       last_message_at:
 *                         type: string
 *                 subjectFrequency:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 agingBuckets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       age_bucket:
 *                         type: string
 *                         example: '0-7 days'
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.get('/tickets', authMiddleware, rbacMiddleware('reports.view'), reportController.getTicketReport);

module.exports = router;
