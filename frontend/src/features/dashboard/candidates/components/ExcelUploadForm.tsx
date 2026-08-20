'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import {
  downloadCandidateBulkTemplate,
  parseCandidatesFromExcel,
  type ParsedCandidateItem,
} from '../utils/candidateExcelExporter';
import { useRegisterCandidateMutation, useGetVacanciesQuery } from '@/store/services/api';

interface ExcelUploadFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const ExcelUploadForm: React.FC<ExcelUploadFormProps> = ({ onSuccess, onCancel }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCandidateItem[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [registerCandidateApi] = useRegisterCandidateMutation();
  const { data: vacanciesRes } = useGetVacanciesQuery({ pageSize: 200, status: 'Open' });

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Unsupported File Format', {
        description: 'Please upload an Excel spreadsheet (.xlsx, .xls) or CSV file.',
      });
      return;
    }

    setExcelFile(file);
    setIsParsing(true);
    try {
      const result = await parseCandidatesFromExcel(file);
      setParsedRows(result.rows);
      setValidCount(result.totalValid);
      setWarningCount(result.totalWarnings);
      toast.success('Spreadsheet Parsed', {
        description: `Loaded ${result.rows.length} candidate record(s) from ${file.name}.`,
      });
    } catch (err: any) {
      toast.error('Parsing Error', {
        description: err?.message || 'Could not parse Excel workbook. Please verify the format.',
      });
      setParsedRows([]);
      setValidCount(0);
      setWarningCount(0);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadCandidateBulkTemplate();
      toast.success('Template Downloaded', {
        description: 'Formatted candidate ingestion spreadsheet (.xlsx) saved to your downloads.',
      });
    } catch {
      toast.error('Download Failed', {
        description: 'Could not generate template spreadsheet.',
      });
    }
  };

  const handleImport = async () => {
    if (!excelFile || parsedRows.length === 0) {
      toast.error('No Data to Ingest', {
        description: 'Please upload a spreadsheet with candidate records first.',
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    const activeVacancies = vacanciesRes?.data || [];
    const defaultVacancyId = activeVacancies[0]?.id || 1;

    try {
      for (const row of parsedRows) {
        if (row.status === 'warning_missing') {
          failCount++;
          continue;
        }

        const nameParts = (row.name || 'Unnamed Candidate').trim().split(/\s+/);
        const firstName = nameParts[0] || 'Candidate';
        const lastName = nameParts.slice(1).join(' ') || 'Applicant';

        // Try to match vacancy by role name or fall back to default open vacancy
        const matchedVac = activeVacancies.find(
          (v: any) =>
            v.title?.toLowerCase().includes((row.role || '').toLowerCase()) ||
            v.role?.toLowerCase().includes((row.role || '').toLowerCase())
        );
        const targetVacancyId = matchedVac?.id || defaultVacancyId;

        const totalExp = parseFloat(row.exp) || 0;
        const phoneDigits = (row.phone || '').replace(/\D/g, '').slice(-10);

        try {
          await registerCandidateApi({
            firstName: firstName.slice(0, 50),
            lastName: lastName.slice(0, 50),
            email: row.email,
            phone: phoneDigits.length === 10 ? phoneDigits : '9876543210',
            vacancyId: targetVacancyId,
            registrationChannel: 'Portal',
            totalExperienceYears: totalExp,
            currentCTC: row.currentCTC,
            expectedCTC: row.expectedCTC,
            noticePeriodDays: row.noticePeriod,
            currentLocation: row.city || undefined,
            highestQualification: row.qualification || undefined,
          }).unwrap();
          successCount++;
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success('Candidates Ingested Successfully', {
          description: `Enrolled ${successCount} candidate(s) into recruitment pipeline${
            failCount > 0 ? ` (${failCount} skipped/failed)` : ''
          }.`,
        });
        onSuccess();
      } else {
        toast.error('Ingestion Incomplete', {
          description: 'Could not enroll candidates. Please verify the spreadsheet contents.',
        });
      }
    } catch {
      toast.error('Ingestion Failed', {
        description: 'Failed to process bulk candidate records.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setExcelFile(null);
    setParsedRows([]);
    setValidCount(0);
    setWarningCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ── Scrollable Body Matching Single Candidate Form Sizing ──────────── */}
      <div className="flex-1 min-h-0 px-4 sm:px-8 pt-4 pb-6 space-y-4 overflow-y-auto scrollbar-none">

        {/* ── Guidance & Template Download Banner ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-indigo)]/10 via-[var(--surface-2)] to-[var(--surface-2)] border border-[var(--accent-indigo)]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-indigo)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Icon name="file-spreadsheet" size="sm" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-extrabold text-[var(--text-primary)] font-heading">
                Bulk Ingestion Template & Standards
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                Columns required: Full Name, Email, Mobile, Target Role, Exp (Yrs), CTC & City.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDownloadTemplate}
            className="h-8.5 px-3 rounded-lg text-xs font-bold bg-[var(--surface-1)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/40 hover:bg-[var(--accent-indigo-dim)] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Icon name="download" size="xs" />
            <span>Download Sample .xlsx</span>
          </motion.button>
        </motion.div>

        {/* ── Interactive Drag & Drop Area ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !excelFile && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all duration-200 ${
            isDragging
              ? 'border-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] scale-[1.008] shadow-md'
              : excelFile
              ? 'border-[var(--border-strong)] bg-[var(--surface-2)]'
              : 'border-[var(--border-default)] hover:border-[var(--accent-indigo)]/60 bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {!excelFile ? (
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shadow-xs border border-[var(--accent-indigo)]/30">
                <Icon name="upload" size="md" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-sm font-extrabold text-[var(--text-primary)] font-heading">
                  Drag & drop your Excel spreadsheet here, or <span className="text-[var(--accent-indigo)] underline decoration-indigo-300">browse</span>
                </span>
                <span className="block text-xs text-[var(--text-tertiary)] font-sans">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) up to 25MB
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                  .XLSX
                </span>
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                  .XLS
                </span>
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                  .CSV
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
                  <Icon name="file-spreadsheet" size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] font-mono truncate max-w-[240px] sm:max-w-[320px]">
                      {excelFile.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                      Ready
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] font-mono">
                    {(excelFile.size / 1024).toFixed(1)} KB • {parsedRows.length} record(s) parsed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg text-xs font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                >
                  Change File
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleClearFile}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold bg-[var(--surface-1)] text-rose-500 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Remove file"
                >
                  <Icon name="trash" size="xs" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Parsed Preview Section / Format Checklist ──────────────────── */}
        <AnimatePresence mode="wait">
          {isParsing ? (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] flex flex-col items-center justify-center gap-2.5"
            >
              <Icon name="spinner" size="md" className="animate-spin text-[var(--accent-indigo)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] font-heading">
                Parsing spreadsheet records...
              </span>
            </motion.div>
          ) : parsedRows.length > 0 ? (
            <motion.div
              key="preview-table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {/* Summary Stats Row */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] font-heading">
                    Parsed Candidates Preview
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-secondary)] font-bold">
                    {parsedRows.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {validCount} Valid
                  </span>
                  {warningCount > 0 && (
                    <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {warningCount} Warnings
                    </span>
                  )}
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-[var(--border-default)] rounded-xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto scrollbar-none bg-[var(--surface-1)]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[var(--surface-2)] border-b border-[var(--border-default)] sticky top-0 z-10 text-[var(--text-secondary)] font-heading text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 font-bold">#</th>
                      <th className="p-2.5 font-bold">Candidate Name</th>
                      <th className="p-2.5 font-bold">Email Address</th>
                      <th className="p-2.5 font-bold">Mobile</th>
                      <th className="p-2.5 font-bold">Role / Exp</th>
                      <th className="p-2.5 font-bold">City</th>
                      <th className="p-2.5 font-bold text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)] font-sans">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="p-2.5 font-mono text-[11px] text-[var(--text-tertiary)]">{i + 1}</td>
                        <td className="p-2.5 font-bold text-[var(--text-primary)]">{r.name}</td>
                        <td className="p-2.5 text-[var(--text-secondary)] font-mono text-[11px]">{r.email}</td>
                        <td className="p-2.5 text-[var(--text-secondary)] font-mono text-[11px]">{r.phone}</td>
                        <td className="p-2.5 text-[var(--text-secondary)]">
                          <span className="font-medium text-[var(--text-primary)]">{r.role}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">{r.exp}</span>
                        </td>
                        <td className="p-2.5 text-[var(--text-secondary)]">{r.city}</td>
                        <td className="p-2.5 text-right">
                          <span
                            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full inline-block border ${
                              r.status === 'valid'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {r.statusMessage || r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guidelines-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--border-default)]">
                <Icon name="check" size="xs" className="text-emerald-500" />
                <span className="text-xs font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
                  Bulk Upload Requirements & Validation Rules
                </span>
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 font-sans pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] mt-1.5 shrink-0" />
                  <span><strong>Full Name & Email:</strong> Mandatory for all rows. Duplicate emails will be flagged automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] mt-1.5 shrink-0" />
                  <span><strong>Mobile Numbers:</strong> 10-digit standard Indian format recommended (without prefix).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] mt-1.5 shrink-0" />
                  <span><strong>Role & Experience:</strong> Auto-matched to active vacancies if matching codes are provided.</span>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Sticky Action Buttons Footer Matching Manual Entry Layout ─────── */}
      <div className="px-5 sm:px-8 py-3 bg-[var(--surface-1)] border-t border-[var(--border-default)] shrink-0 flex items-center justify-end gap-2.5 shadow-xs">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          disabled={!excelFile || parsedRows.length === 0 || isProcessing}
          onClick={handleImport}
          className="h-9 px-5 rounded-xl text-xs font-bold bg-gradient-to-b from-[var(--accent-indigo)] to-[#4f46e5] hover:from-[#6b6ff5] hover:to-[#4338ca] text-white shadow-[0_2px_8px_rgba(99,102,241,0.35),0_1px_0_rgba(255,255,255,0.2)_inset] border border-indigo-400/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Icon name="spinner" size="xs" className="animate-spin" />
              <span>Ingesting...</span>
            </>
          ) : (
            <>
              <Icon name="check" size="xs" />
              <span>{parsedRows.length > 0 ? `Import ${parsedRows.length} Candidates` : 'Import Candidates'}</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
