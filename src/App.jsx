import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { HostelRegistration, Counseling } from './pages/StudentPages';
import { AdminUserManagement, CounselorTools } from './pages/AdminPages';
import { LayoutDashboard, Users, Home, MessageCircle, FileUp } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-slate-700">UniPortal</div>
        <nav className="flex-1 p-4 space-y-2">
          
          <Link to="/dashboard" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          {/* Student Links */}
          {user.role === 'student' && (
            <>
              <Link to="/hostel-reg" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
                <Home size={18} /> Hostel Reg
              </Link>
              <Link to="/counseling" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
                <MessageCircle size={18} /> Counseling
              </Link>
            </>
          )}

          {/* Admin Links */}
          {user.role === 'admin' && (
            <Link to="/admin/users" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
              <Users size={18} /> User Management
            </Link>
          )}

          {/* Counselor Links */}
          {user.role === 'counselor' && (
            <>
              <Link to="/counseling" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
                <MessageCircle size={18} /> Chat
              </Link>
              <Link to="/counselor/tools" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded">
                <FileUp size={18} /> Upload MCQs
              </Link>
            </>
          )}
          
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={logout} className="w-full bg-red-600 py-2 rounded text-sm hover:bg-red-700">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Student Routes */}
            <Route path="/hostel-reg" element={<HostelRegistration />} />
            <Route path="/counseling" element={<Counseling />} />

            {/* Admin Routes */}
            <Route path="/admin/users" element={<AdminUserManagement />} />

            {/* Counselor Routes */}
            <Route path="/counselor/tools" element={<CounselorTools />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}