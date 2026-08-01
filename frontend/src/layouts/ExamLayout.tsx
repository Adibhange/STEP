'use client';

import React from 'react';

export const ExamLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Locked Fullscreen Top Bar */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-slate-200">PROCTORED ASSESSMENT SESSION IN PROGRESS</span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          SESSION ID: <span className="text-slate-200">EXM-994821</span>
        </div>
      </header>

      {/* Main Locked Viewport */}
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>
    </div>
  );
};
