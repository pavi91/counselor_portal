// src/pages/StaffRoleRequest.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as userApi from '../api/userApi';

const StaffRoleRequest = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await userApi.createRoleRequestAPI(user.id, message, attachment);
      setStatus('success');
      setMessage('');
      setAttachment(null);
    } catch (err) {
      alert(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-green-50 rounded-xl border border-green-200 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Request Submitted!</h2>
        <p className="text-green-600">Your request to become a Counselor has been sent to the Admin. You will be notified once it is reviewed.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-sm font-bold text-green-800 hover:underline">Submit another request</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Request Role Elevation</h1>
        <p className="text-slate-500">Apply to become a Student Counselor.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
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
            disabled={status === 'submitting'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending Request...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffRoleRequest;