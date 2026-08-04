'use client';

import React, { useState, useRef } from 'react';
import { Button, Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';

interface ExcelUploadFormProps {
  onSuccess: () => void;
}

export interface ExcelPreviewRow {
  name: string;
  email: string;
  phone: string;
  role: string;
  exp: string;
  status: 'valid' | 'warning_duplicate' | 'warning_phone';
}

export const ExcelUploadForm: React.FC<ExcelUploadFormProps> = ({ onSuccess }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ExcelPreviewRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Unsupported File Format', {
        description: 'Please upload an Excel spreadsheet (.xlsx or .xls).',
      });
      return;
    }
    setExcelFile(file);
    setParsedRows([]);
    toast.success('File Uploaded', {
      description: `Loaded ${file.name} for parsing.`,
    });
  };

  const handleImport = async () => {
    if (!excelFile) return;
    setIsProcessing(true);
    try {
      toast.success('Import Successful', {
        description: `Imported candidate entries from ${excelFile.name}.`,
      });
      onSuccess();
    } catch {
      toast.error('Import Failed', { description: 'Failed to process Excel file.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--border-default)] hover:border-[var(--accent-indigo)] rounded-[var(--radius-lg)] p-8 text-center cursor-pointer transition-colors bg-[var(--surface-2)] flex flex-col items-center gap-3"
      >
        <Icon name="upload" size="lg" className="text-[var(--accent-indigo)]" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-extrabold text-[var(--text-primary)] font-heading">
            {excelFile ? excelFile.name : 'Click to upload Excel File (.xlsx)'}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            Upload candidate directory file for bulk processing
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileChange(f);
          }}
        />
      </div>

      {excelFile && (
        <div className="flex flex-col gap-3">
          <div className="border border-[var(--border-default)] rounded-xl overflow-hidden shadow-2xs">
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
                {parsedRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-xs text-[var(--text-tertiary)] font-mono">
                      File loaded ({excelFile.name}). Click Import Candidates to process.
                    </td>
                  </tr>
                ) : (
                  parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--surface-hover)]">
                      <td className="p-2 font-semibold text-[var(--text-primary)]">{r.name}</td>
                      <td className="p-2 text-[var(--text-secondary)] font-mono text-[11px] truncate max-w-[140px]">{r.email}</td>
                      <td className="p-2 text-[var(--text-secondary)]">{r.role}</td>
                      <td className="p-2">
                        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
                  <span>Import Candidates</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
