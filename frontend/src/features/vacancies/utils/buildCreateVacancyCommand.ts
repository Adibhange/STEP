/**
 * Maps the raw payload collected by CreateVacancyModal (name strings, UI-friendly labels,
 * client-only React state) onto the exact shape the backend's CreateVacancyCommand expects
 * (numeric master-data IDs, backend enum strings, ordered arrays).
 *
 * Kept as a pure function so the fiddly translation logic (experience-range parsing, drive-type/
 * status label mapping, default-flow normalization) lives in one testable place instead of being
 * buried inline in VacanciesListView.
 */

const DRIVE_TYPE_MAP: Record<string, string> = {
  'Walk-in Drive': 'Walk-in',
  'Direct / Sourced Hiring': 'Direct',
};

const STATUS_MAP: Record<string, string> = {
  Open: 'Active',
  Draft: 'Draft',
};

/**
 * Parses experience-level labels like "Fresher (0 Years)", "Junior (0-1 Year)",
 * "Lead (5-8 Years)", "Principal (8+ Years)" into a [min, max] year range.
 * A trailing "+" has no upper bound in the label, so max is set equal to min.
 */
export function parseExperienceRange(label: string | undefined | null): [number, number] {
  if (!label) return [0, 0];
  const match = label.match(/\((\d+)(?:\s*-\s*(\d+))?\+?\s*Years?\)/i);
  if (!match) return [0, 0];
  const min = Number(match[1]) || 0;
  const max = match[2] !== undefined ? Number(match[2]) || min : min;
  return [min, max];
}

interface RawPipelineRound {
  id: string;
  name: string;
  type: string;
  cutoffPercent: number;
}

interface RawPipelineFlowVersion {
  id: string;
  versionName: string;
  isDefault?: boolean;
  description: string;
  rounds: RawPipelineRound[];
}

interface RawAssessmentSection {
  id: string;
  sectionTitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  marksPerQuestion: number;
}

export interface CreateVacancyVacancyData {
  title: string;
  driveType: string;
  status: string;
  workMode: string;
  openPositions: number;
  experience: string;
  jobDescription?: string;
  closingDate?: string;
  walkInDrive?: { date?: string } | undefined;
  roleId?: number;
  departmentId?: number;
  hiringLocationId?: number;
  employmentTypeId?: number;
  assignedRecruiterId?: number;
  hiringManagerId?: number;
  testLocationIds?: number[];
  flowVersions: RawPipelineFlowVersion[];
  assessmentSections: RawAssessmentSection[];
}

export function buildCreateVacancyCommand(vacancyData: CreateVacancyVacancyData): Record<string, any> {
  const [minExperienceYears, maxExperienceYears] = parseExperienceRange(vacancyData.experience);

  const driveType = DRIVE_TYPE_MAP[vacancyData.driveType] || vacancyData.driveType;
  const status = STATUS_MAP[vacancyData.status] || vacancyData.status;

  // Backend requires exactly one pipeline flow marked as default — fall back to the first
  // flow if the UI state somehow ends up with none (e.g. the default flow was removed).
  const hasDefaultFlow = vacancyData.flowVersions.some((f) => f.isDefault);
  const pipelineFlows = vacancyData.flowVersions.map((flow, flowIdx) => ({
    versionName: flow.versionName,
    description: flow.description,
    isDefault: hasDefaultFlow ? Boolean(flow.isDefault) : flowIdx === 0,
    rounds: flow.rounds.map((round, roundIdx) => ({
      roundOrder: roundIdx + 1,
      name: round.name,
      roundType: round.type,
      cutoffPercent: round.cutoffPercent,
    })),
  }));

  const assessmentSections = vacancyData.assessmentSections.map((section, idx) => ({
    sectionOrder: idx + 1,
    sectionTitle: section.sectionTitle,
    totalQuestions: section.totalQuestions,
    timeLimitMinutes: section.timeLimitMinutes,
    marksPerQuestion: section.marksPerQuestion,
  }));

  return {
    title: vacancyData.title,
    masterRoleId: vacancyData.roleId,
    departmentId: vacancyData.departmentId,
    hiringLocationId: vacancyData.hiringLocationId,
    employmentTypeId: vacancyData.employmentTypeId,
    driveType,
    workMode: vacancyData.workMode,
    totalOpenings: vacancyData.openPositions,
    minExperienceYears,
    maxExperienceYears,
    jobDescription: vacancyData.jobDescription,
    // No UI field collects a real closing date yet — kept as a placeholder until one exists.
    closingDate: vacancyData.closingDate || '2026-08-30',
    walkinDriveDate: driveType === 'Walk-in' ? vacancyData.walkInDrive?.date : undefined,
    assignedRecruiterId: vacancyData.assignedRecruiterId,
    hiringManagerId: vacancyData.hiringManagerId,
    status,
    testLocationIds: vacancyData.testLocationIds || [],
    pipelineFlows,
    assessmentSections,
  };
}
