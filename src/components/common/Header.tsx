import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Globe, LogOut, Palette, Bell, Check } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [latestNotif, setLatestNotif] = useState<any>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

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

  // Close all dropdowns on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifDropdown(false);
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeAll = useCallback(() => {
    setShowNotifDropdown(false);
    setShowLangDropdown(false);
  }, []);

  const hasUnread = latestNotif && localStorage.getItem(`dismissed_notif_${latestNotif.id}`) !== 'true';

  const handleDismissNotif = () => {
    if (latestNotif) {
      localStorage.setItem(`dismissed_notif_${latestNotif.id}`, 'true');
      setShowNotifDropdown(false);
    }
  };

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  const isAnyDropdownOpen = showNotifDropdown || showLangDropdown;

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'no', label: 'Norsk', flag: '🇳🇴' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰', className: 'font-urdu' },
  ];

  return (
    <>
      {/* Invisible backdrop overlay — catches taps/clicks outside any dropdown */}
      {isAnyDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeAll}
          onTouchEnd={closeAll}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-50 w-full glass border-b border-card-border shadow-sm">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 hover-lift transition-all">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 shadow-md flex items-center justify-center text-white font-black text-xs sm:text-sm">
              OG
            </div>
            <span className="font-extrabold text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">Geiranger</span>
          </Link>
   
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notification Bell */}
            {user && latestNotif && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowLangDropdown(false);
                    setShowNotifDropdown(prev => !prev);
                  }}
                  className="flex items-center p-2.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative active:scale-95" 
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-card-bg animate-pulse"></span>
                  )}
                </button>
                
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-card-bg border border-card-border rounded-2xl shadow-2xl p-4 z-50 animate-slide-in">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Broadcast Update</span>
                      {hasUnread && (
                        <button 
                          onClick={handleDismissNotif}
                          className="text-[10px] bg-amber-100 dark:bg-amber-900/35 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold hover:bg-amber-200 active:bg-amber-300 transition-colors"
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

            {/* Theme Cycler */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-2 p-2.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95" 
              title="Cycle theme (Light / Dark / Sepia)"
            >
              <Palette className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium capitalize hidden sm:inline">{theme}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifDropdown(false);
                  setShowLangDropdown(prev => !prev);
                }}
                className={`flex items-center gap-1.5 p-2.5 sm:p-2 rounded-xl transition-colors active:scale-95 ${
                  showLangDropdown 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-expanded={showLangDropdown}
                aria-label="Select language"
              >
                <Globe className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-bold uppercase hidden sm:inline">{language}</span>
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-card-bg border border-card-border rounded-2xl shadow-2xl z-50 animate-slide-in overflow-hidden">
                  {languages.map((lang) => (
                    <button 
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors active:bg-primary-100 dark:active:bg-primary-900/40 ${
                        language === lang.code 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-bold' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      } ${lang.className || ''}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1">{lang.label}</span>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {user && (
              <button 
                onClick={logout}
                className="p-2.5 sm:p-2 text-slate-600 hover:text-error dark:text-slate-300 transition-colors rounded-xl hover:bg-error/10 active:scale-95"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
