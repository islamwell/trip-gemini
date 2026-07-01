import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import pkg from '../../../package.json';

export const Footer: React.FC = () => {

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
        className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer focus:outline-none flex flex-col items-center gap-0.5"
        title="Hard Refresh & Clear Cache"
      >
        <span className="font-semibold">Version {pkg.version}</span>
        <span className="text-[9px] opacity-75">Updated: {__BUILD_TIME__}</span>
      </button>
      
      <Link 
        to="/admin" 
        className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 dark:hover:bg-primary-600 px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 shadow-xs border border-card-border mt-1"
      >
        <ShieldCheck className="w-3 h-3" /> Admin Panel
      </Link>
    </footer>
  );
};
