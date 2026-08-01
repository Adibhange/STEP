import React from 'react';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Keyboard shortcut key text (e.g., 'j', 'k', '⌘K', 'Enter', 'Esc') */
  children: React.ReactNode;
}
