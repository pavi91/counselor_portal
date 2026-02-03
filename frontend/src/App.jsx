// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout'; 

import Login from './pages/Login'; 
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';

import HostelManagement from './pages/HostelManagement'; 
import ApplicationReview from './pages/ApplicationReview';
import StudentApplication from './pages/StudentApplication';

// NEW Pages
import StudentTickets from './pages/StudentTickets';
import CounselorTickets from './pages/CounselorTickets';

import StaffRoleRequest from './pages/StaffRoleRequest';
import AdminRoleRequests from './pages/AdminRoleRequests';

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
            {/* Common */}
            <Route path="/home" element={<Dashboard />} />

            {/* ADMIN & STAFF */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
              <Route path="/management" element={<UserManagement />} />
              <Route path="/hostel/tenants" element={<HostelManagement />} />
              <Route path="/hostel/applications" element={<ApplicationReview />} />
            </Route>

            {/* COUNSELOR (Admin can also access if needed) */}
            <Route element={<ProtectedRoute allowedRoles={['counselor', 'admin']} />}>
               <Route path="/counselor/tickets" element={<CounselorTickets />} />
            </Route>

            {/* STUDENT */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/application" element={<StudentApplication />} />
              <Route path="/student/tickets" element={<StudentTickets />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route path="/staff/request-role" element={<StaffRoleRequest />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/role-requests" element={<AdminRoleRequests />} />
            </Route>

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;