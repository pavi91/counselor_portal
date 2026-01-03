// src/pages/CounselorTickets.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as ticketApi from '../api/ticketApi';

const CounselorTickets = () => {
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getCounselorTicketsAPI(user.id);
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await ticketApi.replyToTicketAPI(selectedTicket.id, user.id, replyText);
      setReplyText('');
      
      // Refresh data
      const updatedTickets = await ticketApi.getCounselorTicketsAPI(user.id);
      setTickets(updatedTickets);
      
      // Keep current ticket selected with new data
      setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id));
    } catch (e) {
      alert("Failed to send reply");
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = selectedTicket.status === 'open' ? 'closed' : 'open';
      await ticketApi.updateTicketStatusAPI(selectedTicket.id, newStatus);
      
      const updatedTickets = await ticketApi.getCounselorTicketsAPI(user.id);
      setTickets(updatedTickets);
      setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id));
    } catch (e) { 
        alert("Failed to update status"); 
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
      
      {/* LEFT PANE: TICKET LIST */}
      <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h2 className="font-bold text-slate-700 dark:text-white">Assigned Tickets</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
           {loading ? <p className="p-4 text-center">Loading...</p> : tickets.length === 0 ? <p className="p-4 text-center text-slate-500">No tickets found.</p> : tickets.map(ticket => (
             <div 
               key={ticket.id}
               onClick={() => setSelectedTicket(ticket)}
               className={`p-4 border-b dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition
                 ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}
               `}
             >
               <div className="flex justify-between mb-1">
                 <span className="font-semibold text-slate-800 dark:text-white truncate pr-2">{ticket.studentName}</span>
                 <span className="text-xs text-slate-500">{ticket.createdAt}</span>
               </div>
               <p className="font-medium text-sm text-blue-600 dark:text-blue-400 truncate">{ticket.subject}</p>
               <p className="text-xs text-slate-500 mt-1 truncate">{ticket.messages[ticket.messages.length - 1].text}</p>
               {ticket.status === 'closed' && <span className="inline-block mt-2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">Closed</span>}
             </div>
           ))}
        </div>
      </div>

      {/* RIGHT PANE: CONVERSATION */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
               <div>
                  <h2 className="text-xl font-bold dark:text-white">{selectedTicket.subject}</h2>
                  <p className="text-sm text-slate-500">Student: {selectedTicket.studentName}</p>
               </div>
               <button 
                  onClick={toggleStatus}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition
                    ${selectedTicket.status === 'open' 
                       ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                       : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
               >
                  {selectedTicket.status === 'open' ? 'Mark Closed' : 'Reopen Ticket'}
               </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket.messages.map((msg, idx) => {
                 const isMe = msg.senderId === user.id;
                 return (
                   <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-100 dark:bg-slate-700 dark:text-white rounded-bl-none'
                      }`}>
                         <p className="text-sm">{msg.text}</p>
                         <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {msg.timestamp}
                         </p>
                      </div>
                   </div>
                 );
              })}
            </div>

            {/* Reply Area */}
            <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
               <form onSubmit={handleReply} className="flex gap-2">
                 <input 
                   type="text" 
                   value={replyText}
                   onChange={e => setReplyText(e.target.value)}
                   disabled={selectedTicket.status === 'closed'}
                   placeholder={selectedTicket.status === 'closed' ? 'This ticket is closed.' : 'Type a reply...'}
                   className="flex-1 p-2.5 rounded-lg border dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-200 disabled:text-slate-500"
                 />
                 <button 
                    type="submit" 
                    disabled={selectedTicket.status === 'closed' || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-bold transition"
                 >
                    Send
                 </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="text-4xl mb-4">📨</div>
            <p>Select a ticket from the left to view the conversation.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CounselorTickets;