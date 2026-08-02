'use client';

import React, { useState, useRef } from 'react';
import { Button, Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';

interface ExcelUploadFormProps {
  onSuccess: () => void;
}

const MOCK_EXCEL_PREVIEW = [
  { name: 'Siddharth Rao', email: 'siddharth.rao@step.com', phone: '9876511111', role: 'Data Engineer', exp: '3.5 Yrs', status: 'valid' },
  { name: 'Ananya Deshmukh', email: 'ananya.d@step.com', phone: '9876522222', role: 'UI/UX Designer', exp: '5 Yrs', status: 'valid' },
  { name: 'Rohan Joshi', email: 'rahul.sharma1@example.com', phone: '9876533333', role: 'Senior Full Stack Engineer', exp: 'Fresher', status: 'warning_duplicate' },
  { name: 'Karan Mehta', email: 'karan.m@step.com', phone: '98765', role: 'Frontend Engineer', exp: '2.8 Yrs', status: 'warning_phone' },
  { name: 'Sneha Kulkarni', email: 'sneha.k@step.com', phone: '9876555555', role: 'Backend Engineer', exp: '1.2 Yrs', status: 'valid' },
];

export const ExcelUploadForm: React.FC<ExcelUploadFormProps> = ({ onSuccess }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Unsupported File Format', {
        description: 'Please upload an Excel spreadsheet (.xlsx or .xls).',
      });
      return;
    }
    setExcelFile(file);
    toast.success('Excel File Loaded', {
      description: `${file.name} ready for bulk preview & validation.`,
    });
  };

  const handleDownloadTemplate = () => {
    toast.info('Downloading Template', {
      description: 'STEP_Candidate_Import_Template.xlsx is downloading...',
    });
  };

  const handleImport = () => {
    if (!excelFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Bulk Import Complete', {
        description: '5 candidates imported into STEP Recruitment Pipeline.',
      });
      onSuccess();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileChange(f);
        }}
      />

      {/* Main Drag & Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFileChange(f);
        }}
        className={`border-2 border-dashed rounded-2xl py-8 px-6 text-center cursor-pointer transition-all duration-200 select-none min-h-[230px] flex flex-col items-center justify-center space-y-3.5 ${
          excelFile
            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
            : 'border-[var(--border-default)] hover:border-[var(--accent-indigo)] bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]/40 hover:bg-[var(--surface-hover)] shadow-2xs'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center border border-[var(--border-default)] shadow-2xs">
          <Icon name="file-spreadsheet" size="md" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-heading">
            {excelFile ? excelFile.name : 'Drag & Drop Excel File Here'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            {excelFile
              ? `${(excelFile.size / 1024).toFixed(1)} KB • Click or drop to replace`
              : 'Import your existing candidate directory in bulk'}
          </p>
          {!excelFile && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">.XLSX</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">.XLS</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">MAX 500 ROWS</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="h-9 px-4 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs flex items-center justify-center gap-2.5 hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer select-none"
          >
            <Icon name="upload" size="xs" />
            <span>Browse Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadTemplate();
            }}
            className="h-9 px-4 rounded-lg text-xs font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] shadow-2xs flex items-center justify-center gap-2.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer select-none"
          >
            <Icon name="download" size="xs" />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* Upload Preview & Validation */}
      {excelFile && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
              File Validation Summary
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                3 Ready
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                2 Warnings
              </span>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border border-[var(--border-default)] rounded-xl bg-[var(--surface-1)] scrollbar-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border-default)] sticky top-0">
                <tr>
                  <th className="p-2 font-bold text-[var(--text-secondary)]">Name</th>
                  <th className="p-2 font-bold text-[var(--text-secondary)]">Email</th>
                  <th className="p-2 font-bold text-[var(--text-secondary)]">Role</th>
                  <th className="p-2 font-bold text-[var(--text-secondary)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {MOCK_EXCEL_PREVIEW.map((r, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-hover)]">
                    <td className="p-2 font-semibold text-[var(--text-primary)]">{r.name}</td>
                    <td className="p-2 text-[var(--text-secondary)] font-mono text-[11px] truncate max-w-[140px]">{r.email}</td>
                    <td className="p-2 text-[var(--text-secondary)]">{r.role}</td>
                    <td className="p-2">
                      {r.status === 'valid' && (
                        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Valid
                        </span>
                      )}
                      {r.status === 'warning_duplicate' && (
                        <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Duplicate
                        </span>
                      )}
                      {r.status === 'warning_phone' && (
                        <span className="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Phone Err
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="md"
              disabled={isProcessing}
              onClick={handleImport}
              type="button"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-md hover:from-indigo-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Icon name="spinner" size="xs" className="animate-spin" />
                  <span>Processing File...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size="xs" />
                  <span>Import {MOCK_EXCEL_PREVIEW.length} Candidates</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
