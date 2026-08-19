'use client';

import React, { Suspense } from 'react';
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
