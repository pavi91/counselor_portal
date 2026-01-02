// src/pages/UserManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions'; // NEW Hook
import * as userApi from '../api/userApi';
import * as hostelApi from '../api/hostelApi';
import UserList from '../components/UserList';

const UserManagement = () => {
  const { user } = useAuth();
  const perms = usePermissions(); // Get permissions for current user

  // Data State
  const [users, setUsers] = useState([]);
  const [hostelStats, setHostelStats] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHostelData, setStudentHostelData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises = [userApi.getUsersAPI()];
      
      // Only fetch hostel stats if permission allows
      if (perms.canViewHostelStats) {
        promises.push(hostelApi.getHostelStatsAPI());
      }

      const [usersData, statsData] = await Promise.all(promises);
      setUsers(usersData);
      if (statsData) setHostelStats(statsData);

    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try {
      await userApi.createUserAPI(formData);
      setSuccessMsg(`User ${formData.name} added successfully!`);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      loadData();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try { 
      await userApi.deleteUserAPI(id); 
      loadData(); 
    } catch (err) { setError("Failed to delete user"); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userApi.updateUserRoleAPI(userId, newRole);
      setSuccessMsg("User role updated.");
      loadData();
    } catch (err) { setError("Failed to update role"); }
  };

  const handleViewHostel = async (targetUser) => {
    setSelectedStudent(targetUser);
    setStudentHostelData(null);
    try {
      const data = await hostelApi.getStudentHostelDetailsAPI(targetUser.id);
      setStudentHostelData(data);
    } catch (e) { console.error(e); }
  };

  // CSV Logic
  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,email,password,role,name\nstudent@example.com,123,student,John Doe";
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "template.csv";
    link.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const lines = evt.target.result.split('\n');
            const newUsers = [];
             // Simple parsing logic
            for (let i = 1; i < lines.length; i++) {
                const [email, pass, role, name] = lines[i].split(',');
                if(email && pass) newUsers.push({email, password: pass, role: role || 'student', name});
            }
            if(newUsers.length > 0) {
                await userApi.bulkCreateUsersAPI(newUsers);
                setSuccessMsg(`Imported ${newUsers.length} users`);
                loadData();
            }
        } catch(e) { setError("CSV Error"); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Management Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Welcome back, {user?.name} ({user?.role})
            </p>
        </div>
      </div>

      {/* 2. Hostel Stats Row (CONDITIONAL) */}
      {perms.canViewHostelStats && hostelStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Total Capacity</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{hostelStats.totalCapacity}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">🛏️</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Available Beds</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{hostelStats.availableBeds}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">✅</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Occupancy Rate</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round((hostelStats.occupiedBeds / hostelStats.totalCapacity) * 100)}%
                </p>
            </div>
            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">📊</div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>}
      {successMsg && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">{successMsg}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Tools (Create / Upload) */}
        <div className="space-y-6">
          
          {/* Add User Form (CONDITIONAL) */}
          {perms.canCreateUser && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Add New User</h2>
                <form onSubmit={handleAddUser} className="space-y-4">
                <input name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required className="w-full p-2.5 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="w-full p-2.5 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required className="w-full p-2.5 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-2.5 rounded-lg border dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                    <option value="student">Student</option>
                    <option value="counselor">Counselor</option>
                    <option value="staff">Staff</option>
                    {perms.canUpdateRole && <option value="admin">Admin</option>}
                </select>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition">Create User</button>
                </form>
            </div>
          )}

          {/* Bulk Upload (CONDITIONAL) */}
          {perms.canBulkUpload && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Bulk Import</h2>
                    <button onClick={downloadCsvTemplate} className="text-xs text-blue-500 hover:underline">Template</button>
                </div>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: User List */}
        <div className="xl:col-span-2">
            <UserList 
                users={users} 
                loading={loading}
                // Pass functions ONLY if the user has specific permission
                onDelete={perms.canDeleteUser ? handleDelete : null}
                onRoleChange={perms.canUpdateRole ? handleRoleChange : null}
                onViewHostel={perms.canViewHostelDetails ? handleViewHostel : null}
            />
        </div>

      </div>

      {/* Hostel Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">&times;</button>
            
            <h3 className="text-xl font-bold mb-4 dark:text-white">Hostel Details</h3>
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="font-bold dark:text-white">{selectedStudent.name}</p>
                <p className="text-sm text-slate-500">{selectedStudent.email}</p>
            </div>

            {studentHostelData ? (
                <div className="space-y-3">
                    <div className="flex justify-between p-3 border rounded dark:border-slate-700">
                        <span className="text-slate-500">Room</span>
                        <span className="font-bold dark:text-white">{studentHostelData.roomNumber} (Floor {studentHostelData.floor})</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded dark:border-slate-700">
                        <span className="text-slate-500">Start Date</span>
                        <span className="font-medium dark:text-white">{studentHostelData.startDate}</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded dark:border-slate-700">
                        <span className="text-slate-500">End Date</span>
                        <span className="font-medium dark:text-white">{studentHostelData.endDate}</span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-slate-500">
                    No hostel allocation found.
                </div>
            )}
            
            <button onClick={() => setSelectedStudent(null)} className="w-full mt-6 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white py-2 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;