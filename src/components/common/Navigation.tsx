import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Home, ScrollText, MessageSquare, Map, CheckSquare } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/rules', icon: ScrollText, label: t('nav.rules') },
    { to: '/itinerary', icon: Map, label: t('nav.itinerary') || 'Itinerary' },
    { to: '/checklist', icon: CheckSquare, label: t('nav.checklist') || 'Checklist' },

    { to: '/complaints', icon: MessageSquare, label: t('nav.complaints') },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation — scrollable for many items */}
      <nav className="lg:hidden fixed bottom-0 w-full glass border-t border-card-border z-50 pb-safe">
        <div className="flex items-center h-16 px-1 overflow-x-auto scrollbar-none">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[60px] flex-1 h-full py-1 transition-all duration-200 rounded-xl mx-0.5 active:scale-90 ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/15' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider mt-0.5 truncate max-w-[64px] text-center">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 border-e border-card-border bg-card-bg/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <div className="p-4 space-y-2 mt-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};
