import React from 'react';

export interface TierBadgeProps {
  tier?: string | null;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const getExperienceTierBadgeStyle = (tier?: string | null) => {
  const t = (tier || '').toLowerCase().trim();
  if (t.includes('fresher') || t.includes('0-1')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
      label: tier || 'Fresher',
    };
  }
  if (t.includes('junior') || t.includes('1-2') || t.includes('1-3') || t.includes('1-2.5')) {
    return {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-500/30',
      dot: 'bg-sky-500',
      label: tier || 'Junior',
    };
  }
  if (t.includes('mid') || t.includes('2-4') || t.includes('3-5') || t.includes('2.5-4.5')) {
    return {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-500/30',
      dot: 'bg-indigo-500',
      label: tier || 'Mid-Level',
    };
  }
  if (t.includes('senior') || t.includes('4-7') || t.includes('4.5-7') || t.includes('5+')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
      label: tier || 'Senior',
    };
  }
  if (t.includes('lead') || t.includes('architect') || t.includes('8+')) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-500/30',
      dot: 'bg-purple-500',
      label: tier || 'Lead',
    };
  }
  return {
    bg: 'bg-[var(--surface-2)]',
    text: 'text-[var(--text-secondary)]',
    border: 'border-[var(--border-default)]',
    dot: 'bg-[var(--text-tertiary)]',
    label: tier || 'Universal / All',
  };
};

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'sm',
  className = '',
  showDot = true,
}) => {
  const style = getExperienceTierBadgeStyle(tier);
  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'md'
      ? 'px-3 py-1 text-[12px]'
      : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />}
      <span>{style.label}</span>
    </span>
  );
};
