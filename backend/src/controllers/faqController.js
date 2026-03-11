const faqService = require('../services/faqService');

const getAllFaqs = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const faqs = await faqService.getAllFaqs(includeInactive);
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

const getFaqById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const faq = await faqService.getFaqById(id);
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category } = req.body;
    const createdBy = req.user.id;
    const faq = await faqService.createFaq(question, answer, category, createdBy);
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

const updateFaq = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { question, answer, category, isActive } = req.body;
    const faq = await faqService.updateFaq(id, question, answer, category, isActive);
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

const deleteFaq = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await faqService.deleteFaq(id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const logFaqUsage = async (req, res, next) => {
  try {
    const faqQuestionId = parseInt(req.params.id, 10);
    const studentId = req.user.id;
    await faqService.logFaqUsage(faqQuestionId, studentId);
    res.json({ message: 'FAQ usage logged' });
  } catch (err) {
    next(err);
  }
};

const getFaqReport = async (req, res, next) => {
  try {
    const report = await faqService.getFaqReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
};

const exportFaqCsv = async (req, res, next) => {
  try {
    const data = await faqService.getFaqCsvData();

    const headers = ['ID', 'Question', 'Answer', 'Category', 'Active', 'Usage Count', 'Last Used'];
    const escapeCsv = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...data.map(r => [r.id, r.question, r.answer, r.category, r.is_active, r.usage_count, r.last_used_at].map(escapeCsv).join(','))
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="faq_report.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  logFaqUsage,
  getFaqReport,
  exportFaqCsv
};
