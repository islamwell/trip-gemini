import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Home, ScrollText, MessageSquare, Map, CheckSquare, Menu, X } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/rules', icon: ScrollText, label: t('nav.rules') },
    { to: '/itinerary', icon: Map, label: t('nav.itinerary') || 'Itinerary' },
    { to: '/checklist', icon: CheckSquare, label: t('nav.checklist') || 'Checklist' },
    { to: '/complaints', icon: MessageSquare, label: t('nav.complaints') },
  ];

  return (
    <>
      {/* Floating Hamburger Action Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary-600 text-white shadow-2xl hover:bg-primary-700 transition-all duration-200 active:scale-90 flex items-center justify-center border border-primary-500/30"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="w-6 h-6 animate-spin-once" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer (Vertical Menu) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-e border-card-border p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300"
        >
          <div className="space-y-6 mt-16">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white font-black text-xs">
                OG
              </div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">NurulQuran Geiranger</span>
            </div>

            <nav className="space-y-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-semibold">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop & Tablet Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-16 lg:w-64 border-e border-card-border bg-card-bg/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-all duration-300">
        <div className="p-2 lg:p-4 space-y-2 mt-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
              title={label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};
