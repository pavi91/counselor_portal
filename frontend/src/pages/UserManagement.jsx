// src/pages/UserManagement.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import * as userApi from '../api/userApi';
import * as hostelApi from '../api/hostelApi';
import UserList from '../components/UserList';

const UserManagement = () => {
  const { user } = useAuth();
  const perms = usePermissions();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHostelData, setStudentHostelData] = useState(null);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'student',
    indexNumber: '', fullName: '', nameWithInitials: '', 
    permanentAddress: '', residentPhone: '', mobilePhone: '', gender: 'male'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises = [userApi.getUsersAPI()];
      if (perms.canViewHostelStats) {
        promises.push(hostelApi.getHostelStatsAPI());
      }
      const [usersData] = await Promise.all(promises);
      setUsers(usersData);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try {
      const displayName = formData.nameWithInitials || formData.fullName || formData.name;
      const payload = { ...formData, name: displayName };
      
      await userApi.createUserAPI(payload);
      setSuccessMsg(`User ${displayName} added successfully!`);
      
      setFormData({ 
          name: '', email: '', password: '', role: 'student',
          indexNumber: '', fullName: '', nameWithInitials: '', 
          permanentAddress: '', residentPhone: '', mobilePhone: '', gender: 'male'
      });
      loadData();
    } catch (err) { setError(err.message); }
  };

  // --- TEMPLATE DOWNLOAD HANDLER ---
  const handleDownloadTemplate = () => {
    const headers = [
      "email", "password", "role", "name", 
      "indexNumber", "fullName", "nameWithInitials", 
      "permanentAddress", "residentPhone", "mobilePhone", "gender"
    ];
    
    const sampleRow = [
      "student@example.com", "123", "student", "John Doe",
      "ST-2024-001", "Johnathan Doe", "J. Doe", 
      "123 Main St, Colombo", "0112345678", "0771234567", "male"
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + sampleRow.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(''); setSuccessMsg('');
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const newUsers = [];
        for(let i=1; i<lines.length; i++) {
            if(!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const userObj = {};
            
            headers.forEach((h, index) => {
                let val = values[index]?.trim();
                if (val && val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1);
                }
                userObj[h] = val;
            });

            if (userObj.email) {
                if (!userObj.password) userObj.password = '123';
                if (!userObj.role) userObj.role = 'student';
                if (!userObj.name && userObj.nameWithInitials) userObj.name = userObj.nameWithInitials;
                newUsers.push(userObj);
            }
        }

        if (newUsers.length === 0) {
            setError("No valid users found in CSV.");
            return;
        }

        const result = await userApi.bulkCreateUsersAPI(newUsers);
        setSuccessMsg(`Bulk upload complete. Added: ${result.added}, Failed/Skipped: ${result.failed}`);
        loadData();
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        setError("Failed to process CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try { await userApi.deleteUserAPI(id); loadData(); } catch (err) { setError("Failed to delete user"); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try { await userApi.updateUserRoleAPI(userId, newRole); setSuccessMsg("Role updated."); loadData(); } catch (err) { setError("Failed to update role"); }
  };

  const handleViewHostel = async (targetUser) => {
    setSelectedStudent(targetUser);
    setStudentHostelData(null);
    try {
      const data = await hostelApi.getStudentHostelDetailsAPI(targetUser.id);
      setStudentHostelData(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Management Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>}
      {successMsg && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">{successMsg}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Actions */}
        <div className="space-y-6">
          
          {/* 1. CREATE USER FORM */}
          {perms.canCreateUser && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Add New User</h2>
                <form onSubmit={handleAddUser} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm">
                            <option value="student">Student</option>
                            <option value="counselor">Counselor</option>
                            <option value="staff">Staff</option>
                            {perms.canUpdateRole && <option value="admin">Admin</option>}
                        </select>
                        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                    </div>
                    <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                    <hr className="border-slate-100 dark:border-slate-700 my-2"/>
                    <p className="text-xs font-bold text-slate-400 uppercase">Student Profile Details</p>
                    <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                        <input name="nameWithInitials" placeholder="Name with Initials" value={formData.nameWithInitials} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                        <input name="indexNumber" placeholder="Index Number" value={formData.indexNumber} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="mobilePhone" placeholder="Mobile" value={formData.mobilePhone} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm">
                             <option value="male">Male</option>
                             <option value="female">Female</option>
                        </select>
                    </div>
                    <input name="permanentAddress" placeholder="Permanent Address" value={formData.permanentAddress} onChange={handleInputChange} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm" />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition mt-2">Create User</button>
                </form>
            </div>
          )}

          {/* 2. BULK UPLOAD SECTION */}
          {perms.canBulkUpload && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Bulk Import</h2>
                    <button 
                        onClick={handleDownloadTemplate}
                        className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition flex items-center gap-1"
                    >
                        <span>⬇️</span> Download CSV Template
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">Upload a CSV file to add multiple students at once.</p>
                <div className="relative">
                    <input 
                        type="file" 
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleBulkUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                    />
                </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: User List */}
        <div className="xl:col-span-2">
            <UserList 
                users={users} 
                loading={loading}
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
                    <div className="flex justify-between p-3 border rounded dark:border-slate-700"><span className="text-slate-500">Room</span><span className="font-bold dark:text-white">{studentHostelData.roomNumber} (Floor {studentHostelData.floor})</span></div>
                    <div className="flex justify-between p-3 border rounded dark:border-slate-700"><span className="text-slate-500">Start Date</span><span className="font-medium dark:text-white">{studentHostelData.startDate}</span></div>
                    <div className="flex justify-between p-3 border rounded dark:border-slate-700"><span className="text-slate-500">End Date</span><span className="font-medium dark:text-white">{studentHostelData.endDate}</span></div>
                </div>
            ) : <div className="text-center py-4 text-slate-500">No hostel allocation found.</div>}
            <button onClick={() => setSelectedStudent(null)} className="w-full mt-6 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white py-2 rounded-lg font-medium transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;