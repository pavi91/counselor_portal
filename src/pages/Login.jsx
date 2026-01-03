// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('student@school.com'); 
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }
  };

  return (
    // Updated background gradient to match Unauthorized.jsx
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
        
        {/* Header Section */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 dark:border-slate-700">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="name@school.com" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200"
            >
              Sign In
            </button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <div className="space-x-4">
              <span>Student: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">student@school.com</code></span>
              <span>Pass: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">123</code></span>
            </div>
            <div className="mt-1">
              <span>Admin: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">admin@school.com</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;