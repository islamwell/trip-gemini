import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password === 'radquran114') {
      if (user) {
        setLoading(true);
        try {
          await updateDoc(doc(db, 'participants', user.uid), {
            role: 'admin'
          });
          // Force a full reload to refresh the AuthContext and role
          window.location.href = '/admin';
        } catch (err) {
          console.error(err);
          setError('Failed to update role. Permission denied.');
          setLoading(false);
        }
      } else {
        setError('You must be logged in as a user first.');
      }
    } else {
      setError('Incorrect admin password');
    }
  };

  if (role === 'admin') {
    navigate('/admin');
    return null;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl border border-card-border">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-error/10 dark:bg-error/20 rounded-2xl flex items-center justify-center text-error">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">Admin Access</h1>
        <p className="text-slate-500 text-center mb-8">Enter the master password to elevate your account privileges.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-error transition-all"
              placeholder="Enter master password"
              required
            />
          </div>
          {error && <p className="text-error text-sm font-medium text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-error hover:bg-red-600 text-white py-3 rounded-xl hover-lift font-bold tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
