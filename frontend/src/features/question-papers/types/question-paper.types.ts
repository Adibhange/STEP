/**
 * STEP Enterprise Platform — Question Paper Types
 *
 * Papers are linked to a Vacancy via its AssessmentPattern (sections).
 * Each section maps to a round with specific question types.
 */

export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';

export interface MCQOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuestionItem {
  id: string;
  questionType: QuestionType;
  questionText: string;
  // MCQ fields
  options?: MCQOption[];
  correctOption?: string; // e.g. 'A' or 'A,C' for multi
  // Coding / SQL fields
  language?: string;
  problemStatement?: string;
  // Subjective fields
  maxWordCount?: number;
}

export interface PaperSection {
  id: string;
  sectionTitle: string;
  questionType: QuestionType;
  totalQuestions: number;
  marksPerQuestion: number;
  totalMarks: number;
  timeLimitMinutes: number;
  questions: QuestionItem[];
}

export type PaperStatus = 'Active' | 'Inactive';

export interface QuestionPaper {
  id: string;
  title: string;
  vacancyId: string;
  vacancyTitle: string;
  category: string;
  status: PaperStatus;
  totalQuestions: number;
  totalMarks: number;
  durationMins: number;
  sections: PaperSection[];
  lastUpdated: string;
}
