const db = require('../config/db');

// ===== APPLICATION REPORTS =====

const getApplicationCountsByStatus = async () => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count FROM applications GROUP BY status`
  );
  return rows;
};

const getApplicationCountsByMonth = async () => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(submission_date, '%Y-%m') AS month, COUNT(*) AS count
     FROM applications GROUP BY month ORDER BY month`
  );
  return rows;
};

const getApplicationPointsStats = async () => {
  const [rows] = await db.query(
    `SELECT 
       ROUND(AVG(points), 2) AS avg_points,
       ROUND(MIN(points), 2) AS min_points,
       ROUND(MAX(points), 2) AS max_points,
       COUNT(*) AS total
     FROM applications`
  );
  return rows[0];
};

const getApplicationPointsByStatus = async () => {
  const [rows] = await db.query(
    `SELECT status, ROUND(AVG(points), 2) AS avg_points, COUNT(*) AS count
     FROM applications GROUP BY status`
  );
  return rows;
};

const getApplicationsByGender = async () => {
  const [rows] = await db.query(
    `SELECT COALESCE(gender, 'unknown') AS gender, COUNT(*) AS count
     FROM applications GROUP BY gender`
  );
  return rows;
};

const getApplicationsByDistrict = async () => {
  const [rows] = await db.query(
    `SELECT COALESCE(district, 'unknown') AS district, COUNT(*) AS count
     FROM applications GROUP BY district ORDER BY count DESC`
  );
  return rows;
};

const getApplicationsByFaculty = async () => {
  const [rows] = await db.query(
    `SELECT COALESCE(faculty, 'unknown') AS faculty, COUNT(*) AS count
     FROM applications GROUP BY faculty ORDER BY count DESC`
  );
  return rows;
};

const getApplicationsByIncomeRange = async () => {
  const [rows] = await db.query(
    `SELECT COALESCE(income_range, 'unknown') AS income_range, COUNT(*) AS count
     FROM applications GROUP BY income_range ORDER BY count DESC`
  );
  return rows;
};

const getApplicationDistanceStats = async () => {
  const [rows] = await db.query(
    `SELECT 
       ROUND(AVG(distance), 2) AS avg_distance,
       ROUND(MIN(distance), 2) AS min_distance,
       ROUND(MAX(distance), 2) AS max_distance
     FROM applications WHERE distance IS NOT NULL`
  );
  return rows[0];
};

const getApplicationAidStats = async () => {
  const [rows] = await db.query(
    `SELECT 
       SUM(CASE WHEN is_mahapola_recipient = 'yes' THEN 1 ELSE 0 END) AS mahapola_count,
       SUM(CASE WHEN is_samurdhi_recipient = 'yes' THEN 1 ELSE 0 END) AS samurdhi_count,
       SUM(CASE WHEN misconduct = 'yes' THEN 1 ELSE 0 END) AS misconduct_count,
       COUNT(*) AS total
     FROM applications`
  );
  return rows[0];
};

const getApplicationsByHostelPref = async () => {
  const [rows] = await db.query(
    `SELECT COALESCE(hostel_pref, 'none') AS hostel_pref, COUNT(*) AS count
     FROM applications GROUP BY hostel_pref ORDER BY count DESC`
  );
  return rows;
};

// ===== TICKET REPORTS =====

const getTicketCountsByStatus = async () => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) AS count FROM tickets GROUP BY status`
  );
  return rows;
};

const getTicketCountsByMonth = async () => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM tickets GROUP BY month ORDER BY month`
  );
  return rows;
};

const getTicketsPerCounselor = async () => {
  const [rows] = await db.query(
    `SELECT u.name AS counselor_name, t.status, COUNT(*) AS count
     FROM tickets t
     JOIN users u ON u.id = t.counselor_id
     GROUP BY t.counselor_id, u.name, t.status
     ORDER BY u.name, t.status`
  );
  return rows;
};

const getTicketMessageStats = async () => {
  const [rows] = await db.query(
    `SELECT 
       t.id AS ticket_id,
       t.subject,
       t.status,
       COUNT(tm.id) AS message_count,
       MIN(tm.created_at) AS first_message_at,
       MAX(tm.created_at) AS last_message_at
     FROM tickets t
     LEFT JOIN ticket_messages tm ON tm.ticket_id = t.id
     GROUP BY t.id, t.subject, t.status
     ORDER BY t.id DESC`
  );
  return rows;
};

const getTicketSubjectFrequency = async () => {
  const [rows] = await db.query(
    `SELECT subject, COUNT(*) AS count
     FROM tickets GROUP BY subject ORDER BY count DESC LIMIT 20`
  );
  return rows;
};

const getTicketAgingBuckets = async () => {
  const [rows] = await db.query(
    `SELECT 
       CASE 
         WHEN DATEDIFF(CURDATE(), created_at) <= 7 THEN '0-7 days'
         WHEN DATEDIFF(CURDATE(), created_at) <= 14 THEN '8-14 days'
         WHEN DATEDIFF(CURDATE(), created_at) <= 30 THEN '15-30 days'
         ELSE '30+ days'
       END AS age_bucket,
       COUNT(*) AS count
     FROM tickets
     WHERE status != 'resolved'
     GROUP BY age_bucket
     ORDER BY FIELD(age_bucket, '0-7 days', '8-14 days', '15-30 days', '30+ days')`
  );
  return rows;
};

const getTicketOverview = async () => {
  const [rows] = await db.query(
    `SELECT 
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count,
       SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
       SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
     FROM tickets`
  );
  return rows[0];
};

module.exports = {
  getApplicationCountsByStatus,
  getApplicationCountsByMonth,
  getApplicationPointsStats,
  getApplicationPointsByStatus,
  getApplicationsByGender,
  getApplicationsByDistrict,
  getApplicationsByFaculty,
  getApplicationsByIncomeRange,
  getApplicationDistanceStats,
  getApplicationAidStats,
  getApplicationsByHostelPref,
  getTicketCountsByStatus,
  getTicketCountsByMonth,
  getTicketsPerCounselor,
  getTicketMessageStats,
  getTicketSubjectFrequency,
  getTicketAgingBuckets,
  getTicketOverview
};
