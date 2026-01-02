// src/pages/ApplicationReview.jsx
import { useState, useEffect } from 'react';
import * as applicationApi from '../api/applicationApi';

const ApplicationReview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getAllApplicationsAPI();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationApi.updateApplicationStatusAPI(id, newStatus);
      loadApps(); 
      if (selectedApp && selectedApp.id === id) {
          setSelectedApp(prev => ({...prev, status: newStatus}));
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Application Management</h1>
          <p className="text-slate-500">Review student eligibility based on points.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Rank</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Student</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Points</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Key Info (Dist / Income)</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center">Loading applications...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No applications found.</td></tr>
              ) : applications.map((app, index) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-mono text-slate-400">#{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold dark:text-white">{app.studentName}</div>
                    <div className="text-xs text-slate-500">{app.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                      {app.points}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {app.distance}km / {app.incomeRange.replace('_', '-')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${app.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setSelectedApp(app)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition">
                        View
                    </button>
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusChange(app.id, 'approved')} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition">Approve</button>
                        <button onClick={() => handleStatusChange(app.id, 'rejected')} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded transition">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
                
                <div className="mb-4 border-b pb-4 dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">{selectedApp.studentName}</h2>
                        <p className="text-slate-500 text-sm">{selectedApp.studentEmail}</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-bold text-blue-600">{selectedApp.points}</span>
                        <span className="text-xs uppercase font-bold text-slate-400">Total Score</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Block 1 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2">Academic & Personal</h3>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Gender:</span> {selectedApp.gender}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Year:</span> {selectedApp.year}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Distance:</span> {selectedApp.distance} km</p>
                    </div>
                     {/* Block 2 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2">Financial</h3>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Income:</span> {selectedApp.incomeRange}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Mahapola:</span> {selectedApp.isMahapolaRecipient}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Samurdhi:</span> {selectedApp.isSamurdhiRecipient}</p>
                    </div>
                     {/* Block 3 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2">Family</h3>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Siblings (School):</span> {selectedApp.siblingsSchool}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Siblings (Uni):</span> {selectedApp.siblingsUni}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Parent Disability:</span> {selectedApp.parentDisability}</p>
                    </div>
                     {/* Block 4 */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2">Extra Curricular & Hostel</h3>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Captain:</span> {selectedApp.isCaptain}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Member:</span> {selectedApp.isMember}</p>
                        <p className="text-sm dark:text-slate-300"><span className="font-semibold">Colours:</span> {selectedApp.hasColours}</p>
                        <div className="mt-2 pt-2 border-t dark:border-slate-700">
                             <p className="text-sm font-bold text-blue-600">Pref: {selectedApp.hostelPref}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setSelectedApp(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition">Close</button>
                    {selectedApp.status === 'pending' && (
                        <>
                            <button onClick={() => handleStatusChange(selectedApp.id, 'approved')} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">Approve</button>
                            <button onClick={() => handleStatusChange(selectedApp.id, 'rejected')} className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition">Reject</button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationReview;