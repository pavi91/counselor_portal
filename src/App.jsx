// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout'; 

import Login from './pages/Login'; 
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';

// Updated / New Pages
import HostelManagement from './pages/HostelManagement'; // Reuse existing file for "Tenant Management"
import ApplicationReview from './pages/ApplicationReview';
import StudentApplication from './pages/StudentApplication';

const Home = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
    <div className="text-center">
      <h1 className="text-5xl font-bold mb-6">Hostel System</h1>
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
            <Route path="/home" element={<Dashboard />} />

            {/* --- ADMIN & STAFF ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
              <Route path="/management" element={<UserManagement />} />
              
              {/* Subcategory 1: Tenant Management (Rooms/Allocations) */}
              <Route path="/hostel/tenants" element={<HostelManagement />} />
              
              {/* Subcategory 2: Application Management (Points/Approvals) */}
              <Route path="/hostel/applications" element={<ApplicationReview />} />
            </Route>

            {/* --- STUDENT ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/application" element={<StudentApplication />} />
            </Route>

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;