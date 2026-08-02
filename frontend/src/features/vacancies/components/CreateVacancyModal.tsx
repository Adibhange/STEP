'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';

interface CreateVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vacancyData: any) => void;
}

/**
 * STEP Enterprise CreateVacancyModal
 *
 * Structured 6-Section Creation Form:
 * 1. Basic Information
 * 2. Locations
 * 3. Assessment
 * 4. Hiring
 * 5. Walk-in Drive & QR
 * 6. Publication
 */
export const CreateVacancyModal: React.FC<CreateVacancyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('Senior Frontend Engineer');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState('Full-Time Permanent');
  const [experience, setExperience] = useState('4-7 Yrs');
  const [openPositions, setOpenPositions] = useState(5);

  const [hiringLocation, setHiringLocation] = useState('Pune Tech Park');
  const [testLocation, setTestLocation] = useState('Pune Assessment Hub');
  const [workMode, setWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');

  const [questionPaperTitle, setQuestionPaperTitle] = useState('Advanced React 19 & TypeScript Enterprise Paper A');
  const [assessmentDurationMinutes, setAssessmentDurationMinutes] = useState(60);
  const [passingCriteriaPercentage, setPassingCriteriaPercentage] = useState(70);

  const [assignedRecruiter, setAssignedRecruiter] = useState('Aditya Bhange');
  const [hiringManager, setHiringManager] = useState('Rajesh Sharma');

  const [walkInEnabled, setWalkInEnabled] = useState(true);
  const [walkInName, setWalkInName] = useState('Pune Walk-in Drive 2026');
  const [walkInVenue, setWalkInVenue] = useState('Sthapatya Tech Tower');
  const [walkInDate, setWalkInDate] = useState('2026-08-15');

  const [status, setStatus] = useState<'Open' | 'Draft'>('Open');
  const [closingDate, setClosingDate] = useState('2026-08-30');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title || 'New Vacancy',
      role,
      department,
      employmentType,
      experience,
      openPositions,
      hiringLocation,
      testLocation,
      workMode,
      questionPaperTitle,
      assessmentDurationMinutes,
      passingCriteriaPercentage,
      assignedRecruiter,
      hiringManager,
      status,
      closingDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--overlay)] flex items-center justify-center p-4 overflow-y-auto" backdrop-blur="true">
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)] bg-[var(--surface-1)] shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] font-heading">Create Enterprise Vacancy</h2>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Structured hiring specification configuration</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
            <Icon name="x" size="sm" />
          </button>
        </div>

        {/* Scrollable Form Body with 6 Structured Sections */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto scrollbar-step flex flex-col gap-6">
          {/* Section 1: Basic Information */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-mono border-b border-[var(--border-soft)] pb-1.5">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Vacancy Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React / Next.js Architect"
                  className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="DevOps Specialist">DevOps Specialist</option>
                  <option value="QA Automation Engineer">QA Automation Engineer</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Engineering">Engineering</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Talent Acquisition">Talent Acquisition</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Employment Type</label>
                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Full-Time Permanent">Full-Time Permanent</option>
                  <option value="Contractual (6-12 Months)">Contractual</option>
                  <option value="Graduate Internship">Graduate Internship</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Open Positions</label>
                <input
                  type="number"
                  min={1}
                  value={openPositions}
                  onChange={(e) => setOpenPositions(Number(e.target.value))}
                  className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Locations */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-mono border-b border-[var(--border-soft)] pb-1.5">
              2. Locations & Work Mode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Hiring Location</label>
                <select value={hiringLocation} onChange={(e) => setHiringLocation(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Pune Tech Park">Pune Tech Park</option>
                  <option value="Mumbai HQ">Mumbai HQ</option>
                  <option value="Bengaluru Innovation Center">Bengaluru Innovation Center</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Test Location</label>
                <select value={testLocation} onChange={(e) => setTestLocation(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Pune Assessment Hub">Pune Assessment Hub</option>
                  <option value="Mumbai Test Center 1">Mumbai Test Center 1</option>
                  <option value="Online Remote Proctored">Online Remote Proctored</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Work Mode</label>
                <select value={workMode} onChange={(e) => setWorkMode(e.target.value as any)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Assessment */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-mono border-b border-[var(--border-soft)] pb-1.5">
              3. Assessment Specification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Assign Question Paper</label>
                <input
                  type="text"
                  value={questionPaperTitle}
                  onChange={(e) => setQuestionPaperTitle(e.target.value)}
                  className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Duration (Mins)</label>
                <input type="number" value={assessmentDurationMinutes} onChange={(e) => setAssessmentDurationMinutes(Number(e.target.value))} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none" />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Passing Score (%)</label>
                <input type="number" value={passingCriteriaPercentage} onChange={(e) => setPassingCriteriaPercentage(Number(e.target.value))} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none" />
              </div>
            </div>
          </div>

          {/* Section 4: Hiring */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-mono border-b border-[var(--border-soft)] pb-1.5">
              4. Hiring Team & Stakeholders
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Assigned Recruiter</label>
                <input type="text" value={assignedRecruiter} onChange={(e) => setAssignedRecruiter(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none" />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Hiring Manager</label>
                <input type="text" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none" />
              </div>
            </div>
          </div>

          {/* Section 5: Walk-in Drive & QR */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-mono border-b border-[var(--border-soft)] pb-1.5">
              5. Walk-in Drive & Flagship QR Configuration
            </h3>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="walkin-check" checked={walkInEnabled} onChange={(e) => setWalkInEnabled(e.target.checked)} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="walkin-check" className="text-[12.5px] font-bold text-[var(--text-primary)] cursor-pointer">Enable Walk-in Drive & Generate QR Code</label>
            </div>
            {walkInEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-[var(--surface-2)] p-4 rounded-md border border-[var(--border-default)]">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Drive Name</label>
                  <input type="text" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="w-full mt-1 h-8 px-2.5 border border-[var(--border-default)] rounded bg-[var(--surface-1)] text-[12px] outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase">Venue</label>
                  <input type="text" value={walkInVenue} onChange={(e) => setWalkInVenue(e.target.value)} className="w-full mt-1 h-8 px-2.5 border border-[var(--border-default)] rounded bg-[var(--surface-1)] text-[12px] outline-none" />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Publication */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-mono border-b border-[var(--border-soft)] pb-1.5">
              6. Publication & Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Initial Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer">
                  <option value="Open">Open (Active Hiring)</option>
                  <option value="Draft">Draft (Internal Review)</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase">Closing Date</label>
                <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="w-full mt-1 h-9 px-3 border border-[var(--border-default)] rounded-md bg-[var(--surface-2)] text-[12.5px] outline-none cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)] mt-2 shrink-0">
            <button type="button" onClick={onClose} className="px-4 h-9 text-[12.5px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-full cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 h-9 text-[12.5px] font-bold bg-[var(--accent-indigo)] text-white rounded-full hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs">
              Publish Vacancy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
