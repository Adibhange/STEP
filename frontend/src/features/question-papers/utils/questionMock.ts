import { QuestionPaper, PaperSection, QuestionItem } from '../types/question-paper.types';

/**
 * Mock question generator — papers are derived from vacancy assessment patterns.
 * Each vacancy defines sections (sectionTitle, totalQuestions, marksPerQuestion, timeLimitMinutes).
 * Papers are uploaded via the Assessment Builder Excel in Step 3.
 */

function genMCQQuestions(count: number, sectionTitle: string): QuestionItem[] {
  const samples = [
    { q: `Which of the following best describes a key concept in ${sectionTitle}?`, opts: ['It handles state management', 'It is a server-side framework', 'It optimizes rendering performance', 'It manages database connections'], correct: 'C' },
    { q: `What is the primary advantage of using ${sectionTitle} in enterprise applications?`, opts: ['Improved developer experience', 'Better database integration', 'Scalable component architecture', 'Reduced bundle size'], correct: 'C' },
    { q: `In ${sectionTitle}, which pattern is commonly used for dependency injection?`, opts: ['Singleton', 'Factory', 'Repository', 'Observer'], correct: 'B' },
    { q: `Which approach ensures type safety in ${sectionTitle}?`, opts: ['Using any type', 'Strict TypeScript generics', 'Dynamic typing', 'JavaScript duck typing'], correct: 'B' },
    { q: `What differentiates ${sectionTitle} from traditional approaches?`, opts: ['Higher memory usage', 'Declarative UI rendering', 'Manual DOM manipulation', 'Global state by default'], correct: 'B' },
  ];
  return Array.from({ length: count }, (_, i) => {
    const s = samples[i % samples.length];
    return {
      id: `q-mcq-${i + 1}`,
      questionType: 'SINGLE_CHOICE' as const,
      questionText: s.q,
      options: s.opts.map((text, idx) => ({ label: (['A', 'B', 'C', 'D'] as const)[idx], text })),
      correctOption: s.correct,
    };
  });
}

function genCodingQuestions(count: number, sectionTitle: string): QuestionItem[] {
  const samples = [
    { q: `Implement a function that solves a common ${sectionTitle} algorithmic problem.`, lang: 'Python', problem: `Write a function that takes an array of integers and returns the maximum subarray sum.\n\nExample:\nInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6 (subarray [4,-1,2,1])` },
    { q: `Design and implement a data structure for ${sectionTitle}.`, lang: 'JavaScript', problem: `Implement an LRU Cache with O(1) get and put operations.\n\nConstraints:\n- 1 <= capacity <= 3000\n- 0 <= key <= 10^4\n- All operations must be O(1)` },
  ];
  return Array.from({ length: count }, (_, i) => {
    const s = samples[i % samples.length];
    return {
      id: `q-code-${i + 1}`,
      questionType: 'CODING' as const,
      questionText: s.q,
      language: s.lang,
      problemStatement: s.problem,
    };
  });
}

function genSQLQuestions(count: number): QuestionItem[] {
  const samples = [
    { q: 'Write an SQL query to find the top 3 departments by average employee salary.', problem: 'Schema:\nemployees(id, name, salary, department_id)\ndepartments(id, name)\n\nWrite a query to find the top 3 departments by average salary.' },
    { q: 'Write a SQL query to find candidates who appeared in assessments but never passed.', problem: 'Schema:\ncandidates(id, name, email)\nassessment_results(id, candidate_id, score, passing_score, taken_at)\n\nFind candidates who took at least one assessment but never scored >= passing_score.' },
  ];
  return Array.from({ length: count }, (_, i) => {
    const s = samples[i % samples.length];
    return {
      id: `q-sql-${i + 1}`,
      questionType: 'SQL' as const,
      questionText: s.q,
      language: 'SQL',
      problemStatement: s.problem,
    };
  });
}

function genSubjectiveQuestions(count: number, sectionTitle: string): QuestionItem[] {
  const samples = [
    `Explain the architectural principles behind ${sectionTitle} and how they apply in a large-scale enterprise system.`,
    `Describe a real-world challenge you faced in ${sectionTitle} and how you resolved it.`,
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `q-subj-${i + 1}`,
    questionType: 'SUBJECTIVE' as const,
    questionText: samples[i % samples.length],
    maxWordCount: 500,
  }));
}

function buildSections(template: { title: string; qType: 'MCQ' | 'Coding' | 'SQL' | 'Subjective'; count: number; marksPerQ: number; mins: number }[]): PaperSection[] {
  return template.map((t, idx) => {
    let questions: QuestionItem[] = [];
    if (t.qType === 'MCQ') questions = genMCQQuestions(t.count, t.title);
    else if (t.qType === 'Coding') questions = genCodingQuestions(t.count, t.title);
    else if (t.qType === 'SQL') questions = genSQLQuestions(t.count);
    else questions = genSubjectiveQuestions(t.count, t.title);

    const qType = t.qType === 'MCQ' ? 'SINGLE_CHOICE' : t.qType === 'Coding' ? 'CODING' : t.qType === 'SQL' ? 'SQL' : 'SUBJECTIVE';

    return {
      id: `sec-${idx + 1}`,
      sectionTitle: t.title,
      questionType: qType as PaperSection['questionType'],
      totalQuestions: t.count,
      marksPerQuestion: t.marksPerQ,
      totalMarks: t.count * t.marksPerQ,
      timeLimitMinutes: t.mins,
      questions,
    };
  });
}

