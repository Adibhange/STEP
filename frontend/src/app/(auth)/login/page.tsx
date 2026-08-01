'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/ui/input/Input';
import { Button } from '@/ui/button/Button';

export default function LoginPage() {
  const [isDirectorPin, setIsDirectorPin] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="flex justify-center border-b border-[var(--border-subtle)] pb-2 gap-4 text-xs font-medium">
        <button
          onClick={() => setIsDirectorPin(false)}
          className={`pb-1 border-b-2 ${!isDirectorPin ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold' : 'border-transparent text-[var(--text-muted)]'}`}
        >
          Staff Password Login
        </button>
        <button
          onClick={() => setIsDirectorPin(true)}
          className={`pb-1 border-b-2 ${isDirectorPin ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold' : 'border-transparent text-[var(--text-muted)]'}`}
        >
          Director PIN Access
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-3 pt-2">
        {!isDirectorPin ? (
          <>
            <Input label="Email Address" type="email" defaultValue="admin@enterprise.com" required icon="Users" />
            <Input label="Password" type="password" defaultValue="Admin@123" required icon="Lock" />
          </>
        ) : (
          <Input label="Enter 6-Digit Security PIN" type="password" maxLength={6} defaultValue="123456" required icon="ShieldAlert" />
        )}

        <Button variant="primary" type="submit" fullWidth icon="LogOut">
          {isDirectorPin ? 'Authenticate PIN' : 'Sign In to Enterprise Workspace'}
        </Button>
      </form>
    </AuthLayout>
  );
}
