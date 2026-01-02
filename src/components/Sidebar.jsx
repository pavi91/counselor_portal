// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

const Sidebar = () => {
  const { user } = useAuth();
  const perms = usePermissions();
  const location = useLocation();

  if (!user) return null; 

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Management System
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        
        {/* COMMON */}
        <NavItem to="/home" label="Dashboard" isActive={isActive('/home')} />

        {/* --- HOSTEL MANAGEMENT (ADMIN & STAFF) --- */}
        {(perms.canManageTenants || perms.canViewApplications) && (
          <div className="pt-4 pb-1">
             <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Hostel Admin</div>
             
             {perms.canManageTenants && (
               <NavItem to="/hostel/tenants" label="Tenant Management" isActive={isActive('/hostel/tenants')} icon="🏠" />
             )}
             
             {perms.canViewApplications && (
               <NavItem to="/hostel/applications" label="Applications Review" isActive={isActive('/hostel/applications')} icon="📋" />
             )}
          </div>
        )}

        {/* --- STUDENT --- */}
        {perms.canApplyHostel && (
           <div className="pt-4 pb-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Student Services</div>
              <NavItem to="/student/application" label="Hostel Application" isActive={isActive('/student/application')} icon="📝" />
           </div>
        )}

        {/* USER MANAGEMENT */}
        {perms.canViewUsers && (
          <div className="pt-4 pb-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">System</div>
            <NavItem to="/management" label="User Management" isActive={isActive('/management')} />
          </div>
        )}

      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v2.0.0 &copy; 2026
      </div>
    </aside>
  );
};

const NavItem = ({ to, label, isActive, icon }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
  >
    {icon && <span>{icon}</span>}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Sidebar;