const PAPER_TEMPLATES: Array<{
  title: string; vacancyId: string; vacancyTitle: string; category: string;
  sections: { title: string; qType: 'MCQ' | 'Coding' | 'SQL' | 'Subjective'; count: number; marksPerQ: number; mins: number }[];
}> = [
  { title: 'Advanced React 19 & TypeScript Enterprise Paper A', vacancyId: 'vac-101', vacancyTitle: 'Senior React / Next.js Developer', category: 'Frontend Engineering', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 30, marksPerQ: 2, mins: 30 }, { title: 'Coding & Algorithm Challenge', qType: 'Coding', count: 3, marksPerQ: 20, mins: 60 }] },
  { title: 'Node.js & PostgreSQL System Architecture Paper', vacancyId: 'vac-102', vacancyTitle: 'Node.js Backend Microservices Lead', category: 'Backend Engineering', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 20, marksPerQ: 2, mins: 20 }, { title: 'SQL & Database Queries', qType: 'SQL', count: 5, marksPerQ: 10, mins: 30 }, { title: 'Coding & Algorithm Challenge', qType: 'Coding', count: 2, marksPerQ: 15, mins: 40 }] },
  { title: 'QA Automation & Cypress / Playwright Test Paper', vacancyId: 'vac-103', vacancyTitle: 'Senior QA Automation Engineer', category: 'Quality Assurance', sections: [{ title: 'MCQ (Multiple Choice)', qType: 'MCQ', count: 25, marksPerQ: 2, mins: 25 }, { title: 'Subjective & Essay Questions', qType: 'Subjective', count: 5, marksPerQ: 10, mins: 30 }] },
  { title: 'SQL & Database Query Engineering Challenge', vacancyId: 'vac-104', vacancyTitle: 'Database Engineer', category: 'Backend Engineering', sections: [{ title: 'SQL & Database Queries', qType: 'SQL', count: 15, marksPerQ: 5, mins: 40 }, { title: 'MCQ (Single Choice)', qType: 'MCQ', count: 10, marksPerQ: 2, mins: 10 }] },
  { title: 'General Aptitude & Logical Reasoning Screening', vacancyId: 'vac-105', vacancyTitle: 'Graduate Trainee Engineer', category: 'Aptitude', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 50, marksPerQ: 1, mins: 45 }] },
  { title: 'System Design & Architecture Senior Round', vacancyId: 'vac-106', vacancyTitle: 'Principal Engineer', category: 'Engineering', sections: [{ title: 'Subjective & Essay Questions', qType: 'Subjective', count: 5, marksPerQ: 10, mins: 45 }, { title: 'Coding & Algorithm Challenge', qType: 'Coding', count: 3, marksPerQ: 20, mins: 60 }] },
  { title: '.NET Core & C# Enterprise Backend Paper', vacancyId: 'vac-107', vacancyTitle: '.NET Backend Developer', category: 'Backend Engineering', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 25, marksPerQ: 2, mins: 25 }, { title: 'Coding & Algorithm Challenge', qType: 'Coding', count: 3, marksPerQ: 20, mins: 60 }] },
  { title: 'Data Structures & Algorithms Assessment Paper', vacancyId: 'vac-108', vacancyTitle: 'Software Development Engineer', category: 'Engineering', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 20, marksPerQ: 2, mins: 20 }, { title: 'Coding & Algorithm Challenge', qType: 'Coding', count: 5, marksPerQ: 20, mins: 75 }] },
  { title: 'DevOps & Cloud Infrastructure Assessment', vacancyId: 'vac-109', vacancyTitle: 'DevOps Engineer', category: 'DevOps', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 30, marksPerQ: 2, mins: 30 }, { title: 'Subjective & Essay Questions', qType: 'Subjective', count: 5, marksPerQ: 8, mins: 30 }] },
  { title: 'Product Management Case Study Paper', vacancyId: 'vac-110', vacancyTitle: 'Product Manager', category: 'Product Management', sections: [{ title: 'MCQ (Single Choice)', qType: 'MCQ', count: 20, marksPerQ: 2, mins: 20 }, { title: 'Subjective & Essay Questions', qType: 'Subjective', count: 8, marksPerQ: 10, mins: 60 }] },
];

// Generate 100 papers by cycling through templates
export const MOCK_PAPERS_100: QuestionPaper[] = Array.from({ length: 100 }, (_, i) => {
  const tmpl = PAPER_TEMPLATES[i % PAPER_TEMPLATES.length];
  const suffix = i >= PAPER_TEMPLATES.length ? ` (v${Math.floor(i / PAPER_TEMPLATES.length) + 1})` : '';
  const sections = buildSections(tmpl.sections);
  const totalQuestions = sections.reduce((a, s) => a + s.totalQuestions, 0);
  const totalMarks = sections.reduce((a, s) => a + s.totalMarks, 0);
  const durationMins = sections.reduce((a, s) => a + s.timeLimitMinutes, 0);

  const statuses = ['Active', 'Active', 'Active', 'Inactive'] as const;

  return {
    id: `qp-${201 + i}`,
    title: `${tmpl.title}${suffix}`,
    vacancyId: tmpl.vacancyId,
    vacancyTitle: tmpl.vacancyTitle,
    category: tmpl.category,
    status: statuses[i % statuses.length],
    totalQuestions,
    totalMarks,
    durationMins,
    sections,
    lastUpdated: `2026-0${(i % 8) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
  };
});
