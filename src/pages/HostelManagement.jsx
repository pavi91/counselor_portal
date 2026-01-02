// src/pages/HostelManagement.jsx
import { useState, useEffect } from 'react';
import * as hostelApi from '../api/hostelApi';
import * as userApi from '../api/userApi';
import { usePermissions } from '../hooks/usePermissions';

const HostelManagement = () => {
  const perms = usePermissions();
  
  // Data State
  const [roomData, setRoomData] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null); // For allocation modal
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false); // For Add Room modal
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Room Form State
  const [newRoom, setNewRoom] = useState({ number: '', floor: '', capacity: '2', type: 'Double' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await hostelApi.getHostelStatsAPI();
      setStats(data);
      setRoomData(data.roomStats);

      const allUsers = await userApi.getUsersAPI();
      const studentList = allUsers.filter(u => u.role === 'student');
      setStudents(studentList);
    } catch (err) {
      setError("Failed to load hostel data");
    } finally {
      setLoading(false);
    }
  };

  const getUnallocatedStudents = () => {
    const assignedIds = roomData.flatMap(r => r.occupants.map(o => o.userId));
    return students.filter(s => !assignedIds.includes(s.id));
  };

  // --- HANDLERS ---

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    try {
      await hostelApi.assignRoomAPI(selectedStudentId, selectedRoom.id);
      setSuccess(`Student allocated to Room ${selectedRoom.number}`);
      setSelectedStudentId('');
      setSelectedRoom(null);
      loadData();
    } catch (err) { alert(err.message); }
  };

  const handleDeallocate = async (userId) => {
    if(!window.confirm("Remove student from this room?")) return;
    try {
      await hostelApi.removeAllocationAPI(userId);
      setSuccess("Student removed successfully");
      setSelectedRoom(null);
      loadData();
    } catch (err) { alert(err.message); }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await hostelApi.createRoomAPI(newRoom);
      setSuccess(`Room ${newRoom.number} added to Floor ${newRoom.floor}`);
      setShowAddRoomModal(false);
      setNewRoom({ number: '', floor: '', capacity: '2', type: 'Double' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Get unique floors and sort them
  const floors = [...new Set(roomData.map(r => r.floor))].sort((a,b) => a - b);

  if (loading) return <div className="p-8 text-center">Loading Hostel Data...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Hostel Management</h1>
            <p className="text-slate-500">Manage room allocations and capacity</p>
        </div>
        
        {/* Only Admin can see this button */}
        {perms.canCreateRoom && (
            <button 
                onClick={() => setShowAddRoomModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
            >
                <span>+ Add Room</span>
            </button>
        )}
      </div>

      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded animate-fade-out">{success}</div>}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Capacity" value={stats?.totalCapacity} color="blue" />
        <StatCard label="Occupied Beds" value={stats?.occupiedBeds} color="purple" />
        <StatCard label="Available Beds" value={stats?.availableBeds} color="emerald" />
        <StatCard label="Occupancy Rate" value={`${Math.round((stats?.occupiedBeds/stats?.totalCapacity)*100 || 0)}%`} color="orange" />
      </div>

      {/* Room Grid by Floor */}
      <div className="space-y-8">
        {floors.map(floor => (
          <div key={floor} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-white border-b pb-2 dark:border-slate-600 flex items-center gap-2">
                Floor {floor}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roomData.filter(r => r.floor === floor).map(room => (
                    <RoomCard 
                        key={room.id} 
                        room={room} 
                        onClick={() => setSelectedRoom(room)} 
                    />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL 1: ALLOCATION MANAGER --- */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold dark:text-white">Room {selectedRoom.number}</h3>
                        <span className="text-sm text-slate-500">Floor {selectedRoom.floor} • {selectedRoom.type}</span>
                    </div>
                    <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Occupants ({selectedRoom.currentOccupancy}/{selectedRoom.capacity})</h4>
                    <div className="space-y-2">
                        {selectedRoom.occupants.length === 0 && <p className="text-sm text-slate-400 italic">Room is empty.</p>}
                        {selectedRoom.occupants.map(occ => (
                            <div key={occ.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{occ.studentName}</p>
                                    <p className="text-xs text-slate-500">{occ.studentEmail}</p>
                                </div>
                                {perms.canManageHostel && (
                                    <button onClick={() => handleDeallocate(occ.userId)} className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded">Remove</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {perms.canManageHostel && !selectedRoom.isFull && (
                    <div className="border-t pt-4 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Allocate Student</h4>
                        <form onSubmit={handleAssign} className="flex gap-2">
                            <select 
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="flex-1 p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm"
                                required
                            >
                                <option value="">Select a student...</option>
                                {getUnallocatedStudents().map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                ))}
                            </select>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">Assign</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- MODAL 2: ADD ROOM (ADMIN ONLY) --- */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Add New Room</h3>
                
                <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                        <input 
                            type="text" required placeholder="e.g. 301"
                            value={newRoom.number}
                            onChange={e => setNewRoom({...newRoom, number: e.target.value})}
                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Floor Number</label>
                        <input 
                            type="number" required placeholder="e.g. 3"
                            value={newRoom.floor}
                            onChange={e => setNewRoom({...newRoom, floor: e.target.value})}
                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">Entering a new floor number will automatically create a new floor section.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                            <select 
                                value={newRoom.capacity}
                                onChange={e => setNewRoom({...newRoom, capacity: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            >
                                <option value="1">1 Person</option>
                                <option value="2">2 People</option>
                                <option value="3">3 People</option>
                                <option value="4">4 People</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select 
                                value={newRoom.type}
                                onChange={e => setNewRoom({...newRoom, type: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                            >
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Triple">Triple</option>
                                <option value="Dorm">Dorm</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setShowAddRoomModal(false)}
                            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                        >
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, color }) => (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-${color}-500 flex flex-col`}>
        <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">{label}</span>
        <span className="text-2xl font-bold dark:text-white mt-1">{value}</span>
    </div>
);

const RoomCard = ({ room, onClick }) => (
    <div 
        onClick={onClick}
        className={`
            relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
            ${room.isFull 
                ? 'border-red-100 bg-red-50/30 hover:border-red-300' 
                : 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-300'}
        `}
    >
        <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{room.number}</span>
            <span className={`
                text-xs font-bold px-2 py-1 rounded-full
                ${room.isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
            `}>
                {room.currentOccupancy}/{room.capacity}
            </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div 
                className={`h-2 rounded-full ${room.isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
            ></div>
        </div>
        <p className="text-xs text-slate-500">{room.type} • {room.availableSlots} slots left</p>
    </div>
);

export default HostelManagement;