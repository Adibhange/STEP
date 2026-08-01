'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/registry/icons';
import { useKeyboard } from '@/hooks/useKeyboard';

interface CommandItem {
  id: string;
  title: string;
  category: 'Pages' | 'Actions' | 'Candidates' | 'Vacancies';
  path?: string;
  action?: () => void;
  icon: string;
}

const sampleCommands: CommandItem[] = [
  { id: '1', title: 'Dashboard Overview', category: 'Pages', path: '/dashboard', icon: 'BarChart3' },
  { id: '2', title: 'Candidate Management', category: 'Pages', path: '/candidates', icon: 'Users' },
  { id: '3', title: 'Verification Queue', category: 'Pages', path: '/candidates/verification', icon: 'UserCheck' },
  { id: '4', title: 'Walk-In Registration', category: 'Pages', path: '/candidates/walk-in', icon: 'Plus' },
  { id: '5', title: 'Vacancies Pipeline', category: 'Pages', path: '/vacancies', icon: 'Briefcase' },
  { id: '6', title: 'Question Repository', category: 'Pages', path: '/assessment/question-bank', icon: 'FileText' },
  { id: '7', title: 'Create New Candidate', category: 'Actions', path: '/candidates/walk-in', icon: 'Plus' },
  { id: '8', title: ' Rahul Sharma (CND-948123)', category: 'Candidates', path: '/candidates', icon: 'Users' },
  { id: '9', title: ' Senior Full Stack Engineer (VAC-2026-001)', category: 'Vacancies', path: '/vacancies', icon: 'Briefcase' },
];

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filteredCommands = sampleCommands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useKeyboard({
    'ctrl+k': () => {},
    escape: () => isOpen && onClose(),
    arrowdown: () => isOpen && setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length)),
    arrowup: () => isOpen && setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)),
    enter: () => {
      if (isOpen && filteredCommands[selectedIndex]) {
        const cmd = filteredCommands[selectedIndex];
        if (cmd.path) router.push(cmd.path);
        if (cmd.action) cmd.action();
        onClose();
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-xs animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg shadow-2xl border border-[var(--border-subtle)] overflow-hidden z-10 animate-scale-in">
        {/* Search Input Bar */}
        <div className="flex items-center px-3 py-2.5 border-b border-[var(--border-subtle)]">
          <Icon name="Search" size={16} className="text-[var(--text-muted)] mr-2.5" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search candidates, vacancies, settings... (Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--text-muted)]">No matching command or result found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    if (cmd.path) router.push(cmd.path);
                    if (cmd.action) cmd.action();
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)] font-medium' : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon name={cmd.icon as any} size={14} />
                    <span>{cmd.title}</span>
                  </div>
                  <span className="text-[10px] opacity-70 border border-current px-1.5 py-0.5 rounded">{cmd.category}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
