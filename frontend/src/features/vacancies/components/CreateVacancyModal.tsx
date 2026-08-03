'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { MASTER_DATA } from '@/mock/masters';
import { USERS_MOCK } from '@/mock/users';

interface CreateVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vacancyData: any) => void;
}

export const CreateVacancyModal: React.FC<CreateVacancyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Master Data Options
  const roleOptions = (MASTER_DATA['roles'] || []).map((r) => ({ value: r.name, label: `${r.name} (${r.code || '—'})` }));
  const expOptions = (MASTER_DATA['experiences'] || []).map((e) => ({ value: e.name, label: e.name }));
  const deptOptions = (MASTER_DATA['departments'] || []).map((d) => ({ value: d.name, label: d.name }));
  const empTypeOptions = (MASTER_DATA['employmentTypes'] || []).map((et) => ({ value: et.name, label: et.name }));
  const hiringLocOptions = (MASTER_DATA['hiringLocations'] || []).map((hl) => ({ value: hl.name, label: `${hl.name} (${hl.code || '—'})` }));
  const testLocOptions = (MASTER_DATA['testLocations'] || []).map((tl) => ({ value: tl.name, label: `${tl.name} (${tl.code || '—'})` }));
  const userOptions = USERS_MOCK.map((u) => ({ value: u.name, label: `${u.name} — ${u.role} (${u.department})` }));

  // Form State
  const [title, setTitle] = useState('');
  const [driveType, setDriveType] = useState<'Walk-in Drive' | 'Direct / Sourced Hiring'>('Walk-in Drive');
  const [role, setRole] = useState(roleOptions[0]?.value || 'Senior Frontend Engineer');
  const [department, setDepartment] = useState(deptOptions[0]?.value || 'Engineering');
  const [openPositions, setOpenPositions] = useState(5);

  const [experience, setExperience] = useState(expOptions[2]?.value || 'Mid-Senior (4–7 Years)');
  const [employmentType, setEmploymentType] = useState(empTypeOptions[0]?.value || 'Full-Time Permanent');
  const [workMode, setWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [closingDate, setClosingDate] = useState('2026-08-30');

  const [hiringLocation, setHiringLocation] = useState(hiringLocOptions[1]?.value || 'Pune Tech Park');
  const [testLocation, setTestLocation] = useState(testLocOptions[1]?.value || 'Pune Assessment Hub');
  const [assignedRecruiter, setAssignedRecruiter] = useState(userOptions[0]?.value || 'Aditya Bhange');
  const [hiringManager, setHiringManager] = useState(userOptions[1]?.value || 'Rajesh Sharma');

  const [questionPaperTitle, setQuestionPaperTitle] = useState('Advanced React 19 & TypeScript Enterprise Paper A');
  const [assessmentDurationMinutes, setAssessmentDurationMinutes] = useState(60);
  const [passingCriteriaPercentage, setPassingCriteriaPercentage] = useState(70);
  const [walkInEnabled, setWalkInEnabled] = useState(true);
  const [walkInName, setWalkInName] = useState('Pune Walk-in Drive 2026');

  const [status, setStatus] = useState<'Open' | 'Draft'>('Open');

  if (!isOpen) return null;

  const STEPS = [
    { num: 1, title: 'Basic Information & Drive Type' },
    { num: 2, title: 'Experience & Contract' },
    { num: 3, title: 'Locations & Team' },
    { num: 4, title: 'Assessment & Drives' },
    { num: 5, title: 'Review & Publish' },
  ];

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      alert('Please enter a Vacancy Title.');
      return;
    }
    if (step < 5) setStep((s) => (s + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'New Vacancy',
      driveType,
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
      walkInEnabled: driveType === 'Walk-in Drive',
      walkInName,
      status,
      closingDate,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-2xl)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-default)] bg-[var(--surface-1)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/20 shadow-2xs">
              <Icon name="briefcase" size="md" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
                Create Enterprise Vacancy
              </h2>
              <p className="text-[12px] text-[var(--text-tertiary)] font-sans mt-0.5">
                Configure Walk-in Drive or Direct / Sourced Candidate hiring workflow linked to Master Data.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Icon name="x" size="xs" />
          </button>
        </div>

        {/* Progress Segments Bar (5 Steps) */}
        <div className="px-5 pt-4 pb-2 bg-[var(--surface-2)]/40 border-b border-[var(--border-default)] shrink-0">
          <div className="space-y-2 p-3.5 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-indigo-50/60 shadow-xs">
            <div className="flex items-center justify-between text-[12.5px] font-bold">
              <span className="text-[var(--text-primary)] font-heading flex items-center gap-2">
                <span className="w-5.5 h-5.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                  {step}
                </span>
                <span>Step {step} of 5:</span>
                <span className="font-extrabold text-indigo-600 font-sans">
                  {STEPS[step - 1].title}
                </span>
              </span>
              <span className="text-[11px] font-mono font-bold text-purple-600">
                {step * 20}% Complete
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 h-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i <= step
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xs'
                      : 'bg-[var(--border-default)]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Step Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-step flex-1 space-y-4 max-h-[60vh]">
          {/* STEP 1: Basic Information & Drive Type */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                  Vacancy Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React / Next.js Architect"
                  className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>

              {/* Drive Type Selector Cards */}
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1.5">
                  Recruitment Model & Drive Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDriveType('Walk-in Drive')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      driveType === 'Walk-in Drive'
                        ? 'border-[var(--accent-indigo)] bg-indigo-50/50 shadow-2xs'
                        : 'border-[var(--border-default)] bg-[var(--surface-2)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Icon name="grid" size="xs" />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-[var(--text-primary)] block font-heading">
                        Walk-in Drive
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">
                        QR Registration poster, live scanner stream, dynamic flow versions V1/V2
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setDriveType('Direct / Sourced Hiring')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      driveType === 'Direct / Sourced Hiring'
                        ? 'border-[var(--accent-indigo)] bg-indigo-50/50 shadow-2xs'
                        : 'border-[var(--border-default)] bg-[var(--surface-2)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Icon name="users" size="xs" />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-[var(--text-primary)] block font-heading">
                        Direct / Sourced Hiring
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">
                        HR resume screening queue, bulk excel candidate import, direct panel slots
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Job Role (From Master Data) *
                  </label>
                  <CustomSelect
                    label="Role"
                    value={role}
                    options={roleOptions}
                    onChange={(val) => setRole(val || roleOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Department (From Master Data) *
                  </label>
                  <CustomSelect
                    label="Department"
                    value={department}
                    options={deptOptions}
                    onChange={(val) => setDepartment(val || deptOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                  Open Positions *
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={openPositions}
                  onChange={(e) => setOpenPositions(parseInt(e.target.value) || 1)}
                  className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Experience & Contract Terms */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Experience Tier (From Master Data) *
                  </label>
                  <CustomSelect
                    label="Experience Tier"
                    value={experience}
                    options={expOptions}
                    onChange={(val) => setExperience(val || expOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Employment Type (From Master Data) *
                  </label>
                  <CustomSelect
                    label="Employment Type"
                    value={employmentType}
                    options={empTypeOptions}
                    onChange={(val) => setEmploymentType(val || empTypeOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Work Mode *
                  </label>
                  <CustomSelect
                    label="Work Mode"
                    value={workMode}
                    options={[
                      { value: 'Hybrid', label: 'Hybrid (On-site + Remote)' },
                      { value: 'On-site', label: 'On-site Office Only' },
                      { value: 'Remote', label: 'Full Remote' },
                    ]}
                    onChange={(val) => setWorkMode((val || 'Hybrid') as any)}
                    widthClass="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Target Closing Date
                  </label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hiring & Assessment Locations */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Primary Hiring Location (Master Data) *
                  </label>
                  <CustomSelect
                    label="Hiring Location"
                    value={hiringLocation}
                    options={hiringLocOptions}
                    onChange={(val) => setHiringLocation(val || hiringLocOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Test & Assessment Center (Master Data) *
                  </label>
                  <CustomSelect
                    label="Test Location"
                    value={testLocation}
                    options={testLocOptions}
                    onChange={(val) => setTestLocation(val || testLocOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Assigned Recruiter *
                  </label>
                  <CustomSelect
                    label="Assigned Recruiter"
                    value={assignedRecruiter}
                    options={userOptions}
                    onChange={(val) => setAssignedRecruiter(val || userOptions[0]?.value)}
                    widthClass="w-full"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Hiring Manager *
                  </label>
                  <CustomSelect
                    label="Hiring Manager"
                    value={hiringManager}
                    options={userOptions}
                    onChange={(val) => setHiringManager(val || userOptions[1]?.value)}
                    widthClass="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Assessment & Walk-in Drive Config */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                  Assigned Question Paper Title
                </label>
                <input
                  type="text"
                  value={questionPaperTitle}
                  onChange={(e) => setQuestionPaperTitle(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={assessmentDurationMinutes}
                    onChange={(e) => setAssessmentDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] font-mono text-[12.5px] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Passing Cutoff (%)
                  </label>
                  <input
                    type="number"
                    value={passingCriteriaPercentage}
                    onChange={(e) => setPassingCriteriaPercentage(parseInt(e.target.value) || 70)}
                    className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] font-mono text-[12.5px] outline-none"
                  />
                </div>
              </div>

              {driveType === 'Walk-in Drive' && (
                <div className="p-3 bg-[var(--surface-2)] rounded-lg border border-[var(--border-default)] flex items-center justify-between">
                  <div>
                    <span className="text-[12.5px] font-bold text-[var(--text-primary)] block">Enable Walk-in Drive & QR Generator</span>
                    <span className="text-[11px] text-[var(--text-tertiary)] block">Generate candidate QR registration poster</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={walkInEnabled}
                    onChange={(e) => setWalkInEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent-indigo)] cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Publish */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                  <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">{title || 'Untitled Vacancy'}</h4>
                  <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {driveType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div><span className="text-[var(--text-tertiary)]">Job Role:</span> <strong className="text-[var(--text-primary)]">{role}</strong></div>
                  <div><span className="text-[var(--text-tertiary)]">Department:</span> <strong className="text-[var(--text-primary)]">{department}</strong></div>
                  <div><span className="text-[var(--text-tertiary)]">Experience:</span> <strong className="text-[var(--text-primary)]">{experience}</strong></div>
                  <div><span className="text-[var(--text-tertiary)]">Employment:</span> <strong className="text-[var(--text-primary)]">{employmentType}</strong></div>
                  <div><span className="text-[var(--text-tertiary)]">Hiring Location:</span> <strong className="text-[var(--text-primary)]">{hiringLocation}</strong></div>
                  <div><span className="text-[var(--text-tertiary)]">Test Center:</span> <strong className="text-[var(--text-primary)]">{testLocation}</strong></div>
                </div>
              </div>

              <div>
                <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                  Publishing Status
                </label>
                <CustomSelect
                  label="Publish Status"
                  value={status}
                  options={[
                    { value: 'Open', label: 'Open (Publish Immediately)' },
                    { value: 'Draft', label: 'Draft (Save as Draft)' },
                  ]}
                  onChange={(val) => setStatus((val || 'Open') as any)}
                  widthClass="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer 50/50 Buttons */}
        <div className="px-5 py-4 bg-[var(--surface-1)] border-t border-[var(--border-default)] shrink-0">
          <div className="grid grid-cols-2 gap-3 w-full">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer select-none w-full"
              >
                <Icon name="chevron-left" size="xs" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer select-none w-full"
              >
                <span>Cancel</span>
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 cursor-pointer select-none w-full"
              >
                <span>Next Step</span>
                <Icon name="chevron-right" size="xs" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="h-11 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 cursor-pointer select-none w-full"
              >
                <Icon name="check" size="xs" />
                <span>Publish Vacancy</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
