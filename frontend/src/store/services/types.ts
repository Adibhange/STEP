export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[] | null;
  meta?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
  correlationId: string;
}

export interface UserSummaryData {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthResultData {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc?: string;
  user: UserSummaryData;
}

export interface MasterRecord {
  id: string;
  category: string;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface ExamOptionData {
  id: number;
  label: string;
  text: string;
}

export interface ExamQuestionData {
  id: number;
  displayOrder: number;
  questionType: string;
  questionText: string;
  marks: number;
  timeAllowedMinutes: number | null;
  programmingLanguage: string | null;
  sqlSchema: string | null;
  maxWordCount: number | null;
  options: ExamOptionData[];
  submittedAnswerText: string | null;
  selectedOptionIds: number[];
}

export interface LiveExamWorkspaceData {
  sessionToken: string;
  candidateName: string;
  vacancyTitle: string;
  paperTitle: string;
  durationMinutes: number;
  totalTimeLeftSeconds: number;
  activeQuestionIndex: number;
  sessionStatus: string;
  questions: ExamQuestionData[];
}

export interface SubmitExamResultData {
  sessionStatus: string;
  totalScore: number;
  totalMarks: number;
  pendingManualEvaluationCount: number;
}

export interface ReportExamViolationResultData {
  tabSwitchWarnings: number;
  assessmentIntegrityScore: number;
  autoSubmitted: boolean;
  submitResult: SubmitExamResultData | null;
}

export interface EvaluationOptionData {
  id: number;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamAnswerEvaluationData {
  candidateExamAnswerId: number;
  questionDisplayOrder: number;
  questionType: string;
  questionText: string;
  submittedAnswerText: string | null;
  marks: number;
  marksObtained: number;
  evaluationStatus: string;
  evaluationLocked: boolean;
  evaluatorRemarks: string | null;
  options: EvaluationOptionData[];
  selectedOptionIds: number[];
}

export interface ExamEvaluationViewData {
  candidateExamSessionId: number;
  candidateName: string;
  vacancyTitle: string;
  paperTitle: string;
  sessionStatus: string;
  evaluationStatus: string;
  totalMarks: number;
  totalScore: number;
  frozenTotalDurationMinutes: number;
  startedAt: string | null;
  submittedAt: string | null;
  tabSwitchWarnings: number;
  assessmentIntegrityScore: number;
  answers: ExamAnswerEvaluationData[];
}

export interface PublishResultData {
  candidateExamSessionId: number;
  resultStatus: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  advancedToNextRound: boolean;
  nextRoundTitle: string | null;
  nextRoundExamPasscode: string | null;
  candidateStatus: string;
}

export interface QRCodeData {
  id: number;
  vacancyId: number;
  vacancyTitle: string;
  code: string;
  registrationUrl: string;
  venueName: string;
  venueAddress: string | null;
  driveDate: string;
  driveStartTime: string | null;
  driveEndTime: string | null;
  capacity: number | null;
  registrationDeadline: string | null;
  status: string;
}

export interface QRCodeAnalyticsData {
  qrCodeId: number;
  totalScans: number;
  successfulRegistrations: number;
  conversionRate: number;
}

export interface PipelineProgressData {
  id: number;
  roundNumber: number;
  roundTitle: string;
  roundType: string;
  status: string;
  scoreObtained: number | null;
  startedAt: string | null;
  completedAt: string | null;
  candidateExamSessionId: number | null;
  interviewId: number | null;
}

export interface InterviewRoundDetailData {
  id: number;
  panelistUserId: number;
  panelistName: string;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  culturalFitRating: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string;
  comments: string | null;
  submittedAt: string;
}

export interface InterviewData {
  id: number;
  candidateId: number;
  candidateName: string;
  vacancyTitle: string;
  interviewerUserId: number | null;
  interviewerName: string | null;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  meetingLinkOrLocation: string | null;
  status: string;
  roundDetails: InterviewRoundDetailData[];
}

export interface ScheduleInterviewRequest {
  candidateId: number;
  interviewerUserId: number;
  scheduledAt: string;
  durationMinutes: number;
  mode: 'Online' | 'Onsite' | 'Phone';
  meetingLinkOrLocation?: string;
}

export interface SubmitInterviewFeedbackRequest {
  interviewId: number;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  culturalFitRating: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: 'Hire' | 'Reject' | 'OnHold';
  comments?: string;
}

export interface OfferLetterData {
  id: number;
  candidateId: number;
  candidateName: string;
  vacancyId: number;
  vacancyTitle: string;
  offeredCTC: number;
  joiningDate: string;
  status: string;
  preparedByName: string;
  approvedByName: string | null;
  approvedAt: string | null;
  generatedPdfPath: string | null;
}

export interface GenerateOfferLetterRequest {
  candidateId: number;
  offeredCTC: number;
  joiningDate: string;
}

export interface QRScanResultData {
  qrCodeId: number;
  vacancyId: number;
  vacancyTitle: string;
  venueName: string;
  isOpenForRegistration: boolean;
  message: string | null;
}

export interface QRRegistrationEligibilityData {
  canApply: boolean;
  eligibleFrom: string | null;
  lastAppliedAt: string | null;
}

export interface RegisterCandidateViaQRRequest {
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalExperienceYears: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriodDays?: number;
  currentLocation?: string;
  highestQualification?: string;
}

export interface UserItem {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

export interface RoleHiringProfileData {
  id: number;
  masterRoleId: number;
  roleName: string;
  profileName: string;
  experienceLevelId: number | null;
  experienceLevelName: string | null;
  minExperienceYears: number;
  maxExperienceYears: number;
  questionPaperTemplateId: number | null;
  questionPaperTitle: string | null;
  passingPercentage: number;
  pipelineFlowTemplateId: number | null;
  autoAdvanceOnPass: boolean;
  autoRejectOnFail: boolean;
  autoPrepareOfferOnFinalPass: boolean;
  defaultBaseCTC: number | null;
  isDefault: boolean;
  isActive: boolean;
}

export interface InstantDriveResultData {
  vacancyId: number;
  vacancyCode: string;
  title: string;
  profileName: string;
  departmentName: string;
  hiringLocationName: string;
  totalOpenings: number;
  minExperienceYears: number;
  maxExperienceYears: number;
  passingPercentage: number;
  questionPaperTitle: string;
  totalQuestions: number;
  durationMinutes: number;
  qrCodeId: number;
  qrCodeString: string;
  registrationUrl: string;
  qrCodeDataUrl: string;
}

export interface TempExamPassData {
  candidateCode: string;
  passcode: string;
  candidateName: string;
  roleName: string;
  examUrl: string;
  expiresAtUtc: string;
  validityHours: number;
}

export interface BatchAnswerSyncData {
  syncedCount: number;
  serverSyncedAtUtc: string;
  sessionStatus: string;
}

export interface AssessmentSectionRuleItem {
  id?: number;
  sectionName: string;
  sectionType: 'Aptitude' | 'TechnicalMCQ' | 'Coding' | 'SQLQuery' | 'SubjectiveTheory';
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';
  experienceTier?: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | '{InheritFromCandidateTier}' | 'Any';
  requiredTags: string;
  questionCount: number;
  marksPerQuestion: number;
  timeLimitMinutes: number | null;
  programmingLanguage?: string | null;
  selectionStrategy: 'RandomShuffled' | 'WeightedDifficulty' | 'Fixed' | 'AIGenerated';
  displayOrder: number;
}

export interface AssessmentBlueprintData {
  id: number;
  code: string;
  name: string;
  defaultPassingPercentage: number;
  totalDurationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  enableQuestionShuffling: boolean;
  enableOptionShuffling: boolean;
  isDefault?: boolean;
  assignedRolesCount?: number;
  sectionRules: AssessmentSectionRuleItem[];
}

export interface RoleTierMatrixItemData {
  id: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  department: string;
  primaryLanguage: string;
  tier: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  minExperienceYears: number;
  maxExperienceYears: number;
  blueprintId: number;
  blueprintName: string;
  passingPercentage: number;
  defaultBaseCTC: number;
  autoAdvanceOnPass: boolean;
  autoRejectOnFail: boolean;
  autoPrepareOfferOnFinalPass: boolean;
  isDefault: boolean;
  isActive: boolean;
  poolStatus: {
    isReady: boolean;
    availableCount: number;
    requiredCount: number;
    missingCount: number;
  };
}
