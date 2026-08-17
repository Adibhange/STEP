export interface AssessmentSectionRuleItem {
  id?: number;
  sectionName: string;
  sectionType: 'TechnicalMCQ' | 'Coding' | 'SQLQuery' | 'SubjectiveTheory';
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

export interface AssessmentBlueprint {
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

export interface RoleTierMatrixItem {
  id: number; // Unique mapping ID
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
  defaultBaseCTC: number; // in LPA
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

export const MOCK_BLUEPRINTS: AssessmentBlueprint[] = [
  // ── TEMPLATE 1: Standard Assessment Track (MCQ Only) ──
  {
    id: 1,
    code: 'RULE-MCQ-ONLY',
    name: 'Standard Assessment Track (MCQ Only)',
    defaultPassingPercentage: 70,
    totalDurationMinutes: 30,
    totalQuestions: 20,
    totalMarks: 20,
    enableQuestionShuffling: true,
    enableOptionShuffling: true,
    isDefault: true,
    assignedRolesCount: 3,
    sectionRules: [
      {
        id: 101,
        sectionName: 'Domain & Technical MCQs',
        sectionType: 'TechnicalMCQ',
        questionType: 'SINGLE_CHOICE',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: '{InheritFromRole}',
        questionCount: 20,
        marksPerQuestion: 1.0,
        timeLimitMinutes: 30,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 1,
      },
    ],
  },

  // ── TEMPLATE 2: Software Engineering Technical Track (20 MCQ + 5 Coding + 3 Subjective) ──
  {
    id: 2,
    code: 'RULE-TECH-ENG',
    name: 'Software Engineering Technical Track',
    defaultPassingPercentage: 70,
    totalDurationMinutes: 85,
    totalQuestions: 28,
    totalMarks: 60,
    enableQuestionShuffling: true,
    enableOptionShuffling: true,
    isDefault: false,
    assignedRolesCount: 5,
    sectionRules: [
      {
        id: 201,
        sectionName: 'Technical MCQs (Single & Multi-Select)',
        sectionType: 'TechnicalMCQ',
        questionType: 'SINGLE_CHOICE',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: '{InheritFromRole}',
        questionCount: 20,
        marksPerQuestion: 1.0,
        timeLimitMinutes: 25,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 1,
      },
      {
        id: 202,
        sectionName: 'Live Coding IDE Challenges',
        sectionType: 'Coding',
        questionType: 'CODING',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: '{InheritFromRole}',
        questionCount: 5,
        marksPerQuestion: 5.0,
        timeLimitMinutes: 45,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 2,
      },
      {
        id: 203,
        sectionName: 'Subjective / Architecture Questions',
        sectionType: 'SubjectiveTheory',
        questionType: 'SUBJECTIVE',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: '{InheritFromRole}',
        questionCount: 3,
        marksPerQuestion: 5.0,
        timeLimitMinutes: 15,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 3,
      },
    ],
  },

  // ── TEMPLATE 3: Database & SQL Engineering Track (20 MCQ + 5 SQL + 3 Subjective) ──
  {
    id: 3,
    code: 'RULE-DATA-SQL',
    name: 'Database & SQL Engineering Track',
    defaultPassingPercentage: 70,
    totalDurationMinutes: 85,
    totalQuestions: 28,
    totalMarks: 60,
    enableQuestionShuffling: true,
    enableOptionShuffling: true,
    isDefault: false,
    assignedRolesCount: 2,
    sectionRules: [
      {
        id: 301,
        sectionName: 'Database & Data Platform MCQs',
        sectionType: 'TechnicalMCQ',
        questionType: 'SINGLE_CHOICE',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: 'SQL,Database',
        questionCount: 20,
        marksPerQuestion: 1.0,
        timeLimitMinutes: 25,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 1,
      },
      {
        id: 302,
        sectionName: 'SQL Query Sandbox Challenges',
        sectionType: 'SQLQuery',
        questionType: 'SQL',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: 'SQL,Joins,WindowFunctions',
        questionCount: 5,
        marksPerQuestion: 5.0,
        timeLimitMinutes: 45,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 2,
      },
      {
        id: 303,
        sectionName: 'Subjective / Database Design Questions',
        sectionType: 'SubjectiveTheory',
        questionType: 'SUBJECTIVE',
        experienceTier: '{InheritFromCandidateTier}',
        requiredTags: 'DatabaseDesign,Optimization',
        questionCount: 3,
        marksPerQuestion: 5.0,
        timeLimitMinutes: 15,
        selectionStrategy: 'RandomShuffled',
        displayOrder: 3,
      },
    ],
  },
];

export const MOCK_ROLE_TIER_MATRIX: RoleTierMatrixItem[] = [
  // Senior .NET Architect (Role ID: 1)
  {
    id: 101,
    roleId: 1,
    roleCode: 'SNET',
    roleName: 'Senior .NET Architect',
    department: 'Engineering',
    primaryLanguage: 'C# (.NET)',
    tier: 'Fresher',
    minExperienceYears: 0,
    maxExperienceYears: 1,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 65,
    defaultBaseCTC: 4.5,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: true,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 85, requiredCount: 28, missingCount: 0 },
  },
  {
    id: 102,
    roleId: 1,
    roleCode: 'SNET',
    roleName: 'Senior .NET Architect',
    department: 'Engineering',
    primaryLanguage: 'C# (.NET)',
    tier: 'Junior',
    minExperienceYears: 1,
    maxExperienceYears: 2.5,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 70,
    defaultBaseCTC: 6.5,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: false,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 85, requiredCount: 28, missingCount: 0 },
  },
  {
    id: 103,
    roleId: 1,
    roleCode: 'SNET',
    roleName: 'Senior .NET Architect',
    department: 'Engineering',
    primaryLanguage: 'C# (.NET)',
    tier: 'Mid-Level',
    minExperienceYears: 2.5,
    maxExperienceYears: 4.5,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 75,
    defaultBaseCTC: 12.0,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: false,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 85, requiredCount: 28, missingCount: 0 },
  },
  {
    id: 104,
    roleId: 1,
    roleCode: 'SNET',
    roleName: 'Senior .NET Architect',
    department: 'Engineering',
    primaryLanguage: 'C# (.NET)',
    tier: 'Senior',
    minExperienceYears: 4.5,
    maxExperienceYears: 7.0,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 80,
    defaultBaseCTC: 18.0,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: false,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 85, requiredCount: 28, missingCount: 0 },
  },

  // Full Stack React & Node Developer (Role ID: 2)
  {
    id: 201,
    roleId: 2,
    roleCode: 'FSRN',
    roleName: 'Full Stack React & Node Developer',
    department: 'Engineering',
    primaryLanguage: 'JavaScript / React',
    tier: 'Fresher',
    minExperienceYears: 0,
    maxExperienceYears: 1,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 65,
    defaultBaseCTC: 4.5,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: true,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 92, requiredCount: 28, missingCount: 0 },
  },
  {
    id: 202,
    roleId: 2,
    roleCode: 'FSRN',
    roleName: 'Full Stack React & Node Developer',
    department: 'Engineering',
    primaryLanguage: 'JavaScript / React',
    tier: 'Junior',
    minExperienceYears: 1,
    maxExperienceYears: 3,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 70,
    defaultBaseCTC: 8.0,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: false,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 92, requiredCount: 28, missingCount: 0 },
  },
  {
    id: 203,
    roleId: 2,
    roleCode: 'FSRN',
    roleName: 'Full Stack React & Node Developer',
    department: 'Engineering',
    primaryLanguage: 'JavaScript / React',
    tier: 'Senior',
    minExperienceYears: 3,
    maxExperienceYears: 6,
    blueprintId: 2,
    blueprintName: 'Software Engineering Technical Track',
    passingPercentage: 75,
    defaultBaseCTC: 16.0,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: false,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 92, requiredCount: 28, missingCount: 0 },
  },

  // QA Automation Engineer (Role ID: 3)
  {
    id: 301,
    roleId: 3,
    roleCode: 'QA-AUT',
    roleName: 'QA Automation Engineer',
    department: 'Quality Assurance',
    primaryLanguage: 'TypeScript',
    tier: 'Junior',
    minExperienceYears: 1,
    maxExperienceYears: 3,
    blueprintId: 1,
    blueprintName: 'Standard Assessment Track (MCQ Only)',
    passingPercentage: 70,
    defaultBaseCTC: 6.0,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: true,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 45, requiredCount: 20, missingCount: 0 },
  },

  // Data Platform & SQL Engineer (Role ID: 4)
  {
    id: 401,
    roleId: 4,
    roleCode: 'DATA-SQL',
    roleName: 'Data Platform & SQL Engineer',
    department: 'Data Platform',
    primaryLanguage: 'SQL (Database)',
    tier: 'Junior',
    minExperienceYears: 1,
    maxExperienceYears: 3,
    blueprintId: 3,
    blueprintName: 'Database & SQL Engineering Track',
    passingPercentage: 70,
    defaultBaseCTC: 7.5,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: true,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 65, requiredCount: 28, missingCount: 0 },
  },
  {
    id: 402,
    roleId: 4,
    roleCode: 'DATA-SQL',
    roleName: 'Data Platform & SQL Engineer',
    department: 'Data Platform',
    primaryLanguage: 'SQL (Database)',
    tier: 'Senior',
    minExperienceYears: 3,
    maxExperienceYears: 6,
    blueprintId: 3,
    blueprintName: 'Database & SQL Engineering Track',
    passingPercentage: 75,
    defaultBaseCTC: 15.0,
    autoAdvanceOnPass: true,
    autoRejectOnFail: true,
    autoPrepareOfferOnFinalPass: true,
    isDefault: false,
    isActive: true,
    poolStatus: { isReady: true, availableCount: 65, requiredCount: 28, missingCount: 0 },
  },
];
