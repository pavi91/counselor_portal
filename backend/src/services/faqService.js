const faqRepository = require('../repositories/faqRepository');
const { encryptTicketMessage, decryptTicketMessage } = require('../utils/ticketEncryption');

const decryptFaq = (faq) => ({
  ...faq,
  question: decryptTicketMessage(faq.question),
  answer: decryptTicketMessage(faq.answer)
});

const getAllFaqs = async (includeInactive = false) => {
  const faqs = await faqRepository.getAllFaqs(includeInactive);
  return faqs.map(decryptFaq);
};

const getFaqById = async (id) => {
  const faq = await faqRepository.getFaqById(id);
  if (!faq) {
    const err = new Error('FAQ not found');
    err.status = 404;
    throw err;
  }
  return decryptFaq(faq);
};

const createFaq = async (question, answer, category, createdBy) => {
  const encryptedQuestion = encryptTicketMessage(question);
  const encryptedAnswer = encryptTicketMessage(answer);
  const id = await faqRepository.createFaq({
    question: encryptedQuestion,
    answer: encryptedAnswer,
    category,
    createdBy
  });
  return getFaqById(id);
};

const updateFaq = async (id, question, answer, category, isActive) => {
  const existing = await faqRepository.getFaqById(id);
  if (!existing) {
    const err = new Error('FAQ not found');
    err.status = 404;
    throw err;
  }
  const encryptedQuestion = encryptTicketMessage(question);
  const encryptedAnswer = encryptTicketMessage(answer);
  await faqRepository.updateFaq(id, {
    question: encryptedQuestion,
    answer: encryptedAnswer,
    category,
    isActive
  });
  return getFaqById(id);
};

const deleteFaq = async (id) => {
  const existing = await faqRepository.getFaqById(id);
  if (!existing) {
    const err = new Error('FAQ not found');
    err.status = 404;
    throw err;
  }
  await faqRepository.deleteFaq(id);
};

const logFaqUsage = async (faqQuestionId, studentId) => {
  const faq = await faqRepository.getFaqById(faqQuestionId);
  if (!faq) {
    const err = new Error('FAQ not found');
    err.status = 404;
    throw err;
  }
  await faqRepository.logFaqUsage(faqQuestionId, studentId);
};

const getFaqReport = async () => {
  const [overview, usageFrequency, usageByMonth, usageByCategory, usageDetails] = await Promise.all([
    faqRepository.getFaqOverview(),
    faqRepository.getFaqUsageFrequency(),
    faqRepository.getFaqUsageByMonth(),
    faqRepository.getFaqUsageByCategory(),
    faqRepository.getFaqUsageDetails()
  ]);

  // Decrypt question/answer fields in report data
  const decryptedFrequency = usageFrequency.map(r => ({
    ...r,
    question: decryptTicketMessage(r.question)
  }));

  const decryptedDetails = usageDetails.map(r => ({
    ...r,
    question: decryptTicketMessage(r.question),
    answer: decryptTicketMessage(r.answer)
  }));

  return {
    overview,
    usageFrequency: decryptedFrequency,
    usageByMonth,
    usageByCategory,
    usageDetails: decryptedDetails
  };
};

const getFaqCsvData = async () => {
  const usageDetails = await faqRepository.getFaqUsageDetails();
  return usageDetails.map(r => ({
    id: r.id,
    question: decryptTicketMessage(r.question),
    answer: decryptTicketMessage(r.answer),
    category: r.category,
    is_active: r.is_active ? 'Yes' : 'No',
    usage_count: r.usage_count,
    last_used_at: r.last_used_at || 'Never'
  }));
};

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  logFaqUsage,
  getFaqReport,
  getFaqCsvData
};
