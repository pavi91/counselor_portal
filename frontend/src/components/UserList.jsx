// src/components/UserList.jsx
import { useState } from 'react';

// Props allow us to toggle features based on who is using the list
const UserList = ({ 
  users, 
  onDelete,     // If provided, shows Delete button
  onRoleChange, // If provided, shows Role dropdown
  onViewHostel, // If provided, shows "Hostel Info" button
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Local filtering for immediate UI response (API search is also available)
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">
          User Directory
        </h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">User</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Role</th>
              {(onRoleChange || onDelete || onViewHostel) && (
                <th className="px-6 py-4 text-right font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">Loading directory...</td></tr>
            ) : filteredUsers.length === 0 ? (
               <tr><td colSpan="3" className="p-8 text-center text-slate-500">No users found matching "{searchTerm}"</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
                </td>
                
                {/* Role Column */}
                <td className="px-6 py-4">
                  {onRoleChange ? (
                    <select 
                      value={user.role} 
                      onChange={(e) => onRoleChange(user.id, e.target.value)}
                      className={`
                        text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1
                        ${user.role === 'admin' ? 'bg-red-100 text-red-700 focus:ring-red-500' : 
                          user.role === 'student' ? 'bg-green-100 text-green-700 focus:ring-green-500' : 
                          'bg-blue-100 text-blue-700 focus:ring-blue-500'}
                      `}
                    >
                      <option value="student">Student</option>
                      <option value="counselor">Counselor</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        user.role === 'student' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  )}
                </td>

                {/* Actions Column */}
                {(onDelete || onViewHostel) && (
                  <td className="px-6 py-4 text-right space-x-2">
                    {onViewHostel && user.role === 'student' && (
                       <button 
                       onClick={() => onViewHostel(user)}
                       className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition"
                     >
                       Hostel Info
                     </button>
                    )}
                    
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(user.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete User"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;