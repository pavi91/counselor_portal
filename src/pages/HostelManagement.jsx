// src/pages/HostelManagement.jsx
import { useState, useEffect } from 'react';
import * as hostelApi from '../api/hostelApi';
import * as userApi from '../api/userApi';
import * as applicationApi from '../api/applicationApi';
import { usePermissions } from '../hooks/usePermissions';

const HostelManagement = () => {
  const perms = usePermissions();
  
  // --- Data State ---
  const [hostelList, setHostelList] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('All');
  
  const [roomData, setRoomData] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Available pool for allocation
  const [students, setStudents] = useState([]); 
  const [allocations, setAllocations] = useState([]);
  const [applications, setApplications] = useState([]);
  
  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [success, setSuccess] = useState('');

  // Form State for creating a room
  const [newRoom, setNewRoom] = useState({ hostel: '', number: '', floor: '', capacity: '2', type: 'Double' });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload stats whenever selectedHostel changes
  useEffect(() => {
    if (hostelList.length > 0) {
        loadStats();
    }
  }, [selectedHostel]);

  const loadInitialData = async () => {
    try {
      // 1. Fetch all reference data in parallel
      const [hostels, allUsers, allApps, allAllocations] = await Promise.all([
          hostelApi.getHostelsAPI(),
          userApi.getUsersAPI(),
          applicationApi.getAllApplicationsAPI(),
          hostelApi.getAllAllocationsAPI()
      ]);

      setHostelList(hostels);
      if(hostels.length > 0) setSelectedHostel(hostels[0]);

      // Filter only students
      setStudents(allUsers.filter(u => u.role === 'student'));
      setApplications(allApps);
      setAllocations(allAllocations);

    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await hostelApi.getHostelStatsAPI(selectedHostel);
      setStats(data);
      setRoomData(data.roomStats);
      
      // Refresh allocations list to keep "Eligible" dropdown up to date
      const currentAllocations = await hostelApi.getAllAllocationsAPI();
      setAllocations(currentAllocations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logic for "Eligible Students":
   * 1. Must have role 'student'
   * 2. Must NOT be currently allocated to any room
   * 3. Must have an application status of 'approved'
   */
  const getEligibleStudents = () => {
    const allocatedUserIds = allocations.map(a => a.userId);
    const approvedUserIds = applications
        .filter(app => app.status === 'approved')
        .map(app => app.userId);

    return students.filter(s => 
        !allocatedUserIds.includes(s.id) && 
        approvedUserIds.includes(s.id)
    );
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
      loadStats(); // Refresh grid
    } catch (err) { 
        alert(err.message); 
    }
  };

  const handleDeallocate = async (userId) => {
    if(!window.confirm("Remove student from this room?")) return;
    try {
      await hostelApi.removeAllocationAPI(userId);
      setSuccess("Student removed successfully");
      setSelectedRoom(null);
      loadStats(); // Refresh grid
    } catch (err) { 
        alert(err.message); 
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await hostelApi.createRoomAPI(newRoom);
      setSuccess(`Room ${newRoom.number} added to ${newRoom.hostel}`);
      setShowAddRoomModal(false);
      setNewRoom({ hostel: selectedHostel, number: '', floor: '', capacity: '2', type: 'Double' });
      
      // If new hostel created, refresh list
      if (!hostelList.includes(newRoom.hostel)) {
          const updated = await hostelApi.getHostelsAPI();
          setHostelList(updated);
      }
      loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const floors = [...new Set(roomData.map(r => r.floor))].sort((a,b) => a - b);
  const eligibleStudents = getEligibleStudents();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Hostel Management</h1>
            <p className="text-slate-500">Manage room allocations and capacity</p>
        </div>
        
        <div className="flex gap-3">
             <select 
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="bg-white dark:bg-slate-800 border dark:border-slate-600 dark:text-white rounded-lg px-4 py-2 font-medium shadow-sm"
             >
                {hostelList.map(h => <option key={h} value={h}>{h}</option>)}
             </select>

            {/* Admin can create rooms */}
            {perms.canCreateRoom && (
                <button 
                    onClick={() => setShowAddRoomModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
                >
                    <span>+ Add Room</span>
                </button>
            )}
        </div>
      </div>

      {success && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative animate-fade-in">
              {success}
              <button onClick={() => setSuccess('')} className="absolute top-3 right-3 text-green-800 font-bold">&times;</button>
          </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Capacity" value={stats?.totalCapacity || 0} color="blue" />
        <StatCard label="Occupied Beds" value={stats?.occupiedBeds || 0} color="purple" />
        <StatCard label="Available Beds" value={stats?.availableBeds || 0} color="emerald" />
        <StatCard label="Occupancy Rate" value={`${Math.round((stats?.occupiedBeds/stats?.totalCapacity)*100 || 0)}%`} color="orange" />
      </div>

      {loading ? (
           <div className="p-12 text-center text-slate-500">Loading rooms...</div>
      ) : (
        <div className="space-y-8">
            {floors.length === 0 && <p className="text-center text-slate-500 py-8">No rooms found.</p>}
            
            {floors.map(floor => (
            <div key={floor} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-white border-b pb-2 dark:border-slate-600">
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
      )}

      {/* --- ALLOCATION MODAL --- */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold dark:text-white">Room {selectedRoom.number}</h3>
                        <span className="text-sm text-slate-500">{selectedRoom.hostel} • Floor {selectedRoom.floor} • {selectedRoom.type}</span>
                    </div>
                    <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                </div>

                {/* List Current Occupants */}
                <div className="mb-6">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Occupants ({selectedRoom.currentOccupancy}/{selectedRoom.capacity})
                    </h4>
                    <div className="space-y-2">
                        {selectedRoom.occupants.length === 0 && <p className="text-sm text-slate-400 italic">Room is empty.</p>}
                        {selectedRoom.occupants.map(occ => (
                            <div key={occ.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{occ.studentName}</p>
                                    <p className="text-xs text-slate-500">{occ.studentEmail}</p>
                                </div>
                                {/* STAFF/ADMIN can remove students */}
                                {perms.canManageTenants && (
                                    <button onClick={() => handleDeallocate(occ.userId)} className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded font-medium">Remove</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add New Student Form */}
                {perms.canManageTenants && !selectedRoom.isFull && (
                    <div className="border-t pt-4 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Allocate Student</h4>
                        <form onSubmit={handleAssign} className="flex flex-col gap-3">
                            <div className="text-xs text-slate-500">
                                Only students with <strong>Approved Applications</strong> who are not yet allocated will appear here.
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="flex-1 p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm"
                                    required
                                >
                                    <option value="">-- Select Eligible Student --</option>
                                    {eligibleStudents.length === 0 ? (
                                        <option disabled>No eligible students found</option>
                                    ) : (
                                        eligibleStudents.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                        ))
                                    )}
                                </select>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold">
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- ADD ROOM MODAL (Admin Only) --- */}
      {showAddRoomModal && perms.canCreateRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Add New Room</h3>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                    {/* Simplified for brevity - inputs for hostel, number, floor, capacity, type */}
                    <div>
                        <label className="block text-sm font-medium dark:text-slate-300 mb-1">Hostel</label>
                        <input required value={newRoom.hostel} onChange={e => setNewRoom({...newRoom, hostel: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" list="hostelSuggestions" />
                        <datalist id="hostelSuggestions">{hostelList.map(h => <option key={h} value={h} />)}</datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Number</label>
                            <input required value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-slate-300 mb-1">Floor</label>
                            <input type="number" required value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium dark:text-slate-300 mb-1">Capacity</label>
                             <select value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium dark:text-slate-300 mb-1">Type</label>
                             <select value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                                <option value="Single">Single</option><option value="Double">Double</option><option value="Triple">Triple</option><option value="Dorm">Dorm</option>
                             </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowAddRoomModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Create Room</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-${color}-500 flex flex-col`}>
        <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">{label}</span>
        <span className="text-2xl font-bold dark:text-white mt-1">{value}</span>
    </div>
);

const RoomCard = ({ room, onClick }) => (
    <div onClick={onClick} className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${room.isFull ? 'border-red-100 bg-red-50/30 hover:border-red-300' : 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-300'}`}>
        <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{room.number}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${room.isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{room.currentOccupancy}/{room.capacity}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div className={`h-2 rounded-full ${room.isFull ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}></div>
        </div>
        <p className="text-xs text-slate-500">{room.type} • {room.availableSlots} slots left</p>
    </div>
);

export default HostelManagement;