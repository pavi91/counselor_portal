// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null; 

  const isActive = (path) => location.pathname === path;

  // We now show 'User Management' to both admin and staff
  const navItems = [
    { label: 'Dashboard', path: '/home', roles: ['admin', 'staff', 'counselor', 'student'] },
    // Renamed to 'Management' for generic appeal
    { label: 'Management', path: '/management', roles: ['admin', 'staff'] }, 
    { label: 'Student Portal', path: '/student', roles: ['student', 'admin'] },
    { label: 'Counselor Portal', path: '/counselor', roles: ['counselor', 'admin'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Management System
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        
        {navItems.map((item) => (
          item.roles.includes(user.role) && (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${isActive(item.path) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.1 &copy; 2025
      </div>
    </aside>
  );
};

export default Sidebar;