import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth() || {};
  const role = user?.role;
  const name = user?.name || '';

  let message = 'Welcome';
  if (role === 'admin') message = `Welcome to the Admin Dashboard${name ? `, ${name}` : ''}`;
  else if (role === 'counselor') message = `Welcome to the Counselor Dashboard${name ? `, ${name}` : ''}`;
  else if (role === 'staff') message = `Welcome to the Staff Dashboard${name ? `, ${name}` : ''}`;
  else if (role === 'student') message = `Welcome to your Student Dashboard${name ? `, ${name}` : ''}`;
  else if (name) message = `Welcome, ${name}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <h1 className="text-4xl font-bold text-white">{message}</h1>
    </div>
  );
};

export default Dashboard;