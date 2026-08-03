import React, { useState } from 'react';
import { Icon } from '@/design-system';

interface AddMasterTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export const AddMasterTitleModal: React.FC<AddMasterTitleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onSave(newTitle.trim());
    setNewTitle('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] w-full max-w-md p-5 flex flex-col gap-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
          <h4 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
            Add New Master Section Title
          </h4>
          <button type="button" onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
            <Icon name="x" size="xs" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11.5px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
              Section Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Data Structures & System Architecture"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full h-9.5 px-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-default)] w-full">
            <button
              type="button"
              onClick={onClose}
              className="h-9.5 px-4 rounded-lg text-[12.5px] font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--surface-hover)] cursor-pointer w-full"
            >
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="h-9.5 px-4 rounded-lg text-[12.5px] font-bold bg-[var(--accent-indigo)] text-white flex items-center justify-center hover:bg-[var(--accent-indigo-hover)] cursor-pointer w-full"
            >
              <span>Save to Master Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
