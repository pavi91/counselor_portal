const db = require('../config/db');

const getAllFaqs = async (includeInactive = false) => {
  const query = includeInactive
    ? `SELECT fq.id, fq.question, fq.answer, fq.category, fq.is_active, fq.created_by, fq.created_at, fq.updated_at, u.name AS creator_name
       FROM faq_questions fq JOIN users u ON u.id = fq.created_by ORDER BY fq.category, fq.created_at DESC`
    : `SELECT fq.id, fq.question, fq.answer, fq.category, fq.is_active, fq.created_by, fq.created_at, fq.updated_at, u.name AS creator_name
       FROM faq_questions fq JOIN users u ON u.id = fq.created_by WHERE fq.is_active = TRUE ORDER BY fq.category, fq.created_at DESC`;
  const [rows] = await db.query(query);
  return rows;
};

const getFaqById = async (id) => {
  const [rows] = await db.query(
    `SELECT fq.id, fq.question, fq.answer, fq.category, fq.is_active, fq.created_by, fq.created_at, fq.updated_at, u.name AS creator_name
     FROM faq_questions fq JOIN users u ON u.id = fq.created_by WHERE fq.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const createFaq = async (faq) => {
  const [result] = await db.query(
    `INSERT INTO faq_questions (question, answer, category, is_active, created_by) VALUES (?, ?, ?, ?, ?)`,
    [faq.question, faq.answer, faq.category, faq.isActive ?? true, faq.createdBy]
  );
  return result.insertId;
};

const updateFaq = async (id, faq) => {
  await db.query(
    `UPDATE faq_questions SET question = ?, answer = ?, category = ?, is_active = ? WHERE id = ?`,
    [faq.question, faq.answer, faq.category, faq.isActive, id]
  );
};

const deleteFaq = async (id) => {
  await db.query(`DELETE FROM faq_usage_log WHERE faq_question_id = ?`, [id]);
  await db.query(`DELETE FROM faq_questions WHERE id = ?`, [id]);
};

const logFaqUsage = async (faqQuestionId, studentId) => {
  const [result] = await db.query(
    `INSERT INTO faq_usage_log (faq_question_id, student_id) VALUES (?, ?)`,
    [faqQuestionId, studentId]
  );
  return result.insertId;
};

// ===== REPORT QUERIES =====

const getFaqUsageFrequency = async () => {
  const [rows] = await db.query(
    `SELECT fq.id, fq.question, fq.category, COUNT(ful.id) AS usage_count
     FROM faq_questions fq
     LEFT JOIN faq_usage_log ful ON ful.faq_question_id = fq.id
     GROUP BY fq.id, fq.question, fq.category
     ORDER BY usage_count DESC`
  );
  return rows;
};

const getFaqUsageByMonth = async () => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(ful.created_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM faq_usage_log ful
     GROUP BY month ORDER BY month`
  );
  return rows;
};

const getFaqUsageByCategory = async () => {
  const [rows] = await db.query(
    `SELECT fq.category, COUNT(ful.id) AS usage_count
     FROM faq_questions fq
     LEFT JOIN faq_usage_log ful ON ful.faq_question_id = fq.id
     GROUP BY fq.category
     ORDER BY usage_count DESC`
  );
  return rows;
};

const getFaqOverview = async () => {
  const [rows] = await db.query(
    `SELECT 
       (SELECT COUNT(*) FROM faq_questions) AS total_questions,
       (SELECT COUNT(*) FROM faq_questions WHERE is_active = TRUE) AS active_questions,
       (SELECT COUNT(*) FROM faq_usage_log) AS total_usage,
       (SELECT COUNT(DISTINCT student_id) FROM faq_usage_log) AS unique_students`
  );
  return rows[0];
};

const getFaqUsageDetails = async () => {
  const [rows] = await db.query(
    `SELECT fq.id, fq.question, fq.answer, fq.category, fq.is_active,
            COUNT(ful.id) AS usage_count,
            MAX(ful.created_at) AS last_used_at
     FROM faq_questions fq
     LEFT JOIN faq_usage_log ful ON ful.faq_question_id = fq.id
     GROUP BY fq.id, fq.question, fq.answer, fq.category, fq.is_active
     ORDER BY usage_count DESC`
  );
  return rows;
};

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  logFaqUsage,
  getFaqUsageFrequency,
  getFaqUsageByMonth,
  getFaqUsageByCategory,
  getFaqOverview,
  getFaqUsageDetails
};
