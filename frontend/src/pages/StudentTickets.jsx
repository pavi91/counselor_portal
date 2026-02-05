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
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Modal State for creating new ticket
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ counselorId: '', subject: '', message: '', attachment: null });
  const [sending, setSending] = useState(false);
  
  // Reply State
  const [replyText, setReplyText] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null);
  const [replySending, setReplySending] = useState(false);

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

  const handleReplyFileChange = (e) => {
    if (e.target.files[0]) {
      setReplyAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !replyAttachment) return;
    
    setReplySending(true);
    try {
      await ticketApi.replyToTicketAPI(selectedTicket.id, user.id, replyText, replyAttachment);
      setReplyText('');
      setReplyAttachment(null);
      
      // Refresh tickets
      const updatedTickets = await ticketApi.getStudentTicketsAPI(user.id);
      setTickets(updatedTickets);
      
      // Update selected ticket with new data
      setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id));
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6 text-center text-slate-500">Loading tickets...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANE: TICKETS LIST */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
            <h2 className="font-bold text-slate-800 dark:text-white">Tickets</h2>
          </div>
          {tickets.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              <p>No tickets yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition
                    ${selectedTicket?.id === ticket.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500 border-l-4' 
                      : 'border-l-transparent'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-slate-800 dark:text-white truncate">{ticket.subject}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded
                      ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">With: {ticket.counselorName}</p>
                  <p className="text-xs text-slate-400">{ticket.createdAt}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANE: CONVERSATION */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <h2 className="text-xl font-bold dark:text-white">{selectedTicket.subject}</h2>
                <p className="text-sm text-slate-500">With Counselor: {selectedTicket.counselorName}</p>
                <p className="text-xs text-slate-400 mt-1">Started: {selectedTicket.createdAt}</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-slate-100 dark:bg-slate-700 dark:text-white rounded-bl-none'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          {msg.attachment && (
                            <a 
                              href={`http://localhost:5000${msg.attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 p-2 rounded text-xs flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isMe ? 'bg-blue-700 hover:bg-blue-800' : 'bg-white dark:bg-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500'}`}
                            >
                              <span className="text-lg">📎</span>
                              <span className="font-mono truncate max-w-[150px]">{msg.attachment.split('/').pop()}</span>
                            </a>
                          )}
                          <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p>No messages yet</p>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <form onSubmit={handleReply} className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm resize-none"
                    rows="3"
                  ></textarea>
                  
                  <div className="flex gap-2">
                    <input 
                      type="file"
                      onChange={handleReplyFileChange}
                      className="flex-1 text-sm text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                    />
                    <button
                      type="submit"
                      disabled={(!replyText.trim() && !replyAttachment) || replySending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded font-medium text-sm transition"
                    >
                      {replySending ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                  
                  {replyAttachment && (
                    <p className="text-xs text-green-600">Selected: {replyAttachment.name}</p>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>Select a ticket to view details and reply</p>
            </div>
          )}
        </div>
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