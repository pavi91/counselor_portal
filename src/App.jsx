// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout'; 

import Login from './pages/Login'; 
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';

const StudentDashboard = () => <div className="p-4"><h1 className="text-2xl font-bold">Student Dashboard</h1></div>;
const CounselorDashboard = () => <div className="p-4"><h1 className="text-2xl font-bold">Counselor Dashboard</h1></div>;

const Home = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
    <div className="text-center">
      <h1 className="text-5xl font-bold mb-6">Management System</h1>
      <Link to="/login" className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:bg-slate-100 transition">
        Login Portal
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<DashboardLayout />}>
            
            {/* COMMON LANDING */}
            <Route path="/home" element={<Dashboard />} />

            {/* UNIFIED MANAGEMENT (Admin + Staff) */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
              <Route path="/management" element={<UserManagement />} />
            </Route>

            {/* ROLE SPECIFIC PORTALS */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route path="/student" element={<StudentDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['counselor', 'admin']} />}>
              <Route path="/counselor" element={<CounselorDashboard />} />
            </Route>

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;