// src/pages/AdminRoleRequests.jsx
import { useState, useEffect } from 'react';
import * as userApi from '../api/userApi';

const AdminRoleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await userApi.getRoleRequestsAPI();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      await userApi.processRoleRequestAPI(id, action);
      loadRequests();
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Role Elevation Requests</h1>
        <p className="text-slate-500">Review staff requests to become counselors.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No requests found.</div>
        ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {requests.map(req => (
                    <div key={req.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{req.userName}</h3>
                                <p className="text-xs text-slate-500">Submitted on: {req.createdAt}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                  req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                  'bg-yellow-100 text-yellow-700'}`}>
                                {req.status}
                            </span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-4 text-sm text-slate-700 dark:text-slate-300">
                            {req.message}
                        </div>

                        {req.attachment && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 w-max px-3 py-1.5 rounded">
                                <span>📎</span>
                                <span className="font-mono">{req.attachment}</span>
                            </div>
                        )}

                        {req.status === 'pending' && (
                            <div className="flex gap-3 mt-4">
                                <button 
                                    onClick={() => handleProcess(req.id, 'approved')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded shadow-sm"
                                >
                                    Approve & Elevate Role
                                </button>
                                <button 
                                    onClick={() => handleProcess(req.id, 'rejected')}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoleRequests;