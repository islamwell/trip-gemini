import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import pkg from '../../../package.json';

export const Footer: React.FC = () => {
  const { role } = useAuth();

  return (
    <footer className="w-full mt-auto py-2 flex flex-col items-center justify-center gap-2">
      <div className="text-[10px] text-slate-400 font-medium">
        Ver {pkg.version}
      </div>
      
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
