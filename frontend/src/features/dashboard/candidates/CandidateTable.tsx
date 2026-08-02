'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Icon } from '@/design-system';
import { ActionMenu } from '../shared/ActionMenu';
import { EmptyState } from '../shared/EmptyState';
import {
  CANDIDATE_STATUS_CONFIG,
  type CandidateStatus,
} from '../config/status.config';
import { CANDIDATE_COLUMNS, type CandidateColumnId } from '../config/candidateColumns';
import type { DashboardCandidate } from '../mock/candidate.mock';

interface CandidateTableProps {
  candidates: DashboardCandidate[];
  loading?: boolean;
  visibleColumnIds?: CandidateColumnId[];
  onView?: (c: DashboardCandidate) => void;
  onResume?: (c: DashboardCandidate) => void;
  onEdit?: (c: DashboardCandidate) => void;
  onDelete?: (c: DashboardCandidate) => void;
  onDownload?: (c: DashboardCandidate) => void;
  filterKey?: string;
}

/** Render candidate initials avatar */
const InitialsAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const colors = [
    ['--accent-indigo-dim', '--accent-indigo-hover'],
    ['--accent-violet-dim', '--accent-violet-hover'],
    ['--accent-blue-dim', '--accent-blue-hover'],
    ['--accent-cyan-dim', '--accent-cyan-hover'],
    ['--accent-green-dim', '--accent-green-hover'],
    ['--accent-orange-dim', '--accent-orange-hover'],
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;
  const [bg, fg] = colors[colorIdx];

  return (
    <span
      className="w-5.5 h-5.5 md:w-6 md:h-6 xl:w-6.5 xl:h-6.5 2xl:w-7 2xl:h-7 rounded-full flex items-center justify-center text-[9.5px] md:text-[10px] xl:text-[11px] font-black shrink-0 transition-transform duration-150 hover:scale-105"
      style={{ background: `var(${bg})`, color: `var(${fg})` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

/** Skeleton row for loading state */
const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr className="border-b border-[var(--border-soft)]">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-3 py-2">
        <div
          className="h-3 rounded-[var(--radius-xs)]"
          style={{
            width: i === 0 ? '24px' : i === 1 ? '110px' : i % 2 === 0 ? '70px' : '55px',
            background: 'var(--shimmer-base)',
            backgroundImage: 'linear-gradient(90deg, var(--shimmer-base) 25%, var(--shimmer-highlight) 50%, var(--shimmer-base) 75%)',
            backgroundSize: '200% 100%',
            animation: 'step-shimmer 1.8s ease-in-out infinite',
          }}
        />
      </td>
    ))}
  </tr>
);

/**
 * STEP Enterprise CandidateTable with Micro-Interactions
 *
 * Micro-interactions:
 * - Table filtering / pagination switching: Rows fade in (180ms easeOut)
 * - Row hover: 120ms background color transition
 * - Row action icons: Smooth fade in (opacity 0 -> 100) on row hover
 */
