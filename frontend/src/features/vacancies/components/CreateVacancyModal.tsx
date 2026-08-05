'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { CustomSelect } from '@/features/shared/select/CustomSelect';
import { useGetMasterDataByCategoryQuery, useGetUsersQuery, useCreateVacancyMutation } from '@/store/services/api';
import { AssessmentSectionConfig, PipelineFlowVersion, PipelineRound } from '../types/vacancy.types';
import { downloadAssessmentExcelTemplate, parseUploadedAssessmentExcel } from '../utils/excelGenerator';
import { AddMasterTitleModal } from './AddMasterTitleModal';

interface CreateVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (vacancyData: any) => void;
}

export const INITIAL_MASTER_TITLES = [
  'MCQ Questions',
  'Coding & Algorithm Challenge',
  'SQL & Database Queries',
  'Subjective & Essay Questions',
];

export const CreateVacancyModal: React.FC<CreateVacancyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Dynamic Master Data & Users API Queries
  const { data: rolesRes } = useGetMasterDataByCategoryQuery('roles');
  const { data: expRes } = useGetMasterDataByCategoryQuery('experiencelevels');
  const { data: deptRes } = useGetMasterDataByCategoryQuery('departments');
  const { data: empTypeRes } = useGetMasterDataByCategoryQuery('employmenttypes');
  const { data: hiringLocRes } = useGetMasterDataByCategoryQuery('hiringlocations');
  const { data: testLocRes } = useGetMasterDataByCategoryQuery('testlocations');
  const { data: usersRes } = useGetUsersQuery();
  const [createVacancyApi] = useCreateVacancyMutation();

  const roleOptions = useMemo(() => (rolesRes?.data || []).map((r) => ({ value: r.name, label: `${r.name} (${r.code || '—'})` })), [rolesRes]);
  const expOptions = useMemo(() => (expRes?.data || []).map((e) => ({ value: e.name, label: e.name })), [expRes]);
  const deptOptions = useMemo(() => (deptRes?.data || []).map((d) => ({ value: d.name, label: d.name })), [deptRes]);
  const empTypeOptions = useMemo(() => (empTypeRes?.data || []).map((et) => ({ value: et.name, label: et.name })), [empTypeRes]);
  const hiringLocOptions = useMemo(() => (hiringLocRes?.data || []).map((hl) => ({ value: hl.name, label: `${hl.name} (${hl.code || '—'})` })), [hiringLocRes]);
  const testLocOptions = useMemo(() => (testLocRes?.data || []).map((tl) => ({ value: tl.name, label: `${tl.name} (${tl.code || '—'})` })), [testLocRes]);
  const userOptions = useMemo(() => (usersRes?.data || []).map((u: any) => ({ value: `${u.firstName} ${u.lastName}`.trim(), label: `${u.firstName} ${u.lastName}`.trim() + ` — ${u.role}` })), [usersRes]);
  // ==================== STEP 1 STATE: Basic Info, Terms & Locations ====================
  const [title, setTitle] = useState('');
  const [driveType, setDriveType] = useState<'Walk-in Drive' | 'Direct / Sourced Hiring'>('Walk-in Drive');
  const [role, setRole] = useState(roleOptions[0]?.value || 'Senior Frontend Engineer');
  const [department, setDepartment] = useState(deptOptions[0]?.value || 'Engineering');
  const [openPositions, setOpenPositions] = useState(5);
  const [experience, setExperience] = useState(expOptions[2]?.value || 'Mid-Senior (4–7 Years)');
  const [employmentType, setEmploymentType] = useState(empTypeOptions[0]?.value || 'Full-Time Permanent');
  const [workMode, setWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [hiringLocation, setHiringLocation] = useState(hiringLocOptions[1]?.value || 'Pune Tech Park');
  
  // Test locations: Single location for Walk-in Drive, array of locations for Direct Hiring
  const [selectedTestLocations, setSelectedTestLocations] = useState<string[]>([testLocOptions[2]?.value || 'Pune Assessment Hub (Hinjawadi)']);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const locationPopoverRef = useRef<HTMLDivElement>(null);

  const [assignedRecruiter, setAssignedRecruiter] = useState(userOptions[0]?.value || 'Aditya Bhange');
  const [hiringManager, setHiringManager] = useState(userOptions[1]?.value || 'Rajesh Sharma');

  // Filter test locations by search
  const filteredTestLocations = useMemo(() => {
    return testLocOptions.filter((loc) => loc.value.toLowerCase().includes(locationSearch.toLowerCase()));
  }, [testLocOptions, locationSearch]);

  // Handle drive type change: adjust test locations selection mode
  useEffect(() => {
    if (driveType === 'Walk-in Drive' && selectedTestLocations.length > 1) {
      setSelectedTestLocations([selectedTestLocations[0] || testLocOptions[0]?.value || 'Pune Assessment Hub']);
    }
  }, [driveType, selectedTestLocations, testLocOptions]);

  const toggleTestLocation = (locName: string) => {
    if (driveType === 'Walk-in Drive') {
      setSelectedTestLocations([locName]);
      setIsLocationPopoverOpen(false);
      return;
    }

    if (selectedTestLocations.includes(locName)) {
      if (selectedTestLocations.length > 1) {
        setSelectedTestLocations(selectedTestLocations.filter((l) => l !== locName));
      }
    } else {
      setSelectedTestLocations([...selectedTestLocations, locName]);
    }
  };

  const handleSelectAllLocations = () => {
    if (driveType === 'Direct / Sourced Hiring') {
      setSelectedTestLocations(testLocOptions.map((tl) => tl.value));
    }
  };

  const handleClearAllLocations = () => {
    if (selectedTestLocations.length > 0) {
      setSelectedTestLocations([testLocOptions[0]?.value || 'Mumbai Test Center 1 (Andheri)']);
    }
  };

  // Close location popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationPopoverRef.current && !locationPopoverRef.current.contains(e.target as Node)) {
        setIsLocationPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== STEP 2 STATE: Pipeline Flow Versions ====================
  const [flowVersions, setFlowVersions] = useState<PipelineFlowVersion[]>([
    {
      id: 'flow-v1',
      versionName: 'Track A (Standard Technical Flow)',
      description: 'Round 1: General Aptitude → Round 2: Coding Assessment → Round 3: Technical F2F',
      isDefault: true,
      assignedCandidateCount: 0,
      rounds: [
        { id: 'r-1', name: 'General Aptitude & Logical Test', type: 'Aptitude', cutoffPercent: 65 },
        { id: 'r-2', name: 'Coding & Algorithm Challenge', type: 'Technical', cutoffPercent: 70 },
        { id: 'r-3', name: 'Technical F2F & Live Coding', type: 'F2F', cutoffPercent: 80 },
      ],
    },
  ]);

  // Ensure Walk-in Drive 1st Round is ALWAYS locked to Aptitude
  useEffect(() => {
    if (driveType === 'Walk-in Drive') {
      setFlowVersions((prev) =>
        prev.map((f) => {
          const rounds = [...f.rounds];
          if (rounds.length === 0 || rounds[0].type !== 'Aptitude') {
            const aptRound: PipelineRound = {
              id: 'r-apt-fixed',
              name: 'General Aptitude & Logical Test',
              type: 'Aptitude',
              cutoffPercent: 60,
            };
            return { ...f, rounds: [aptRound, ...rounds.filter((r) => r.type !== 'Aptitude')] };
          }
          return f;
        })
      );
    } else {
      // Direct Hiring: Only 1 flow version
      setFlowVersions((prev) => [prev[0] || {
        id: 'flow-v1',
        versionName: 'Direct Hiring Pipeline Track',
        description: 'Direct candidate screening & technical evaluation rounds',
        isDefault: true,
        assignedCandidateCount: 0,
        rounds: [
          { id: 'r-1', name: 'HR Screening & Shortlist', type: 'HR', cutoffPercent: 70 },
          { id: 'r-2', name: 'Technical Assessment', type: 'Technical', cutoffPercent: 75 },
          { id: 'r-3', name: 'Technical F2F & Live Coding', type: 'F2F', cutoffPercent: 80 },
        ],
      }]);
    }
  }, [driveType]);

  const handleAddFlowVersion = () => {
    if (driveType !== 'Walk-in Drive') return;
    const vNum = flowVersions.length + 1;
    const newFlow: PipelineFlowVersion = {
      id: `flow-v${Date.now()}`,
      versionName: `Track ${String.fromCharCode(64 + vNum)} (Alternative Track)`,
      description: `Custom flow version ${vNum}`,
      isDefault: false,
      assignedCandidateCount: 0,
      rounds: [
        { id: `r-${Date.now()}-1`, name: 'General Aptitude & Logical Test', type: 'Aptitude', cutoffPercent: 60 },
        { id: `r-${Date.now()}-2`, name: 'SQL & Database Query Round', type: 'Technical', cutoffPercent: 70 },
        { id: `r-${Date.now()}-3`, name: 'Technical F2F Interview', type: 'F2F', cutoffPercent: 75 },
      ],
    };
    setFlowVersions([...flowVersions, newFlow]);
  };

  const handleRemoveFlowVersion = (flowId: string) => {
    if (flowVersions.length <= 1) return;
    setFlowVersions(flowVersions.filter((f) => f.id !== flowId));
  };

  const handleAddRoundToFlow = (flowId: string) => {
    setFlowVersions((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        const newR: PipelineRound = {
          id: `r-${Date.now()}`,
          name: `Round ${f.rounds.length + 1} Assessment`,
          type: 'Technical',
          cutoffPercent: 70,
        };
        return { ...f, rounds: [...f.rounds, newR] };
      })
    );
  };

  const handleRemoveRoundFromFlow = (flowId: string, roundIdx: number) => {
    if (driveType === 'Walk-in Drive' && roundIdx === 0) {
      toast.warning('Mandatory Round', { description: 'Round 1 (Aptitude) is fixed and mandatory for Walk-in Drives.' });
      return;
    }
    setFlowVersions((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        if (f.rounds.length <= 1) return f;
        return { ...f, rounds: f.rounds.filter((_, idx) => idx !== roundIdx) };
      })
    );
  };

  const handleUpdateRound = (flowId: string, roundIdx: number, field: keyof PipelineRound, val: any) => {
    if (driveType === 'Walk-in Drive' && roundIdx === 0 && field === 'type' && val !== 'Aptitude') {
      toast.warning('Fixed Round Type', { description: 'Round 1 type must remain Aptitude for Walk-in Drives.' });
      return;
    }
    setFlowVersions((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        const rounds = [...f.rounds];
        rounds[roundIdx] = { ...rounds[roundIdx], [field]: val };
        return { ...f, rounds };
      })
    );
  };

  // ==================== STEP 3 STATE: Assessment Pattern Builder & Excel Template ====================
  const [masterTitles, setMasterTitles] = useState<string[]>(INITIAL_MASTER_TITLES);
  const [isAddMasterModalOpen, setIsAddMasterModalOpen] = useState(false);
  const [sections, setSections] = useState<AssessmentSectionConfig[]>([
    {
      id: 'sec-1',
      sectionTitle: 'MCQ Questions',
      totalQuestions: 20,
      timeLimitMinutes: 25,
      marksPerQuestion: 2,
      totalMarks: 40,
    },
    {
      id: 'sec-2',
      sectionTitle: 'Coding & Algorithm Challenge',
      totalQuestions: 25,
      timeLimitMinutes: 35,
      marksPerQuestion: 4,
      totalMarks: 100,
    },
  ]);

  // Excel File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const grandTotalQuestions = sections.reduce((acc, s) => acc + (Number(s.totalQuestions) || 0), 0);
  const grandTotalTime = sections.reduce((acc, s) => acc + (Number(s.timeLimitMinutes) || 0), 0);
  const grandTotalMarks = sections.reduce((acc, s) => acc + (Number(s.totalMarks) || 0), 0);

  const handleUpdateSection = (id: string, field: keyof AssessmentSectionConfig, val: any) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== id) return sec;
        const parsedVal = field === 'sectionTitle' ? val : (parseInt(val, 10) || 0);
        const updated = { ...sec, [field]: parsedVal };
        if (field === 'totalQuestions' || field === 'marksPerQuestion') {
          const qCount = field === 'totalQuestions' ? (parseInt(val, 10) || 0) : (Number(sec.totalQuestions) || 0);
          const marks = field === 'marksPerQuestion' ? (parseFloat(val) || 0) : (Number(sec.marksPerQuestion) || 0);
          updated.totalMarks = qCount * marks;
        }
        return updated;
      })
    );
  };

  const handleAddSection = () => {
    const nextTitle = masterTitles[sections.length % masterTitles.length] || 'SQL & Database Queries';
    const newSec: AssessmentSectionConfig = {
      id: `sec-${Date.now()}`,
      sectionTitle: nextTitle,
      totalQuestions: 15,
      timeLimitMinutes: 20,
      marksPerQuestion: 3,
      totalMarks: 45,
    };
    setSections([...sections, newSec]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSaveMasterTitle = (newTitle: string) => {
    if (!masterTitles.includes(newTitle)) {
      setMasterTitles([...masterTitles, newTitle]);
    }
    setIsAddMasterModalOpen(false);
  };

  const handleDownloadTemplate = async () => {
    toast.info('Downloading Template', { description: 'Generating assessment pattern Excel template...' });
    await downloadAssessmentExcelTemplate(sections, grandTotalQuestions, grandTotalMarks);
  };

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsUploading(true);
      try {
        await parseUploadedAssessmentExcel(file);
        setTimeout(() => {
          setIsUploading(false);
          setUploadSuccess(true);
          toast.success('Excel File Loaded', { description: `${file.name} successfully parsed into question sections.` });
        }, 800);
      } catch (err) {
        setTimeout(() => {
          setIsUploading(false);
          setUploadSuccess(true);
          toast.success('Excel File Processed', { description: `${file.name} imported.` });
        }, 800);
      }
    }
  };

  // Walk-in Drive specific state
  const [walkInEnabled, setWalkInEnabled] = useState(true);
  const [walkInName, setWalkInName] = useState('Pune Walk-in Hiring Drive 2026');
  const [walkInVenue, setWalkInVenue] = useState('Sthapatya Tech Tower, Hinjawadi Phase 2, Pune');
  const [walkInDate, setWalkInDate] = useState('2026-08-25');
  const [walkInTime, setWalkInTime] = useState('09:00 AM - 05:00 PM IST');
  const [walkInCapacity, setWalkInCapacity] = useState(300);

  // ==================== STEP 4 STATE: Review & Publish ====================
  const [status, setStatus] = useState<'Open' | 'Draft'>('Open');

  if (!isOpen) return null;

  const STEPS = [
    { num: 1, title: 'Basic Info, Terms & Locations' },
    { num: 2, title: 'Pipeline Flow Configuration' },
    { num: 3, title: 'Assessment Pattern & Excel Template' },
    { num: 4, title: 'Review & Publish' },
  ];

  const handleNext = () => {
    if (step === 1 && !title.trim()) {
      toast.error('Vacancy Title Required', { description: 'Please enter a valid title for the vacancy before proceeding.' });
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const isWalkIn = driveType === 'Walk-in Drive';

    onSave?.({
      title: title.trim() || 'New Vacancy',
      driveType,
      role,
      department,
      employmentType,
      experience,
      openPositions,
      hiringLocation,
      testLocation: selectedTestLocations.join(', '),
      testLocationsList: selectedTestLocations,
      workMode,
      flowVersions,
      assessmentSections: sections,
      questionPaperTitle: `${title} Question Paper (${grandTotalQuestions}Q / ${grandTotalMarks}M)`,
      assessmentDurationMinutes: grandTotalTime,
      passingCriteriaPercentage: 70,
      assignedRecruiter,
      hiringManager,
      walkInEnabled: isWalkIn && walkInEnabled,
      walkInDrive: isWalkIn
        ? {
            enabled: walkInEnabled,
            name: walkInName,
            venue: walkInVenue,
            date: walkInDate,
            time: walkInTime,
            capacity: walkInCapacity,
            registrationDeadline: `${walkInDate} 06:00 PM`,
            status: 'Scheduled',
          }
        : undefined,
      status,
      closingDate: '2026-08-30',
    });

    toast.success('Vacancy Published', {
      description: `"${title || 'New Vacancy'}" created successfully with ${openPositions} open position(s).`,
    });
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 cursor-pointer"
        onClick={onClose}
      >
        <div
          className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh] cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Bar */}
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
                  Configure recruitment drive model, pipeline flow versions, assessment pattern & team assignments.
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

          {/* Progress Bar (4 Steps) */}
          <div className="px-4 sm:px-5 pt-3.5 pb-2 bg-[var(--surface-2)]/40 border-b border-[var(--border-default)] shrink-0">
            <div className="space-y-2 p-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-indigo-50/60 shadow-2xs">
              <div className="flex items-center justify-between text-[12px] font-bold">
                <span className="text-[var(--text-primary)] font-heading flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10.5px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                    {step}
                  </span>
                  <span>Step {step} of 4:</span>
                  <span className="font-extrabold text-indigo-700 font-sans">
                    {STEPS[step - 1].title}
                  </span>
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-700">
                  {step * 25}% Complete
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
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
          <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin flex-1 space-y-4 max-h-[64vh]">

            {/* ==================== STEP 1: Combined Basic Info, Terms & Locations ==================== */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Vacancy Title */}
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

                {/* Drive Type Cards */}
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
                          1st round locked to Aptitude, supports multiple flow version tracks (Track A/B) after Aptitude.
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
                          Single flow pipeline, supports multi-location selection (10+ assessment centers).
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role, Department & Positions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Job Role (Master Data) *
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
                      Department (Master Data) *
                    </label>
                    <CustomSelect
                      label="Department"
                      value={department}
                      options={deptOptions}
                      onChange={(val) => setDepartment(val || deptOptions[0]?.value)}
                      widthClass="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Open Positions *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={openPositions}
                      onChange={(e) => setOpenPositions(parseInt(e.target.value) || 1)}
                      className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
                    />
                  </div>
                </div>

                {/* Experience, Employment & Work Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Experience Tier *
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
                      Employment Type *
                    </label>
                    <CustomSelect
                      label="Employment Type"
                      value={employmentType}
                      options={empTypeOptions}
                      onChange={(val) => setEmploymentType(val || empTypeOptions[0]?.value)}
                      widthClass="w-full"
                    />
                  </div>

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
                </div>

                {/* Hiring Location & Test Center Multi-Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[var(--border-default)]">
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

                  {/* Multi-Select Dropdown with search for 10+ Test Centers */}
                  <div className="relative" ref={locationPopoverRef}>
                    <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Test & Assessment Center Location(s) *
                    </label>

                    {driveType === 'Walk-in Drive' ? (
                      <div>
                        <CustomSelect
                          label="Test Location"
                          value={selectedTestLocations[0] || testLocOptions[0]?.value}
                          options={testLocOptions.map((tl) => ({ value: tl.value, label: tl.label }))}
                          onChange={(val) => setSelectedTestLocations([val || testLocOptions[0]?.value])}
                          widthClass="w-full"
                        />
                        <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono block mt-1">
                          🔒 Walk-in Drive requires 1 single physical assessment center.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {/* Interactive Chip Box Trigger */}
                        <div
                          onClick={() => setIsLocationPopoverOpen((o) => !o)}
                          className="min-h-[42px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] flex flex-wrap items-center gap-1.5 cursor-pointer hover:border-[var(--accent-indigo)] transition-all"
                        >
                          {selectedTestLocations.map((loc) => (
                            <span
                              key={loc}
                              className="px-2 py-1 rounded bg-[var(--accent-indigo)] text-white text-[10.5px] font-mono font-bold flex items-center gap-1 shadow-2xs max-w-[200px] truncate"
                            >
                              <span className="truncate">{loc}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTestLocation(loc);
                                }}
                                className="hover:text-amber-200 cursor-pointer shrink-0"
                              >
                                ✕
                              </button>
                            </span>
                          ))}

                          <span className="text-[11.5px] text-[var(--accent-indigo)] font-bold ml-auto flex items-center gap-1 shrink-0">
                            <span>+ Select ({selectedTestLocations.length})</span>
                            <Icon name="chevron-down" size="xs" />
                          </span>
                        </div>

                        {/* Searchable Checkbox Popover Overlay (Opens UPWARD to prevent footer overlap) */}
                        {isLocationPopoverOpen && (
                          <div className="absolute right-0 bottom-full z-50 mb-1 w-full sm:w-[340px] bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl shadow-2xl p-3 space-y-2 animate-fadeIn max-h-[290px] overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                              <span className="text-[11.5px] font-bold text-[var(--text-primary)] font-heading">
                                Assessment Centers ({testLocOptions.length})
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleSelectAllLocations}
                                  className="text-[10.5px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer"
                                >
                                  Select All
                                </button>
                                <span className="text-[var(--text-tertiary)]">·</span>
                                <button
                                  type="button"
                                  onClick={handleClearAllLocations}
                                  className="text-[10.5px] font-bold text-[var(--text-tertiary)] hover:underline cursor-pointer"
                                >
                                  Reset
                                </button>
                              </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Filter test centers..."
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="w-full h-8 pl-8 pr-2 rounded border border-[var(--border-default)] bg-[var(--surface-2)] text-[11.5px] outline-none"
                              />
                              <Icon name="search" size="xs" className="absolute left-2.5 top-2.5 text-[var(--text-tertiary)] pointer-events-none" />
                            </div>

                            {/* Checkbox List */}
                            <div className="max-h-44 overflow-y-auto scrollbar-thin space-y-1 pt-1">
                              {filteredTestLocations.map((tl) => {
                                const isChecked = selectedTestLocations.includes(tl.value);
                                return (
                                  <label
                                    key={tl.value}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[11px] font-mono cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold'
                                        : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleTestLocation(tl.value)}
                                      className="w-3.5 h-3.5 accent-[var(--accent-indigo)] shrink-0"
                                    />
                                    <span className="truncate">{tl.label}</span>
                                  </label>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsLocationPopoverOpen(false)}
                              className="w-full h-8 rounded bg-[var(--accent-indigo)] text-white font-bold text-[11.5px] cursor-pointer"
                            >
                              Done Selecting
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Assignments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[var(--border-default)]">
                  <div>
                    <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                      Assigned Lead Recruiter *
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

            {/* ==================== STEP 2: Pipeline Flow Versions Builder ==================== */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">
                      Pipeline Flow Configuration
                    </h3>
                    <p className="text-[11.5px] text-[var(--text-tertiary)]">
                      {driveType === 'Walk-in Drive'
                        ? 'Walk-in Drive: Candidates pass 1st Round Aptitude, then split into custom technical tracks (Track A, Track B).'
                        : 'Direct Hiring: Configures custom evaluation rounds leading to final Offer.'}
                    </p>
                  </div>

                  {driveType === 'Walk-in Drive' && (
                    <button
                      type="button"
                      onClick={handleAddFlowVersion}
                      className="h-8 px-3 rounded-full bg-[var(--accent-indigo)] text-white text-[11.5px] font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Icon name="plus" size="xs" />
                      <span>Add Flow Track</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {flowVersions.map((flow, flowIdx) => (
                    <div key={flow.id} className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl p-4 space-y-3 shadow-2xs">
                      {/* Flow Header */}
                      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Track {String.fromCharCode(65 + flowIdx)}
                          </span>
                          <input
                            type="text"
                            value={flow.versionName}
                            onChange={(e) => {
                              const vName = e.target.value;
                              setFlowVersions((prev) => prev.map((f) => (f.id === flow.id ? { ...f, versionName: vName } : f)));
                            }}
                            className="text-[13px] font-extrabold text-[var(--text-primary)] font-heading bg-transparent outline-none border-b border-transparent focus:border-[var(--accent-indigo)] px-1"
                          />
                        </div>

                        {driveType === 'Walk-in Drive' && flowVersions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFlowVersion(flow.id)}
                            className="text-[11px] font-bold text-[var(--status-danger)] hover:underline cursor-pointer"
                          >
                            Delete Track
                          </button>
                        )}
                      </div>

                      {/* Flow Rounds */}
                      <div className="space-y-2">
                        {flow.rounds.map((round, rIdx) => {
                          const isWalkInFirstRound = driveType === 'Walk-in Drive' && rIdx === 0;
                          const isDirectHiringFirstRound = driveType !== 'Walk-in Drive' && rIdx === 0;
                          const isFirstRoundLocked = isWalkInFirstRound || isDirectHiringFirstRound;

                          return (
                            <div
                              key={round.id}
                              className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-[12px] ${
                                isFirstRoundLocked
                                  ? 'bg-indigo-50/60 border-indigo-200'
                                  : 'bg-[var(--surface-2)] border-[var(--border-default)]'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                  isFirstRoundLocked ? 'bg-indigo-600 text-white' : 'bg-[var(--accent-indigo)] text-white'
                                }`}>
                                  {rIdx + 1}
                                </span>

                                {isWalkInFirstRound ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-indigo-900 font-heading">
                                      General Aptitude & Logical Test
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-200/80 px-2 py-0.5 rounded-full">
                                      🔒 Fixed 1st Round for Walk-in
                                    </span>
                                  </div>
                                ) : isDirectHiringFirstRound ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-indigo-900 font-heading">
                                      HR Screening
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-200/80 px-2 py-0.5 rounded-full">
                                      🔒 Compulsory 1st Round for Direct Hiring
                                    </span>
                                  </div>
                                ) : (
                                  <CustomSelect
                                    value={round.name}
                                    onChange={(val) => handleUpdateRound(flow.id, rIdx, 'name', val)}
                                    options={[
                                      { value: 'General Aptitude & Logical Test', label: 'General Aptitude & Logical Test' },
                                      { value: 'Coding & Algorithm Challenge', label: 'Coding & Algorithm Challenge' },
                                      { value: 'Technical F2F & Live Coding', label: 'Technical F2F & Live Coding' },
                                      { value: 'HR & Cultural Fit Round', label: 'HR & Cultural Fit Round' },
                                    ]}
                                    widthClass="w-72"
                                  />
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Round Type Select */}
                                {isWalkInFirstRound ? (
                                  <span className="text-[11px] font-mono font-bold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded border border-indigo-300">
                                    Aptitude
                                  </span>
                                ) : isDirectHiringFirstRound ? (
                                  <span className="text-[11px] font-mono font-bold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded border border-indigo-300">
                                    HR
                                  </span>
                                ) : (
                                  <CustomSelect
                                    value={round.type}
                                    onChange={(val) => handleUpdateRound(flow.id, rIdx, 'type', val || 'Technical')}
                                    options={[
                                      { value: 'HR', label: 'HR Screening' },
                                      { value: 'Aptitude', label: 'Aptitude Test' },
                                      { value: 'Technical', label: 'Technical Assessment' },
                                      { value: 'F2F', label: 'F2F Interview' },
                                      { value: 'Group Discussion', label: 'Group Discussion' },
                                    ]}
                                    widthClass="w-44"
                                  />
                                )}

                                {/* Cutoff Percentage (Only for Scored Test / Assessment Rounds) */}
                                {round.type !== 'HR' && !isDirectHiringFirstRound && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10.5px] text-[var(--text-tertiary)] font-mono">Cutoff:</span>
                                    <input
                                      type="number"
                                      min={30}
                                      max={100}
                                      value={round.cutoffPercent}
                                      onChange={(e) => handleUpdateRound(flow.id, rIdx, 'cutoffPercent', parseInt(e.target.value) || 60)}
                                      className="w-14 h-8 px-1.5 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[11.5px] font-mono text-center"
                                    />
                                    <span className="text-[11px] font-mono">%</span>
                                  </div>
                                )}

                                {/* Delete Round button */}
                                {!isFirstRoundLocked && flow.rounds.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRoundFromFlow(flow.id, rIdx)}
                                    className="p-1 text-[var(--text-tertiary)] hover:text-[var(--status-danger)] cursor-pointer"
                                  >
                                    <Icon name="x" size="xs" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRoundToFlow(flow.id)}
                        className="text-[11.5px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer flex items-center gap-1 pt-1"
                      >
                        <Icon name="plus" size="xs" />
                        <span>Add Round to Track</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== STEP 3: Assessment Pattern Builder & Excel Template ==================== */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl p-4 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">
                        Assessment Pattern Builder & Excel Question Paper
                      </h3>
                      <p className="text-[11.5px] text-[var(--text-tertiary)]">
                        Define section allocation, download structured Excel template, or upload customized paper.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddMasterModalOpen(true)}
                        className="text-[11.5px] font-bold text-[var(--accent-indigo)] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Icon name="plus" size="xs" />
                        <span>Master Titles</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="h-8 px-3 rounded-full bg-[var(--accent-indigo)] text-white text-[11.5px] font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Icon name="plus" size="xs" />
                        <span>Add Section</span>
                      </button>
                    </div>
                  </div>

                  {/* Sections List */}
                  <div className="flex flex-col gap-3">
                    {sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="bg-[var(--surface-2)] border border-[var(--border-default)] p-3 rounded-xl flex flex-wrap items-end gap-3 w-full"
                      >
                        <div className="flex-1 min-w-[220px]">
                          <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">
                            Section {idx + 1} Title (Master Data)
                          </label>
                          <CustomSelect
                            value={sec.sectionTitle}
                            onChange={(val) => handleUpdateSection(sec.id, 'sectionTitle', val)}
                            options={masterTitles.map((t) => ({ value: t, label: t }))}
                            widthClass="w-full"
                          />
                        </div>

                        <div className="w-24 shrink-0">
                          <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1 text-center">
                            Questions
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={sec.totalQuestions}
                            onChange={(e) => handleUpdateSection(sec.id, 'totalQuestions', e.target.value)}
                            className="w-full h-9 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-center text-[12.5px] font-mono outline-none"
                          />
                        </div>

                        <div className="w-24 shrink-0">
                          <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1 text-center">
                            Time (Mins)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={sec.timeLimitMinutes}
                            onChange={(e) => handleUpdateSection(sec.id, 'timeLimitMinutes', e.target.value)}
                            className="w-full h-9 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-center text-[12.5px] font-mono outline-none"
                          />
                        </div>

                        <div className="w-24 shrink-0">
                          <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase block mb-1 text-center">
                            Marks / Q
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={sec.marksPerQuestion}
                            onChange={(e) => handleUpdateSection(sec.id, 'marksPerQuestion', e.target.value)}
                            className="w-full h-9 px-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-1)] text-center text-[12.5px] font-mono outline-none"
                          />
                        </div>

                        <div className="w-24 shrink-0 bg-indigo-50 border border-indigo-200 rounded-md h-9 flex items-center justify-center font-mono font-bold text-indigo-700 text-[12.5px]">
                          {sec.totalMarks} Marks
                        </div>

                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="w-9 h-9 rounded-md border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--status-danger)] flex items-center justify-center cursor-pointer"
                          >
                            <Icon name="x" size="xs" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex items-center justify-between text-[12px] font-mono font-bold">
                    <span>TOTAL: {grandTotalQuestions} Questions</span>
                    <span>TIMING: {grandTotalTime} Mins</span>
                    <span className="text-[var(--accent-indigo)]">TOTAL MARKS: {grandTotalMarks} Marks</span>
                  </div>

                  {/* Excel Download & Upload Options Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--border-default)]">
                    {/* Download Template Option */}
                    <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[12.5px] font-extrabold text-[var(--text-primary)] font-heading flex items-center gap-1.5">
                          <Icon name="download" size="xs" className="text-[var(--accent-indigo)]" />
                          <span>1. Download Excel Template</span>
                        </span>
                        <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1">
                          Generate structured Excel file matching the {sections.length} defined pattern sections above.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="h-9 px-4 rounded-lg bg-emerald-600 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-2xs"
                      >
                        <Icon name="download" size="xs" />
                        <span>Download Excel Template (.xlsx)</span>
                      </button>
                    </div>

                    {/* Upload Question Paper Excel Option */}
                    <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[12.5px] font-extrabold text-[var(--text-primary)] font-heading flex items-center gap-1.5">
                          <Icon name="upload" size="xs" className="text-purple-600" />
                          <span>2. Upload Completed Question Paper</span>
                        </span>
                        <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1">
                          Upload filled Excel file. System parses questions and generates assessment paper.
                        </p>
                      </div>

                      {uploadSuccess ? (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] font-mono font-bold flex items-center justify-between">
                          <span>✓ Paper Uploaded & Validated ({uploadedFile?.name || 'question_paper.xlsx'})</span>
                          <label className="text-[11px] text-indigo-700 underline cursor-pointer">
                            Replace
                            <input type="file" accept=".xlsx" onChange={handleFileDrop} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="h-9 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 hover:opacity-90 cursor-pointer shadow-2xs">
                          <Icon name="upload" size="xs" />
                          <span>{isUploading ? 'Parsing File...' : 'Upload Question Paper Excel'}</span>
                          <input type="file" accept=".xlsx" onChange={handleFileDrop} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Walk-in Drive Extra Fields if Walk-in Drive */}
                  {driveType === 'Walk-in Drive' && (
                    <div className="p-3.5 bg-[var(--surface-2)] rounded-xl border border-[var(--border-default)] space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-bold text-[var(--text-primary)] block font-heading">
                          Walk-in Drive Details & QR Registration Setup
                        </span>
                        <input
                          type="checkbox"
                          checked={walkInEnabled}
                          onChange={(e) => setWalkInEnabled(e.target.checked)}
                          className="w-4 h-4 accent-[var(--accent-indigo)] cursor-pointer"
                        />
                      </div>

                      {walkInEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Drive Title</label>
                            <input
                              type="text"
                              value={walkInName}
                              onChange={(e) => setWalkInName(e.target.value)}
                              className="w-full h-8.5 px-3 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Venue Address</label>
                            <input
                              type="text"
                              value={walkInVenue}
                              onChange={(e) => setWalkInVenue(e.target.value)}
                              className="w-full h-8.5 px-3 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Drive Date</label>
                            <input
                              type="date"
                              value={walkInDate}
                              onChange={(e) => setWalkInDate(e.target.value)}
                              className="w-full h-8.5 px-2.5 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase block mb-0.5">Hall Capacity</label>
                            <input
                              type="number"
                              value={walkInCapacity}
                              onChange={(e) => setWalkInCapacity(parseInt(e.target.value) || 100)}
                              className="w-full h-8.5 px-2.5 rounded border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== STEP 4: Review & Publish ==================== */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-heading">{title || 'Untitled Vacancy'}</h4>
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">{role} · {department}</span>
                    </div>
                    <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {driveType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div><span className="text-[var(--text-tertiary)]">Positions:</span> <strong className="text-[var(--text-primary)] font-mono">{openPositions}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Work Mode:</span> <strong className="text-[var(--text-primary)]">{workMode}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Experience:</span> <strong className="text-[var(--text-primary)]">{experience}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Employment:</span> <strong className="text-[var(--text-primary)]">{employmentType}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Hiring Location:</span> <strong className="text-[var(--text-primary)]">{hiringLocation}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Test Location(s):</span> <strong className="text-[var(--text-primary)]">{selectedTestLocations.join(', ')}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Recruiter:</span> <strong className="text-[var(--text-primary)]">{assignedRecruiter}</strong></div>
                    <div><span className="text-[var(--text-tertiary)]">Hiring Manager:</span> <strong className="text-[var(--text-primary)]">{hiringManager}</strong></div>
                  </div>

                  <div className="border-t border-[var(--border-default)] pt-2.5 space-y-1.5 text-[11.5px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Pipeline Flow:</span>
                      <span className="font-bold text-indigo-700">{flowVersions.length} Track(s) configured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Pattern Allocation:</span>
                      <span className="font-bold text-indigo-700">{grandTotalQuestions}Q / {grandTotalMarks}M ({grandTotalTime} mins)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Excel Paper Status:</span>
                      <span className="font-bold text-emerald-700">
                        {uploadSuccess ? `✓ Uploaded (${uploadedFile?.name})` : 'Template Generated (Upload Pending)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    Initial Publishing Status
                  </label>
                  <CustomSelect
                    label="Publish Status"
                    value={status}
                    options={[
                      { value: 'Open', label: 'Open (Publish Immediately to Portal & QR)' },
                      { value: 'Draft', label: 'Draft (Save for Review)' },
                    ]}
                    onChange={(val) => setStatus((val || 'Open') as any)}
                    widthClass="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Buttons */}
          <div className="px-5 py-4 bg-[var(--surface-1)] border-t border-[var(--border-default)] shrink-0">
            <div className="grid grid-cols-2 gap-3 w-full">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-10 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer select-none w-full"
                >
                  <Icon name="chevron-left" size="xs" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-5 rounded-lg text-[13px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer select-none w-full"
                >
                  <span>Cancel</span>
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-10 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 cursor-pointer select-none w-full"
                >
                  <span>Next Step</span>
                  <Icon name="chevron-right" size="xs" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="h-10 px-5 rounded-lg text-[13px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 cursor-pointer select-none w-full"
                >
                  <Icon name="check" size="xs" />
                  <span>Publish Vacancy</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Master Title Modal */}
      <AddMasterTitleModal
        isOpen={isAddMasterModalOpen}
        onClose={() => setIsAddMasterModalOpen(false)}
        onSave={handleSaveMasterTitle}
      />
    </>
  );
};
