'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { getAppOrigin } from '@/lib/utils/url-helper';

export interface ScheduleTestModalProps {
  candidateId?: string;
  candidateName?: string;
  candidateCode?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  vacancyTitle?: string;
  linkedPaperTitle?: string;
  onClose: () => void;
  onScheduled?: (testDetails: {
    testMode: 'From Home' | 'In Office';
    paperTitle: string;
    scheduledDate: string;
    timeSlot: string;
    accessCode: string;
    passcode: string;
    directUrl: string;
  }) => void;
}

import { useGetMasterDataByCategoryQuery, useScheduleCandidateTestMutation } from '@/store/services/api';

const TIME_SLOT_OPTIONS = [
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
];

// ── Custom Form Select Component (Design System Token Matched) ──────────────────
const FormSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-between gap-2 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-2xs"
      >
        <span className="truncate">{selected ? selected.label : value}</span>
        <Icon
          name="chevron-down"
          size="xs"
          className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150 max-h-48 overflow-y-auto scrollbar-thin">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                opt.value === value ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Icon name="check-circle" size="xs" className="text-blue-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Custom Popover Calendar Date Picker Component (Exact Filter Bar & Candidate Profile Calendar) ──
const FormDatePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  const days = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const list: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      list.push({
        day: dayNum,
        isCurrentMonth: false,
        dateStr: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      list.push({
        day: i,
        isCurrentMonth: true,
        dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    const remaining = 35 - list.length > 0 ? 35 - list.length : 42 - list.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      list.push({
        day: i,
        isCurrentMonth: false,
        dateStr: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    return list;
  }, [viewYear, viewMonth]);

  const formattedDisplay = value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Select Date';

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-between gap-2 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-2xs"
      >
        <span className="flex items-center gap-2 font-mono font-bold text-slate-900">
          <Icon name="calendar" size="xs" className="text-blue-600 shrink-0" />
          <span>{formattedDisplay}</span>
        </span>
        <Icon
          name="chevron-down"
          size="xs"
          className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-extrabold text-xs font-heading text-slate-900">
              {monthName} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else {
                    setViewMonth((m) => m - 1);
                  }
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon name="chevron-left" size="xs" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else {
                    setViewMonth((m) => m + 1);
                  }
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon name="chevron-right" size="xs" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 py-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
            {days.map((d, idx) => {
              const isSelected = value === d.dateStr;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(d.dateStr);
                    setOpen(false);
                  }}
                  className={`h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md font-extrabold'
                      : d.isCurrentMonth
                      ? 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
                      : 'text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const ScheduleTestModal: React.FC<ScheduleTestModalProps> = ({
  candidateId = '1',
  candidateName = 'Anjali Sharma',
  candidateCode = 'CND-2026-1042',
  candidateEmail = 'anjali.sharma@email.com',
  candidatePhone = '+91 98765 43210',
  vacancyTitle = 'Frontend Developer - React (V123)',
  linkedPaperTitle = 'Advanced React 19 & Next.js Enterprise Assessment',
  onClose,
  onScheduled,
}) => {
  // ── Mode State ─────────────────────────────────────────────────────────────
  const [testMode, setTestMode] = useState<'From Home' | 'In Office'>('From Home');

  // ── Common Form Fields ──────────────────────────────────────────────────────
  const [scheduledDate, setScheduledDate] = useState('2026-08-10');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');

  // ── Home Test Credentials ───────────────────────────────────────────────────
  const [accessCode, setAccessCode] = useState(candidateCode);
  const [passcode, setPasscode] = useState('8942');

  const { data: testLocationsRes } = useGetMasterDataByCategoryQuery('testLocations');
  const officeLocationOptions = useMemo(() => {
    return (testLocationsRes?.data || []).map((tl) => ({
      value: `${tl.name} (${tl.code || 'CENTER'})`,
      label: `${tl.name} (${tl.code || 'CENTER'})`,
    }));
  }, [testLocationsRes]);

  // ── Office Test Venue ───────────────────────────────────────────────────────
  const [selectedVenue, setSelectedVenue] = useState('');

  useEffect(() => {
    if (officeLocationOptions.length > 0 && !selectedVenue) {
      setSelectedVenue(officeLocationOptions[0].value);
    }
  }, [officeLocationOptions, selectedVenue]);

  // ── Delivery Checkboxes ─────────────────────────────────────────────────────
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(true);

  // Generate Direct Links
  const origin = getAppOrigin();
  const homeExamUrl = `${origin}/exam?id=${accessCode}&mode=home`;
  const officeExamUrl = `${origin}/exam?id=${accessCode}&mode=office`;

  const [scheduleTestApi, { isLoading: isScheduling }] = useScheduleCandidateTestMutation();

  // Regenerate Passcode
  const handleRegeneratePasscode = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPasscode(newPin);
    toast.info(`Generated New Passcode: ${newPin}`);
  };

  // Submit & Schedule Action
  const handleScheduleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const startFormatted = TIME_SLOT_OPTIONS.find((t) => t.value === startTime)?.label || `${startTime} AM`;
    const endFormatted = TIME_SLOT_OPTIONS.find((t) => t.value === endTime)?.label || `${endTime} PM`;
    const timeSlotStr = `${startFormatted} - ${endFormatted}`;
    const finalUrl = testMode === 'From Home' ? homeExamUrl : officeExamUrl;

    const candIdNum = parseInt(candidateId, 10);
    if (!isNaN(candIdNum) && candIdNum > 0) {
      try {
        await scheduleTestApi({
          candidateId: candIdNum,
          testMode,
          scheduledDate,
          startTime,
          endTime,
          passcode: testMode === 'From Home' ? passcode : undefined,
        }).unwrap();

        toast.success(`Test Scheduled Successfully (${testMode})`, {
          description: `Invitation sent to ${candidateEmail}. Valid on ${scheduledDate} (${timeSlotStr}).`,
        });

        if (onScheduled) {
          onScheduled({
            testMode,
            paperTitle: linkedPaperTitle,
            scheduledDate,
            timeSlot: timeSlotStr,
            accessCode,
            passcode: testMode === 'From Home' ? passcode : 'N/A (Direct Link)',
            directUrl: finalUrl,
          });
        }

        onClose();
      } catch (err: any) {
        const errMsg = err?.data?.message || (Array.isArray(err?.data?.errors) ? err.data.errors.join(' ') : null) || 'Failed to schedule test on backend. Please check details and try again.';
        console.error('Failed to schedule test on backend:', err);
        toast.error('Scheduling Failed', { description: errMsg });
      }
    } else {
      toast.error('Invalid Candidate', { description: 'Candidate ID is missing or invalid.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── 1. MODAL HEADER ─────────────────────────────────────────────────── */}
        <header className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              <Icon name="calendar" size="md" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 tracking-tight">
                Schedule & Send Candidate Assessment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Candidate: <span className="font-semibold text-slate-800">{candidateName}</span> ({candidateCode}) • <span className="font-semibold text-slate-700">{vacancyTitle}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <Icon name="x" size="sm" />
          </button>
        </header>

        {/* ── 2. FORM BODY ────────────────────────────────────────────────────── */}
        <form onSubmit={handleScheduleSubmit} className="p-5 overflow-y-auto flex flex-col gap-5 scrollbar-thin">
          
          {/* ── TEST MODE SELECTION TABS (Home vs Office) ─────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Assessment Execution Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Tab 1: From Home */}
              <button
                type="button"
                onClick={() => setTestMode('From Home')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  testMode === 'From Home'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-heading flex items-center gap-1.5">
                    <Icon name="user" size="xs" className={testMode === 'From Home' ? 'text-blue-600' : 'text-slate-400'} />
                    <span>From Home (Remote Test)</span>
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${testMode === 'From Home' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                    {testMode === 'From Home' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Candidate logs in with Access ID & 4-digit Passcode. Link & PIN are valid strictly during the assigned time slot.
                </p>
              </button>

              {/* Tab 2: In Office */}
              <button
                type="button"
                onClick={() => setTestMode('In Office')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  testMode === 'In Office'
                    ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-heading flex items-center gap-1.5">
                    <Icon name="building" size="xs" className={testMode === 'In Office' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>In Office (Venue Test)</span>
                  </span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${testMode === 'In Office' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                    {testMode === 'In Office' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Candidate accesses via direct magic token link at office venue. Bypasses manual passcode entry.
                </p>
              </button>
            </div>
          </div>

          {/* ── AUTO-LINKED QUESTION PAPER CARD & SCHEDULE CONTROLS ─────────── */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Icon name="clipboard-check" size="xs" className="text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Linked Vacancy Assessment Paper (Auto-Selected)
                </span>
                <span className="text-xs font-bold text-slate-900 font-heading mt-0.5">
                  {linkedPaperTitle}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Auto-Assigned
            </span>
          </div>

          {/* ── DATE & TIME / VENUE CONTROLS (Using Custom Popover DatePicker & Select) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Custom Popover Calendar Date Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Scheduled Date</label>
              <FormDatePicker value={scheduledDate} onChange={setScheduledDate} />
            </div>

            {/* If Home: Time Slot Start & End Dropdowns */}
            {testMode === 'From Home' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Valid Time Slot Window</label>
                <div className="flex items-center gap-2">
                  <FormSelect value={startTime} onChange={setStartTime} options={TIME_SLOT_OPTIONS} />
                  <span className="text-xs text-slate-400 font-bold">to</span>
                  <FormSelect value={endTime} onChange={setEndTime} options={TIME_SLOT_OPTIONS} />
                </div>
              </div>
            ) : (
              /* If Office: Custom Popover Venue Selection */
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Office Test Center Venue</label>
                <FormSelect value={selectedVenue} onChange={setSelectedVenue} options={officeLocationOptions} />
              </div>
            )}
          </div>

          {/* ── MODE-SPECIFIC DETAILS & CREDENTIALS ────────────────────────────── */}
          {testMode === 'From Home' ? (
            /* FROM HOME CREDENTIALS BOX */
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 font-heading flex items-center gap-1.5">
                  <Icon name="lock" size="xs" className="text-blue-600" />
                  <span>Candidate Login Credentials (Home Test)</span>
                </span>
                <span className="text-[10.5px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  Strict Slot Validity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex flex-col gap-1 bg-white p-2.5 rounded-lg border border-blue-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Candidate Access ID</span>
                  <span className="font-extrabold text-slate-900">{accessCode}</span>
                </div>

                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-200">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">4-Digit Passcode</span>
                    <span className="font-extrabold text-blue-700 text-sm tracking-widest">{passcode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegeneratePasscode}
                    className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Regenerate Passcode"
                  >
                    <Icon name="spinner" size="xs" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                <span className="truncate max-w-xs">{homeExamUrl}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(homeExamUrl);
                    toast.success('Exam URL Copied to Clipboard!');
                  }}
                  className="text-blue-700 font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ) : (
            /* IN OFFICE DIRECT MAGIC LINK BOX */
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-900 font-heading flex items-center gap-1.5">
                  <Icon name="external-link" size="xs" className="text-indigo-600" />
                  <span>Direct Venue Access Link (In Office)</span>
                </span>
                <span className="text-[10.5px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                  Passcode Bypass Token
                </span>
              </div>

              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                Candidate accesses the test center venue desktop. Opening the direct magic token link auto-authenticates the candidate directly into the Welcome & Instructions screen.
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-indigo-200">
                <span className="truncate max-w-md">{officeExamUrl}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(officeExamUrl);
                    toast.success('Direct Magic Token URL Copied!');
                  }}
                  className="text-indigo-700 font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Copy Token URL
                </button>
              </div>
            </div>
          )}

          {/* ── DISPATCH NOTIFICATION CHECKBOXES ───────────────────────────── */}
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700">Dispatch Invitation Channels:</span>
            <div className="flex items-center gap-5 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Email ({candidateEmail})</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>WhatsApp / SMS ({candidatePhone})</span>
              </label>
            </div>
          </div>

          {/* ── FOOTER ACTIONS ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="send" size="xs" />
              <span>Schedule & Dispatch Test Invitation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
