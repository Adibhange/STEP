'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  QrCode,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Vacancies', href: '/vacancies', icon: Briefcase },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Assessments', href: '/assessments', icon: FileText },
  { name: 'Walk-In QR Generator', href: '/candidate-intake/walk-in/demo-qr', icon: QrCode },
  { name: 'Proctoring & Audit', href: '/audit', icon: ShieldAlert },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center font-black text-white text-xs tracking-wider shadow-sm">
            E
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide leading-tight">ERMS Enterprise</h1>
            <p className="text-[10px] text-slate-400 font-mono">v10.4 PROD</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all group',
                isActive
                  ? 'bg-[#2563EB] text-white shadow-xs font-semibold'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px]">API ONLINE</span>
        </div>
        <span className="text-slate-500">.NET 10 CQRS</span>
      </div>
    </aside>
  );
};
