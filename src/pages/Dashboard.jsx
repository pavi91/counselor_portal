import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { adminService } from '../services/mockApi';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch stats only if admin or for general view
    adminService.getSystemStats().then(setData);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500">Total Students</h3>
          <p className="text-2xl font-bold">1,240</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500">Active Sessions</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500">Hostel Occupancy</h3>
          <p className="text-2xl font-bold">85%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Counseling Sessions Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded text-sm">
          Download PDF Report
        </button>
      </div>
    </div>
  );
}