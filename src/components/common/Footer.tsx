import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import pkg from '../../../package.json';

export const Footer: React.FC = () => {
  const { role } = useAuth();

  return (
    <footer className="w-full mt-auto py-6 border-t border-card-border bg-card-bg/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500 font-medium">
          Version {pkg.version}
        </div>
        
        {role === 'admin' && (
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-1.5 justify-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium transition-transform hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" /> Admin Panel
          </Link>
        )}
      </div>
    </footer>
  );
};
