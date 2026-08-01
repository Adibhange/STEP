'use client';

import React, { useState } from 'react';
import { QrCode, CheckCircle2, User, Building, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/company-ui';

export default function WalkInRegistrationPage({ params }: { params: { qrId: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const [candidateCode, setCandidateCode] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dob: '2000-01-01',
    gender: 'Male',
    role: 'Senior Full Stack Engineer',
    source: 'WalkIn',
    college: '',
    passingYear: '2022',
    cgpa: '8.5',
    currentCompany: '',
    experienceMonths: '36',
    currentSalary: '800000',
    expectedSalary: '1200000',
    noticePeriod: '30',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `CND-${Math.floor(100000 + Math.random() * 900000)}`;
    setCandidateCode(code);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">ERMS On-Premises Intake</h1>
              <p className="text-[11px] text-slate-400 font-mono">Event QR Code Token: {params.qrId}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
            Walk-In Portal
          </span>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-base font-bold text-white">Registration Submitted Successfully!</h2>
            <p className="text-xs text-slate-300">Your unique candidate token has been registered in the HR Verification Queue.</p>
            
            <div className="p-4 bg-slate-900 border border-slate-700 rounded text-center space-y-1 my-4">
              <div className="text-[10px] uppercase font-bold text-slate-400">Candidate Access Token</div>
              <div className="font-mono text-xl font-bold text-[#2563EB] tracking-widest">{candidateCode}</div>
              <p className="text-[10px] text-slate-500">Please report to the HR desk for identity verification and exam token issuance.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <User className="w-3.5 h-3.5 text-[#2563EB]" /> Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2563EB]"
                    placeholder="Aditya"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2563EB]"
                    placeholder="Bhange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2563EB]"
                    placeholder="aditya@example.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mobile Number *</label>
                  <input
                    required
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2563EB]"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Experience / Freshers Details */}
            <div className="space-y-2 border-t border-slate-700 pt-3">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Building className="w-3.5 h-3.5 text-[#2563EB]" /> Professional Experience
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Total Experience (Months)</label>
                  <input
                    type="number"
                    value={formData.experienceMonths}
                    onChange={(e) => setFormData({ ...formData, experienceMonths: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Current Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <Button variant="primary" size="lg" type="submit" className="w-full mt-2">
              Submit Walk-In Registration <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
