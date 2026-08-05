'use client';

import React, { useState, useRef } from 'react';
import { Icon } from '@/design-system';

export interface CodeEditorIDEProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  questionType?: 'CODING' | 'SQL' | 'SUBJECTIVE';
  defaultTemplate?: string;
  title?: string;
  questionId?: string;
}

export const CodeEditorIDE: React.FC<CodeEditorIDEProps> = ({
  value,
  onChange,
  language,
  questionType = 'CODING',
  defaultTemplate = '',
  title,
}) => {
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Calculate lines & characters
  const textContent = value !== undefined ? value : defaultTemplate;
  const lines = textContent.split('\n');
  const lineCount = Math.max(lines.length, 1);
  const charCount = textContent.length;

  // Sync line numbers scroll with code textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Track cursor position
  const updateCursorPos = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const linesBefore = text.substring(0, selStart).split('\n');
    const currentLine = linesBefore.length;
    const currentCol = linesBefore[linesBefore.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });
  };

  // Tab key support (inserts 2 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const newValue = val.substring(0, start) + '  ' + val.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPos();
      }, 0);
    }
  };

  const displayLanguage = language || (questionType === 'SQL' ? 'SQL Server' : 'JavaScript / TypeScript');

  return (
    <div className="flex-1 flex flex-col rounded-xl border border-slate-300 bg-white shadow-xs overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all mt-2 min-h-[280px] sm:min-h-[320px]">
      {/* STEP Clean Responsive Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 border-b border-slate-200 text-xs select-none">
        {/* Left: Title & Dynamic Language Badge */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 min-w-0">
          <span className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            <Icon name={questionType === 'SQL' ? 'file-text' : 'code-2'} size="xs" />
          </span>
          <span className="font-bold font-heading text-slate-800 text-xs sm:text-sm truncate">
            {title || (questionType === 'SQL' ? 'SQL Query Solution' : 'Code Solution')}
          </span>
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-mono text-[10px] sm:text-[11px] font-semibold border border-slate-300 whitespace-nowrap">
            {displayLanguage}
          </span>
        </div>

        {/* Right: Auto-Saved Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-emerald-200 whitespace-nowrap">
            <Icon name="check-circle" size="xs" />
            <span>Auto-Saved</span>
          </span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex overflow-hidden min-h-[220px] sm:min-h-[260px]">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-9 sm:w-11 select-none font-mono text-[11px] sm:text-xs py-3 pr-1.5 sm:pr-2.5 text-right bg-slate-50 text-slate-400 border-r border-slate-200 overflow-hidden shrink-0 font-medium"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={`leading-relaxed ${
                cursorPos.line === i + 1 ? 'text-blue-600 font-bold bg-blue-50 rounded-xs' : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={textContent}
          onChange={(e) => {
            onChange(e.target.value);
            updateCursorPos();
          }}
          onScroll={handleScroll}
          onClick={updateCursorPos}
          onKeyUp={updateCursorPos}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          className="flex-1 w-full p-2.5 sm:p-3 font-mono text-[11px] sm:text-xs text-slate-900 bg-slate-950/5 focus:bg-white outline-none leading-relaxed resize-none scrollbar-thin overflow-y-auto whitespace-pre tab-2 transition-colors"
          placeholder={
            questionType === 'SQL'
              ? '-- Write your SQL query solution here...'
              : '// Type your coding solution here...'
          }
        />
      </div>

      {/* Responsive Bottom Status Bar */}
      <div className="flex items-center justify-between px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] sm:text-[11px] font-mono text-slate-500 select-none overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-semibold text-slate-700">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>•</span>
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Candidate Submission Field</span>
        </div>
      </div>
    </div>
  );
};
