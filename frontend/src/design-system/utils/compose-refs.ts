import React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Composes multiple React refs into a single callback ref.
 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (ref === null || ref === undefined) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        try {
          (ref as React.MutableRefObject<T | null>).current = node;
        } catch {
          // Fallback if ref is read-only
        }
      }
    });
  };
}
