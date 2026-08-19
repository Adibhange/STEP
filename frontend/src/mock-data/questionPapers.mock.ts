export interface MockQuestionOption {
  id: number;
  label: string;
  text: string;
  optionLabel?: string;
  optionText?: string;
  isCorrect?: boolean;
}

export interface MockQuestionItem {
  id: number;
  displayOrder: number;
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';
  questionText: string;
  marks: number;
  timeAllowedMinutes: number | null;
  programmingLanguage?: string | null;
  sqlSchema?: string | null;
  codeTemplate?: string | null;
  maxWordCount?: number | null;
  options: MockQuestionOption[];
}

export interface MockQuestionPaper {
  id: number;
  title: string;
  paperCode: string;
  category: string;
  vacancyId: number;
  vacancyTitle?: string;
  status: 'Active' | 'Draft' | 'Inactive';
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  publishedAt: string;
  questions: MockQuestionItem[];
}

export const MOCK_QUESTION_PAPERS: MockQuestionPaper[] = [
  // ── 1. General Aptitude (Round 1 Universal Walk-in Elimination Paper) ───────
  {
    id: 10,
    title: 'General Aptitude & Reasoning Elimination Paper',
    paperCode: 'QP-APT-2026',
    category: 'General Assessment',
    vacancyId: 1,
    vacancyTitle: 'Universal Walk-In Drive Elimination',
    status: 'Active',
    totalQuestions: 4,
    totalMarks: 40,
    durationMinutes: 45,
    publishedAt: '2026-01-15T09:00:00Z',
    questions: [
      {
        id: 1,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long at the same speed?',
        marks: 10,
        timeAllowedMinutes: 10,
        options: [
          { id: 1, label: 'A', text: '65 seconds', optionLabel: 'A', optionText: '65 seconds', isCorrect: false },
          { id: 2, label: 'B', text: '89 seconds', optionLabel: 'B', optionText: '89 seconds', isCorrect: true },
          { id: 3, label: 'C', text: '100 seconds', optionLabel: 'C', optionText: '100 seconds', isCorrect: false },
          { id: 4, label: 'D', text: '75 seconds', optionLabel: 'D', optionText: '75 seconds', isCorrect: false },
        ],
      },
      {
        id: 2,
        displayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'If 12 men can complete a project in 18 days working 8 hours a day, how many days will 16 men take working 9 hours a day?',
        marks: 10,
        timeAllowedMinutes: 10,
        options: [
          { id: 5, label: 'A', text: '12 days', optionLabel: 'A', optionText: '12 days', isCorrect: true },
          { id: 6, label: 'B', text: '14 days', optionLabel: 'B', optionText: '14 days', isCorrect: false },
          { id: 7, label: 'C', text: '10 days', optionLabel: 'C', optionText: '10 days', isCorrect: false },
          { id: 8, label: 'D', text: '16 days', optionLabel: 'D', optionText: '16 days', isCorrect: false },
        ],
      },
      {
        id: 3,
        displayOrder: 3,
        questionType: 'SINGLE_CHOICE',
        questionText: 'Find the missing number in the sequence: 4, 18, 48, 100, 180, ?',
        marks: 10,
        timeAllowedMinutes: 10,
        options: [
          { id: 9, label: 'A', text: '294', optionLabel: 'A', optionText: '294', isCorrect: true },
          { id: 10, label: 'B', text: '280', optionLabel: 'B', optionText: '280', isCorrect: false },
          { id: 11, label: 'C', text: '312', optionLabel: 'C', optionText: '312', isCorrect: false },
          { id: 12, label: 'D', text: '264', optionLabel: 'D', optionText: '264', isCorrect: false },
        ],
      },
      {
        id: 4,
        displayOrder: 4,
        questionType: 'SINGLE_CHOICE',
        questionText: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
        marks: 10,
        timeAllowedMinutes: 10,
        options: [
          { id: 13, label: 'A', text: 'Brother', optionLabel: 'A', optionText: 'Brother', isCorrect: false },
          { id: 14, label: 'B', text: 'Uncle', optionLabel: 'B', optionText: 'Uncle', isCorrect: false },
          { id: 15, label: 'C', text: 'Father', optionLabel: 'C', optionText: 'Father', isCorrect: true },
          { id: 16, label: 'D', text: 'Grandfather', optionLabel: 'D', optionText: 'Grandfather', isCorrect: false },
        ],
      },
    ],
  },

  // ── 2. .NET Core 10 & Distributed Systems Paper ─────────────────────────────
  {
    id: 1,
    title: '.NET Core 10 & Distributed Systems Paper',
    paperCode: 'QP-NET-2026',
    category: 'Backend Engineering',
    vacancyId: 1,
    vacancyTitle: 'Senior .NET Core Architect',
    status: 'Active',
    totalQuestions: 4,
    totalMarks: 100,
    durationMinutes: 60,
    publishedAt: '2026-01-16T10:00:00Z',
    questions: [
      {
        id: 101,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In ASP.NET Core dependency injection, which service lifetime registers an instance created once per client request/connection?',
        marks: 15,
        timeAllowedMinutes: 5,
        options: [
          { id: 101, label: 'A', text: 'Transient', optionLabel: 'A', optionText: 'Transient', isCorrect: false },
          { id: 102, label: 'B', text: 'Scoped', optionLabel: 'B', optionText: 'Scoped', isCorrect: true },
          { id: 103, label: 'C', text: 'Singleton', optionLabel: 'C', optionText: 'Singleton', isCorrect: false },
          { id: 104, label: 'D', text: 'Pooled', optionLabel: 'D', optionText: 'Pooled', isCorrect: false },
        ],
      },
      {
        id: 102,
        displayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'When designing a distributed transaction across microservices where ACID is impossible, which architectural pattern is recommended?',
        marks: 15,
        timeAllowedMinutes: 5,
        options: [
          { id: 105, label: 'A', text: 'Two-Phase Commit (2PC) over HTTP', optionLabel: 'A', optionText: 'Two-Phase Commit (2PC) over HTTP', isCorrect: false },
          { id: 106, label: 'B', text: 'Saga Pattern (Orchestration or Choreography)', optionLabel: 'B', optionText: 'Saga Pattern (Orchestration or Choreography)', isCorrect: true },
          { id: 107, label: 'C', text: 'Shared database locking', optionLabel: 'C', optionText: 'Shared database locking', isCorrect: false },
          { id: 108, label: 'D', text: 'Eventual Read Replica Poll', optionLabel: 'D', optionText: 'Eventual Read Replica Poll', isCorrect: false },
        ],
      },
      {
        id: 103,
        displayOrder: 3,
        questionType: 'MULTI_CHOICE',
        questionText: 'Which of the following are valid performance optimizations in Entity Framework Core? (Select all that apply)',
        marks: 20,
        timeAllowedMinutes: 10,
        options: [
          { id: 109, label: 'A', text: 'AsNoTracking() for read-only queries', optionLabel: 'A', optionText: 'AsNoTracking() for read-only queries', isCorrect: true },
          { id: 110, label: 'B', text: 'Projection using Select() into DTOs', optionLabel: 'B', optionText: 'Projection using Select() into DTOs', isCorrect: true },
          { id: 111, label: 'C', text: 'Calling ToList() before applying Where clauses', optionLabel: 'C', optionText: 'Calling ToList() before applying Where clauses', isCorrect: false },
          { id: 112, label: 'D', text: 'Split Queries via AsSplitQuery() for multi-collection joins', optionLabel: 'D', optionText: 'Split Queries via AsSplitQuery() for multi-collection joins', isCorrect: true },
        ],
      },
      {
        id: 104,
        displayOrder: 4,
        questionType: 'CODING',
        questionText: 'Implement a thread-safe LRU (Least Recently Used) Cache with O(1) time complexity for Get and Put operations in C#.',
        marks: 50,
        timeAllowedMinutes: 40,
        programmingLanguage: 'C#',
        codeTemplate: `public class LRUCache<TKey, TValue> {
    private readonly int _capacity;
    public LRUCache(int capacity) {
        _capacity = capacity;
    }
    public TValue Get(TKey key) {
        // TODO: Implement O(1) Get
        throw new NotImplementedException();
    }
    public void Put(TKey key, TValue value) {
        // TODO: Implement O(1) Put
        throw new NotImplementedException();
    }
}`,
        options: [],
      },
    ],
  },

  // ── 3. React 19 & TypeScript Frontend Architecture Paper ───────────────────
  {
    id: 2,
    title: 'React 19 & TypeScript Frontend Architecture Paper',
    paperCode: 'QP-RCT-2026',
    category: 'Frontend Engineering',
    vacancyId: 2,
    vacancyTitle: 'Full Stack React / Node Lead Developer',
    status: 'Active',
    totalQuestions: 3,
    totalMarks: 100,
    durationMinutes: 60,
    publishedAt: '2026-01-21T10:00:00Z',
    questions: [
      {
        id: 201,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In React 19, which hook is natively provided for managing asynchronous form submissions and pending server action state?',
        marks: 20,
        timeAllowedMinutes: 5,
        options: [
          { id: 201, label: 'A', text: 'useActionState', optionLabel: 'A', optionText: 'useActionState', isCorrect: true },
          { id: 202, label: 'B', text: 'useAsyncEffect', optionLabel: 'B', optionText: 'useAsyncEffect', isCorrect: false },
          { id: 203, label: 'C', text: 'useServerTransition', optionLabel: 'C', optionText: 'useServerTransition', isCorrect: false },
          { id: 204, label: 'D', text: 'useFormSubmit', optionLabel: 'D', optionText: 'useFormSubmit', isCorrect: false },
        ],
      },
      {
        id: 202,
        displayOrder: 2,
        questionType: 'MULTI_CHOICE',
        questionText: 'Which techniques prevent unnecessary re-renders in a high-scale React component tree? (Select all that apply)',
        marks: 30,
        timeAllowedMinutes: 10,
        options: [
          { id: 205, label: 'A', text: 'Wrapping functional components with React.memo()', optionLabel: 'A', optionText: 'Wrapping functional components with React.memo()', isCorrect: true },
          { id: 206, label: 'B', text: 'Memoizing heavy computed values with useMemo()', optionLabel: 'B', optionText: 'Memoizing heavy computed values with useMemo()', isCorrect: true },
          { id: 207, label: 'C', text: 'Memoizing callback handlers passed to children with useCallback()', optionLabel: 'C', optionText: 'Memoizing callback handlers passed to children with useCallback()', isCorrect: true },
          { id: 208, label: 'D', text: 'Passing unstable arrow functions into useEffect dependency arrays', optionLabel: 'D', optionText: 'Passing unstable arrow functions into useEffect dependency arrays', isCorrect: false },
        ],
      },
      {
        id: 203,
        displayOrder: 3,
        questionType: 'CODING',
        questionText: 'Implement a custom TypeScript debounce hook `useDebounce<T>(value: T, delayMs: number): T` with unmount cleanup.',
        marks: 50,
        timeAllowedMinutes: 45,
        programmingLanguage: 'TypeScript',
        codeTemplate: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  // TODO: Implement debounced state and cleanup
  return value;
}`,
        options: [],
      },
    ],
  },
];
