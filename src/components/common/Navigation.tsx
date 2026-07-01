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
    <aside className="flex flex-col w-16 lg:w-64 border-e border-card-border bg-card-bg/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-all duration-300">
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
  );
};
