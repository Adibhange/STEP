'use client';

import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl p-6 space-y-4 animate-scale-in">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--brand-primary)] text-white font-bold text-lg mb-2">
            S
          </div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">STEP Enterprise Recruitment System</h1>
          <p className="text-xs text-[var(--text-muted)]">Secure Multi-Tenant Enterprise Portal</p>
        </div>
        {children}
      </div>
    </div>
  );
};
