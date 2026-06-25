import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import pkg from '../../../package.json';

export const Footer: React.FC = () => {
  const { role } = useAuth();

  const handleHardRefresh = () => {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
    // Delete all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
    // Delay reload slightly to allow unregistration/deletion to complete
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <footer className="w-full mt-auto py-2 flex flex-col items-center justify-center gap-2">
      <button 
        onClick={handleHardRefresh}
        className="text-[10px] text-slate-400 font-medium hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer focus:outline-none"
        title="Hard Refresh & Clear Cache"
      >
        Ver {pkg.version}
      </button>
      
      {role === 'admin' && (
        <Link 
          to="/admin" 
          className="text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors flex items-center gap-1"
        >
          <ShieldCheck className="w-3 h-3" /> Admin Panel
        </Link>
      )}
    </footer>
  );
};
