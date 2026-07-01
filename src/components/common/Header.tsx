import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Palette, Bell, Sun, Moon, Coffee, Play, Pause, Loader2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [latestNotif, setLatestNotif] = useState<any>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<'idle' | 'loading' | 'cached'>('idle');

  useEffect(() => {
    // Lazy check cache on mount (delayed slightly so it doesn't block page load)
    const timer = setTimeout(async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open('quran-audio-cache');
          const matched = await cache.match('https://server6.mp3quran.net/abkr/057.mp3');
          if (matched) {
            setDownloadProgress('cached');
            const blob = await matched.blob();
            setAudioUrl(URL.createObjectURL(blob));
          }
        } catch (e) {
          console.error("Cache check error:", e);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (audioInstance) {
        audioInstance.pause();
      }
      setIsPlaying(false);
      return;
    }

    let url = audioUrl;
    if (!url) {
      setDownloadProgress('loading');
      try {
        const cache = await caches.open('quran-audio-cache');
        const response = await fetch('https://server6.mp3quran.net/abkr/057.mp3');
        if (!response.ok) throw new Error("Audio download failed");
        
        await cache.put('https://server6.mp3quran.net/abkr/057.mp3', response.clone());
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);
        url = localUrl;
        setDownloadProgress('cached');
      } catch (err) {
        console.error("Audio caching failed, fallback to online stream:", err);
        url = 'https://server6.mp3quran.net/abkr/057.mp3';
        setDownloadProgress('idle');
      }
    }

    if (url) {
      let audio = audioInstance;
      if (!audio) {
        audio = new Audio(url);
        audio.addEventListener('ended', () => setIsPlaying(false));
        setAudioInstance(audio);
      }
      audio.play().catch(err => console.error("Play failed:", err));
      setIsPlaying(true);
    }
  };

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
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeAll = useCallback(() => {
    setShowNotifDropdown(false);
  }, []);

  const hasUnread = latestNotif && localStorage.getItem(`dismissed_notif_${latestNotif.id}`) !== 'true';

  const handleDismissNotif = () => {
    if (latestNotif) {
      localStorage.setItem(`dismissed_notif_${latestNotif.id}`, 'true');
      setShowNotifDropdown(false);
    }
  };

  const isAnyDropdownOpen = showNotifDropdown;

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'no', label: 'Norsk', flag: '🇳🇴' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰', className: 'font-urdu' },
  ];

  const handleToggleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

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
            <span className="font-extrabold text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">NurulQuran Geiranger</span>
          </Link>
   
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notification Bell */}
            {user && latestNotif && (
              <div className="relative">
                <button 
                  onClick={() => {
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
                          className="text-xs bg-amber-100 dark:bg-amber-900/35 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-bold hover:bg-amber-200 active:bg-amber-300 transition-colors"
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

            {/* Quranic Audio Player (Surah Al-Hadid) */}
            <button 
              onClick={handlePlayPause} 
              className={`flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 ${
                isPlaying ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : 'text-slate-600 dark:text-slate-300'
              }`}
              title={isPlaying ? "Pause Surah Al-Hadid" : "Play Surah Al-Hadid (recited by Abdulbari Al-Thubaity)"}
            >
              {downloadProgress === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Theme Cycler */}
            <button 
              onClick={toggleTheme} 
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95" 
              title={`Cycle theme (Current: ${theme})`}
            >
              {theme === 'light' && <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
              {theme === 'dark' && <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
              {theme === 'sepia' && <Coffee className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
              {!['light', 'dark', 'sepia'].includes(theme) && <Palette className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
            </button>

            <button 
              onClick={handleToggleLanguage}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 text-xl"
              aria-label="Toggle language"
              title="Change Language"
            >
              {languages.find(l => l.code === language)?.flag || '🇬🇧'}
            </button>
            

          </div>
        </div>
      </header>
    </>
  );
};
