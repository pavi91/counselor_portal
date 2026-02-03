// src/pages/StudentTickets.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as ticketApi from '../api/ticketApi';
import * as userApi from '../api/userApi';

const StudentTickets = () => {
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ counselorId: '', subject: '', message: '', attachment: null });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const myTickets = await ticketApi.getStudentTicketsAPI(user.id);
      setTickets(myTickets);

      // Fetch only counselors using role-based filtering
      const counselorList = await userApi.getUsersByRoleAPI('counselor');
      setCounselors(counselorList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Pass the attachment to the API
      await ticketApi.createTicketAPI(
          user.id, 
          formData.counselorId, 
          formData.subject, 
          formData.message,
          formData.attachment
      );
      setIsModalOpen(false);
      setFormData({ counselorId: '', subject: '', message: '', attachment: null });
      loadData(); 
    } catch (err) {
      alert("Failed to create ticket");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Support Tickets</h1>
          <p className="text-slate-500">Contact a counselor for confidential assistance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
        >
          <span>+ New Ticket</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-slate-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
           <div className="p-12 text-center text-slate-500">
             <div className="text-4xl mb-2">💬</div>
             <p>No tickets found. Start a new conversation if you need help.</p>
           </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {tickets.map(ticket => {
                const lastMsg = ticket.messages[ticket.messages.length - 1];
                return (
                  <div key={ticket.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg dark:text-white text-blue-600">{ticket.subject}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                          ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">To: <span className="font-semibold dark:text-slate-300">{ticket.counselorName}</span> • {ticket.createdAt}</p>
                    
                    {/* Latest Message Preview */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm dark:text-slate-300 border dark:border-slate-700 flex justify-between items-center">
                      <span><span className="font-bold text-slate-600 dark:text-slate-400">Latest: </span> {lastMsg.text}</span>
                      {lastMsg.attachment && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded flex items-center gap-1">
                              📎 {lastMsg.attachment}
                          </span>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {/* --- CREATE TICKET MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Ticket</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Select Counselor</label>
                <select 
                  required 
                  value={formData.counselorId}
                  onChange={e => setFormData({...formData, counselorId: e.target.value})}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                >
                  <option value="">-- Choose a Counselor --</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Subject</label>
                <input 
                  type="text" required 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                  placeholder="e.g. Help with stress..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Message</label>
                <textarea 
                  required rows="4"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                  placeholder="Describe your issue..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Attachment (Optional)</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                />
                {formData.attachment && <p className="text-xs text-green-600 mt-1">Selected: {formData.attachment.name}</p>}
              </div>

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
                    disabled={sending} 
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                    {sending ? 'Sending...' : 'Send Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTickets;