'use client';

import React, { useState } from 'react';
import { Input } from '@/ui/input/Input';
import { Button } from '@/ui/button/Button';

export default function WalkInRegistrationPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-4 bg-[var(--bg-surface)] p-5 rounded border border-[var(--border-subtle)] shadow-sm">
      <div>
        <h2 className="text-base font-bold text-[var(--text-primary)]">Fast-Track Walk-In Candidate Registration</h2>
        <p className="text-xs text-[var(--text-muted)]">Register on-site candidates directly into the assessment pipeline.</p>
      </div>

      {submitted ? (
        <div className="p-4 bg-[var(--status-success-bg)] border border-[var(--status-success)]/30 rounded text-xs text-[var(--status-success)] space-y-2">
          <p className="font-bold">✅ Candidate Registered & Assigned Test Slot!</p>
          <p>Assigned Candidate Code: <span className="font-mono font-bold">CND-948620</span></p>
          <Button variant="outline" size="xs" onClick={() => setSubmitted(false)}>
            Register Another Candidate
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" required placeholder="e.g. Vikram" />
            <Input label="Last Name" required placeholder="e.g. Malhotra" />
          </div>
          <Input label="Email Address" type="email" required placeholder="vikram.m@example.com" />
          <Input label="Mobile Number" required placeholder="+91 98765 43210" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Applied Role" required placeholder="Senior Full Stack Engineer" />
            <Input label="Total Experience (Years)" type="number" required placeholder="5.5" />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button">Cancel</Button>
            <Button variant="primary" type="submit" icon="Plus">Register & Launch Test</Button>
          </div>
        </form>
      )}
    </div>
  );
}
