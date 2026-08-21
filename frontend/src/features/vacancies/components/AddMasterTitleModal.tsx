import React, { useState } from 'react';
import { EnterpriseModal } from '@/design-system';

interface AddMasterTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export const AddMasterTitleModal: React.FC<AddMasterTitleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newTitle, setNewTitle] = useState('');

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onSave(newTitle.trim());
    setNewTitle('');
  };

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Master Section Title"
      subtitle="Create a new standardized title for question bank sections."
      icon="plus-circle"
      maxWidth="md"
      submitText="Save to Master Data"
      cancelText="Cancel"
      onSubmit={handleSubmit}
    >
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
          className="w-full h-9.5 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-[12.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-indigo)]"
        />
      </div>
    </EnterpriseModal>
  );
};