export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  loading = false,
  visibleColumnIds,
  onView,
  onResume,
  onEdit,
  onDelete,
  onDownload,
  filterKey = 'table-root',
}) => {
  const columns = useMemo(
    () =>
      visibleColumnIds
        ? CANDIDATE_COLUMNS.filter((c) => visibleColumnIds.includes(c.id))
        : CANDIDATE_COLUMNS,
    [visibleColumnIds]
  );

  const renderCell = (col: (typeof CANDIDATE_COLUMNS)[0], candidate: DashboardCandidate) => {
    const cellPadding = "px-2.5 md:px-3 xl:px-3.5 2xl:px-4 py-1.5 md:py-2 xl:py-2.5";
    const textSize = "text-[11.5px] md:text-[12px] xl:text-[12.5px] 2xl:text-[13px]";

    switch (col.id) {
      case 'avatar':
        return (
          <td
            key={col.id}
            className={`${cellPadding} w-10`}
            style={{ textAlign: col.align || 'left' }}
          >
            <InitialsAvatar name={candidate.name} />
          </td>
        );

      case 'candidate':
        return (
          <td key={col.id} className={cellPadding}>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className={`${textSize} font-semibold text-[var(--text-primary)] truncate font-heading group-hover:text-[var(--accent-indigo)] transition-colors duration-150`}>{candidate.name}</span>
              <span className="text-[9.5px] md:text-[10px] text-[var(--text-tertiary)] font-mono">{candidate.code}</span>
            </div>
          </td>
        );

      case 'email':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} text-[var(--text-secondary)] truncate block max-w-[170px]`} title={candidate.email}>
              {candidate.email}
            </span>
          </td>
        );

      case 'role':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} text-[var(--text-secondary)] truncate block max-w-[180px]`} title={candidate.role}>
              {candidate.role}
            </span>
          </td>
        );

      case 'experience':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} text-[var(--text-secondary)] font-medium whitespace-nowrap`}>
              {candidate.experience || `${candidate.experienceYears} Years`}
            </span>
          </td>
        );

      case 'currentRound':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} font-medium text-[var(--text-primary)]`}>
              {candidate.currentRound}
            </span>
          </td>
        );

      case 'assignedInterviewer':
        return (
          <td key={col.id} className={cellPadding}>
            <div className="flex items-center gap-1.5 md:gap-2 text-[var(--text-secondary)]">
              <span className="w-5 h-5 md:w-5.5 md:h-5.5 xl:w-6 xl:h-6 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)] font-mono font-bold text-[9px] md:text-[9.5px] xl:text-[10px] border border-[var(--border-default)] flex items-center justify-center shrink-0">
                {candidate.assignedInterviewer.split(' ').map(w => w[0]).join('')}
              </span>
              <span className={`${textSize} truncate max-w-[130px] font-medium`}>{candidate.assignedInterviewer}</span>
            </div>
          </td>
        );

      case 'hiringLocation':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} text-[var(--text-secondary)] truncate block max-w-[120px]`}>{candidate.hiringLocation}</span>
          </td>
        );

      case 'testLocation':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} text-[var(--text-secondary)] truncate block max-w-[120px]`}>{candidate.testLocation}</span>
          </td>
        );

      case 'appliedDate':
        return (
          <td key={col.id} className={cellPadding}>
            <span className={`${textSize} text-[var(--text-secondary)] font-mono font-tabular-nums whitespace-nowrap`}>
              {new Date(candidate.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </span>
          </td>
        );

      case 'actions':
        return (
          <td key={col.id} className={`${cellPadding} text-right`}>
            <div className="opacity-90 group-hover:opacity-100 transition-opacity duration-150">
              <ActionMenu
                ariaLabel={`Actions for ${candidate.name}`}
                primaryActions={[
                  { id: 'view', label: 'View profile', icon: 'eye', onClick: () => onView?.(candidate), variant: 'primary' },
                  { id: 'resume', label: 'View resume', icon: 'file-text', onClick: () => onResume?.(candidate) },
                  { id: 'edit', label: 'Edit candidate', icon: 'pencil', onClick: () => onEdit?.(candidate) },
                ]}
                menuItems={[
                  { id: 'download', label: 'Download resume', icon: 'download', onClick: () => onDownload?.(candidate) },
                  { id: 'schedule', label: 'Schedule interview', icon: 'calendar', onClick: () => {} },
                  { id: 'send-offer', label: 'Send offer letter', icon: 'send', onClick: () => {} },
                  { id: 'delete', label: 'Remove candidate', icon: 'trash-2', onClick: () => onDelete?.(candidate), variant: 'danger', dividerBefore: true },
                ]}
              />
            </div>
          </td>
        );

      default:
        return <td key={col.id} className={cellPadding} />;
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-step max-h-[600px] overflow-y-auto">
      <table
        className="w-full border-collapse"
        style={{ minWidth: `${columns.reduce((acc, c) => acc + c.minWidth, 0)}px` }}
        aria-label="Candidates"
        role="grid"
      >
        {/* Sticky Column headers */}
        <thead className="sticky top-0 z-10 bg-[var(--surface-2)] shadow-xs">
          <tr className="border-b border-[var(--border-soft)]">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={`px-2.5 md:px-3.5 xl:px-4 py-2 md:py-2.5 xl:py-3 text-[10px] md:text-[10.5px] xl:text-[11px] 2xl:text-[11.5px] font-bold text-[var(--text-secondary)] font-heading uppercase tracking-[0.06em] whitespace-nowrap select-none
                  ${col.sortable ? 'cursor-pointer hover:text-[var(--text-primary)] transition-colors' : ''}
                  ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                aria-sort={col.sortable ? 'none' : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <Icon name="chevrons-up-down" size="xs" className="opacity-40" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body with Smooth 180ms Fade Animation on Filter/Page Change */}
        <AnimatePresence mode="wait">
          <motion.tbody
            key={filterKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon="users"
                    title="No candidates found"
                    description="Try adjusting your filters or add a new candidate to get started."
                  />
                </td>
              </tr>
            ) : (
              candidates.map((candidate, rowIdx) => (
                <tr
                  key={candidate.id}
                  className={`group border-b border-[var(--border-soft)] hover:bg-[var(--surface-hover)] transition-colors duration-120
                    ${rowIdx % 2 === 1 ? 'bg-[var(--table-row-stripe)]' : 'bg-[var(--table-row)]'}`}
                >
                  {columns.map((col) => renderCell(col, candidate))}
                </tr>
              ))
            )}
          </motion.tbody>
        </AnimatePresence>
      </table>
    </div>
  );
};
