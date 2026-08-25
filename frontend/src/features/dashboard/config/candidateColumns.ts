/**
 * STEP Enterprise Platform — Candidate Table Column Configuration
 *
 * New Order per spec:
 * 1. Candidate
 * 2. Email
 * 3. Role
 * 4. Experience (NEW)
 * 5. Current Stage (Round)
 * 6. Assigned Interviewer
 * 7. Hiring Location
 * 8. Test Location
 * 9. Applied Date
 * 10. Actions
 */

export type CandidateColumnId =
  | 'avatar'
  | 'candidate'
  | 'driveType'
  | 'email'
  | 'role'
  | 'experience'
  | 'currentRound'
  | 'assignedInterviewer'
  | 'hiringLocation'
  | 'testLocation'
  | 'appliedDate'
  | 'actions';

export interface ColumnDef {
  id: CandidateColumnId;
  label: string;
  shortLabel?: string;
  minWidth: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  hideable?: boolean;
  defaultHidden?: boolean;
}

export const CANDIDATE_COLUMNS: ColumnDef[] = [
  {
    id: 'avatar',
    label: '',
    shortLabel: '',
    minWidth: 36,
    align: 'center',
    hideable: false,
  },
  {
    id: 'candidate',
    label: 'Candidate',
    minWidth: 140,
    align: 'left',
    sortable: true,
    hideable: false,
  },
  {
    id: 'driveType',
    label: 'Drive Type',
    shortLabel: 'Track',
    minWidth: 110,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'email',
    label: 'Email',
    minWidth: 140,
    align: 'left',
    sortable: false,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'role',
    label: 'Role',
    minWidth: 135,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'experience',
    label: 'Experience',
    shortLabel: 'Exp.',
    minWidth: 100,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'currentRound',
    label: 'Current Stage',
    shortLabel: 'Stage',
    minWidth: 145,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'assignedInterviewer',
    label: 'Interviewer',
    shortLabel: 'Interviewer',
    minWidth: 130,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'hiringLocation',
    label: 'Hiring Location',
    shortLabel: 'Hiring Loc.',
    minWidth: 105,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'testLocation',
    label: 'Test Location',
    shortLabel: 'Test Loc.',
    minWidth: 105,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'appliedDate',
    label: 'Applied Date',
    shortLabel: 'Applied',
    minWidth: 90,
    align: 'left',
    sortable: true,
    hideable: true,
    defaultHidden: false,
  },
  {
    id: 'actions',
    label: '',
    shortLabel: '',
    minWidth: 120,
    align: 'right',
    hideable: false,
  },
];
