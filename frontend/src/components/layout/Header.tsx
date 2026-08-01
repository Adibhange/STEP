'use client';

import React from 'react';
import { Search, Bell, Moon, Sun, UserCheck } from 'lucide-react';
import { Button } from '../company-ui';

export const Header: React.FC = () => {
  const [dark, setDark] = React.useState(false);

  const toggleDarkMode = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Global Search Bar */}
      <div className="flex items-center gap-2 max-w-xs w-full">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, vacancies, tokens... (Ctrl+K)"
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs pl-8 pr-3 py-1 rounded border border-transparent focus:border-[#2563EB] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Quick Actions & Profile */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-1 h-7 w-7 rounded-full text-slate-600 dark:text-slate-300">
          {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </Button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        <Button variant="ghost" size="sm" className="relative p-1 h-7 w-7 rounded-full text-slate-600 dark:text-slate-300">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
        </Button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User Profile Info */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-semibold text-[10px] flex items-center justify-center border border-slate-700">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">Admin Director</p>
            <p className="text-[10px] text-slate-500 leading-tight">HR & Engineering</p>
          </div>
        </div>
      </div>
    </header>
  );
};
