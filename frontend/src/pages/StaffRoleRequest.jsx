// src/pages/StaffRoleRequest.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as userApi from '../api/userApi';

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    icon: '⏳',
    label: 'Pending Review',
    message: 'Your request is being reviewed by an administrator. You will be notified once a decision is made.',
  },
  approved: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    icon: '✅',
    label: 'Approved',
    message: 'Your role elevation request has been approved.',
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: '❌',
    label: 'Rejected',
    message: 'Your previous request was rejected. You may submit a new request below.',
  },
};

const StaffRoleRequest = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [error, setError] = useState('');

  const [previousRequests, setPreviousRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const latestRequest = previousRequests.length > 0 ? previousRequests[0] : null;
  const canSubmit = !latestRequest || latestRequest.status === 'rejected';

  const loadMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await userApi.getMyRoleRequestsAPI();
      setPreviousRequests(data);
    } catch (err) {
      // silently fail
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadMyRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitStatus('submitting');
    try {
      await userApi.createRoleRequestAPI(user.id, message, attachment);
      setSubmitStatus('success');
      setMessage('');
      setAttachment(null);
      loadMyRequests();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit request');
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Request Role Elevation</h1>
        <p className="text-slate-500">Apply to become a Student Counselor.</p>
      </div>

      {/* Previous Request Status */}
      {loadingRequests ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-500 text-sm">Loading request history...</p>
        </div>
      ) : previousRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Request History</h2>
          {previousRequests.map((req) => {
            const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            return (
              <div key={req.id} className={`rounded-xl p-5 border shadow-sm ${config.bg} ${config.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
                    {config.icon} {config.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{config.message}</p>
                {req.message && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                    Your message: "{req.message.length > 100 ? req.message.slice(0, 100) + '...' : req.message}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Form — only if no pending/approved request */}
      {!loadingRequests && canSubmit && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          {submitStatus === 'success' ? (
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Request Submitted!</h2>
              <p className="text-green-600 dark:text-green-300 text-sm">Your request has been sent to the Admin for review.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">New Request</h2>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-slate-300">Why do you want to be a counselor?</label>
                  <textarea
                    required
                    rows="5"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Explain your qualifications and motivation..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-slate-300">Attach Certificate / CV</label>
                  <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-center cursor-pointer relative">
                    <input
                      type="file"
                      required
                      onChange={e => setAttachment(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {attachment ? (
                      <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                        <span>📎</span> {attachment.name}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm">Click to upload PDF or Image</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitStatus === 'submitting'}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {submitStatus === 'submitting' ? 'Sending Request...' : 'Submit Request'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Blocked message when pending or approved */}
      {!loadingRequests && !canSubmit && latestRequest && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {latestRequest.status === 'pending'
              ? 'You cannot submit a new request while your current request is under review.'
              : 'Your request has already been approved. No further action is needed.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffRoleRequest;