import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Globe, LogOut, Palette, Bell } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [latestNotif, setLatestNotif] = useState<any>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    const qNotif = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
    const unsub = onSnapshot(qNotif, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setLatestNotif({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsub();
  }, [user]);

  const hasUnread = latestNotif && localStorage.getItem(`dismissed_notif_${latestNotif.id}`) !== 'true';

  const handleDismissNotif = () => {
    if (latestNotif) {
      localStorage.setItem(`dismissed_notif_${latestNotif.id}`, 'true');
      setShowNotifDropdown(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-card-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 hover-lift transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 shadow-md flex items-center justify-center text-white font-black text-sm">
            OG
          </div>
          <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">Geiranger</span>
        </Link>
 
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          {user && latestNotif && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" 
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-card-bg animate-pulse"></span>
                )}
              </button>
              
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-card-bg border border-card-border rounded-xl shadow-lg p-4 z-50 animate-slide-down">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Broadcast Update</span>
                    {hasUnread && (
                      <button 
                        onClick={handleDismissNotif}
                        className="text-[10px] bg-amber-100 dark:bg-amber-900/35 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold hover:bg-amber-200 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-normal">{latestNotif.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Theme Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Select theme">
              <Palette className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium capitalize hidden sm:inline">{theme}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-card-bg border border-card-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button 
                onClick={() => setTheme('light')} 
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30 ${theme === 'light' ? 'font-bold text-primary-600' : ''}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30 ${theme === 'dark' ? 'font-bold text-primary-600' : ''}`}
              >
                Dark
              </button>
              <button 
                onClick={() => setTheme('sepia')} 
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30 ${theme === 'sepia' ? 'font-bold text-primary-600' : ''}`}
              >
                Sepia
              </button>
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-card-bg border border-card-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button onClick={() => setLanguage('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30">English</button>
              <button onClick={() => setLanguage('no')} className="block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30">Norsk</button>
              <button onClick={() => setLanguage('ur')} className="block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/30 font-urdu">اردو</button>
            </div>
          </div>
          
          {user && (
            <button 
              onClick={logout}
              className="p-2 text-slate-600 hover:text-error dark:text-slate-300 transition-colors rounded-md hover:bg-error/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
