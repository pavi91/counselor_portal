import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as faqApi from '../api/faqApi';

const CATEGORIES = [
  'Academic',
  'Mental Health',
  'Hostel',
  'Financial Aid',
  'Career Guidance',
  'Personal',
  'General'
];

const FAQManagement = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: '', isActive: true });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await faqApi.getAllFaqsAPI(true);
      setFaqs(data);
    } catch (e) {
      console.error('Failed to load FAQs:', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '', category: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.is_active === 1 || faq.is_active === true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingFaq) {
        await faqApi.updateFaqAPI(editingFaq.id, formData.question, formData.answer, formData.category, formData.isActive);
      } else {
        await faqApi.createFaqAPI(formData.question, formData.answer, formData.category);
      }
      setIsModalOpen(false);
      loadFaqs();
    } catch (err) {
      alert(editingFaq ? 'Failed to update FAQ' : 'Failed to create FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await faqApi.deleteFaqAPI(deleteId);
      setDeleteId(null);
      loadFaqs();
    } catch (err) {
      alert('Failed to delete FAQ');
    }
  };

  const filtered = filterCategory
    ? faqs.filter(f => f.category === filterCategory)
    : faqs;

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6 text-center text-slate-500">Loading FAQs...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">FAQ Management</h1>
          <p className="text-slate-500">Manage frequently asked questions for students.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
        >
          <span>+ New FAQ</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            !filterCategory ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All ({faqs.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = faqs.filter(f => f.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* FAQ List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 text-lg">No FAQs found. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(faq => (
            <div
              key={faq.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${
                !(faq.is_active === 1 || faq.is_active === true) ? 'opacity-60' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {faq.category}
                      </span>
                      {!(faq.is_active === 1 || faq.is_active === true) && (
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{faq.question}</h3>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(faq)}
                      className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(faq.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{faq.answer}</p>
                <div className="mt-3 text-xs text-slate-400">
                  Created by {faq.creator_name} &middot; {new Date(faq.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Question</label>
                <textarea
                  required
                  rows="3"
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                  placeholder="e.g. How do I apply for a hostel room?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Answer</label>
                <textarea
                  required
                  rows="4"
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                  placeholder="Provide a detailed answer..."
                />
              </div>

              {editingFaq && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm dark:text-slate-300">Active (visible to students)</label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  {saving ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Delete FAQ?</h2>
            <p className="text-slate-500 mb-6">This action cannot be undone. All usage data for this FAQ will also be deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQManagement;
