import { useEffect } from 'react';

type KeyComboHandler = (e: KeyboardEvent) => void;

interface ShortcutMap {
  [keyCombo: string]: KeyComboHandler;
}

export function useKeyboard(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      let combo = '';
      if (isCtrlOrCmd) combo += 'ctrl+';
      if (event.shiftKey) combo += 'shift+';
      if (event.altKey) combo += 'alt+';
      combo += key;

      if (shortcuts[combo]) {
        event.preventDefault();
        shortcuts[combo](event);
      } else if (shortcuts[key] && !isCtrlOrCmd) {
        // Handle single key shortcut (e.g. '/' or 'escape') if not typing in input
        const target = event.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (!isInput) {
          event.preventDefault();
          shortcuts[key](event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
