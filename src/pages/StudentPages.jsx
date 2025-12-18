import { useState, useEffect } from 'react';
import { studentService } from '../services/mockApi';

// --- Hostel Registration ---
export function HostelRegistration() {
  const [formData, setFormData] = useState({ name: '', regNo: '', allergies: '', roomId: '' });
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [availableFloors, setAvailableFloors] = useState([]);

  useEffect(() => {
    // 1. Fetch Profile
    studentService.getProfile().then(profile => {
      setFormData(prev => ({ ...prev, name: profile.name, regNo: profile.regNo }));
    });

    // 2. Fetch Rooms & Calculate Floors
    studentService.getAvailableRooms().then(data => {
      setRooms(data);
      // Extract unique floors and sort them
      const floors = [...new Set(data.map(r => r.floor))].sort((a, b) => a - b);
      setAvailableFloors(floors);
      if (floors.length > 0) setSelectedFloor(floors[0]);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.roomId) {
      alert("Please select a room first!");
      return;
    }
    studentService.registerHostel(formData);
    alert(`Success! Registered for Room ${formData.roomId}.`);
  };

  // Filter rooms based on the selected floor
  const displayedRooms = rooms.filter(room => room.floor === selectedFloor);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-slate-800">Hostel Booking</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Registration Form */}
        <div className="lg:col-span-4 h-fit sticky top-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
            <h3 className="font-bold text-xl mb-4 text-slate-700">Student Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" value={formData.name} disabled className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-medium" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration No</label>
                <input type="text" value={formData.regNo} disabled className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medical / Allergies</label>
                <textarea 
                  className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                  rows="3"
                  placeholder="Any specific needs?"
                  value={formData.allergies}
                  onChange={e => setFormData({...formData, allergies: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Selected Room</div>
              {formData.roomId ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                  <span className="font-bold text-lg">Room {formData.roomId}</span>
                  <button type="button" onClick={() => setFormData({...formData, roomId: ''})} className="text-xs font-semibold text-red-500 hover:text-red-700">CHANGE</button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-sm italic text-center">
                  No room selected
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={!formData.roomId}
              className={`w-full mt-6 py-3 rounded-lg font-bold text-white shadow-md transition-all ${formData.roomId ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              Confirm Booking
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Room Selection */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-slate-700">Select Room</h3>
              
              {/* Floor Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {availableFloors.map(floor => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      selectedFloor === floor 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedRooms.map(room => {
                const isFull = room.filled >= room.capacity;
                const isSelected = formData.roomId === room.id;
                const occupancyPct = (room.filled / room.capacity) * 100;

                return (
                  <div 
                    key={room.id}
                    onClick={() => !isFull && setFormData({...formData, roomId: room.id})}
                    className={`relative p-4 border-2 rounded-xl transition-all ${
                      isFull 
                        ? 'bg-slate-50 border-slate-100 opacity-70 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 cursor-pointer shadow-md'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-lg font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                          {room.id}
                        </span>
                        <div className="text-xs text-slate-500 font-medium">{room.type}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {isFull ? 'Full' : 'Open'}
                      </span>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>Occupancy</span>
                        <span>{room.filled} / {room.capacity}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isFull ? 'bg-red-400' : 'bg-blue-500'}`} 
                          style={{ width: `${occupancyPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* People Icons (Visual Sugar) */}
                    <div className="flex gap-1 mt-3">
                      {[...Array(room.capacity)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-2 w-2 rounded-full ${i < room.filled ? (isFull ? 'bg-red-300' : 'bg-blue-300') : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

            {displayedRooms.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No rooms available on this floor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Counseling Selection & Chat (Unchanged) ---
export function Counseling() {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    studentService.getCounselors().then(setCounselors);
  }, []);

  const sendMessage = () => {
    if(!input) return;
    setMessages([...messages, { text: input, sender: 'me' }]);
    setInput("");
    // Mock Auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Hello! Please upload your MCQ answers CSV if requested.", sender: 'counselor' }]);
    }, 1000);
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex gap-4">
      {/* List */}
      <div className="w-1/3 bg-white p-4 rounded shadow overflow-y-auto">
        <h3 className="font-bold mb-4">Select Counselor</h3>
        {counselors.map(c => (
          <div 
            key={c.id} 
            onClick={() => setSelectedCounselor(c)}
            className={`p-3 mb-2 border rounded cursor-pointer hover:bg-blue-50 ${selectedCounselor?.id === c.id ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-gray-500">{c.specialty}</div>
            <span className={`text-xs px-2 py-0.5 rounded ${c.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {c.available ? 'Available' : 'Busy'}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 bg-white p-4 rounded shadow flex flex-col">
        {selectedCounselor ? (
          <>
            <div className="border-b pb-2 mb-2 font-bold flex justify-between">
              <span>Chatting with {selectedCounselor.name}</span>
              <button className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Start MCQ Test</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded">
              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded max-w-[70%] ${m.sender === 'me' ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-gray-200 text-gray-800'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 p-2 border rounded" 
                placeholder="Type a message..." 
              />
              <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded">Send</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a counselor to start</div>
        )}
      </div>
    </div>
  );
}