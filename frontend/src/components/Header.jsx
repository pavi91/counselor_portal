// src/components/Header.jsx
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Breadcrumb / Title Area */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
      </div>

      {/* User Profile & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</div>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>

        <button 
          onClick={logout} 
          className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;