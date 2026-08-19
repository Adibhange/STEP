export interface MockQuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface MockQuestionBankItem {
  id: number;
  code?: string;
  language: string; // e.g. "General Aptitude", "C# (.NET)", "JavaScript / React", "TypeScript", "SQL (Database)", "Python", "DevOps & Cloud"
  sectionType: 'Aptitude' | 'TechnicalMCQ' | 'Coding' | 'SQLQuery' | 'SubjectiveTheory';
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'CODING' | 'SQL' | 'SUBJECTIVE';
  experienceTier: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  questionText: string;
  marks: number;
  sqlSchema?: string | null;
  starterCode?: string | null;
  testCases?: string | null;
  options?: MockQuestionOption[];
  isActive?: boolean;
  updatedAt?: string;
}

export const MOCK_QUESTION_BANK: MockQuestionBankItem[] = [
  // ── General Aptitude (Round 1 Walk-in Elimination) ─────────────────────────
  {
    id: 1,
    code: 'QB-APT-01',
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long at the same speed?',
    marks: 1.0,
    options: [
      { label: 'A', text: '65 seconds', isCorrect: false },
      { label: 'B', text: '89 seconds', isCorrect: true },
      { label: 'C', text: '100 seconds', isCorrect: false },
      { label: 'D', text: '75 seconds', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 2,
    code: 'QB-APT-02',
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'If 12 men can complete a project in 18 days working 8 hours a day, how many days will 16 men take working 9 hours a day?',
    marks: 1.0,
    options: [
      { label: 'A', text: '12 days', isCorrect: true },
      { label: 'B', text: '14 days', isCorrect: false },
      { label: 'C', text: '10 days', isCorrect: false },
      { label: 'D', text: '16 days', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 3,
    code: 'QB-APT-03',
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'Find the missing number in the sequence: 4, 18, 48, 100, 180, ?',
    marks: 1.0,
    options: [
      { label: 'A', text: '294', isCorrect: true },
      { label: 'B', text: '280', isCorrect: false },
      { label: 'C', text: '312', isCorrect: false },
      { label: 'D', text: '264', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 4,
    code: 'QB-APT-04',
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'Brother', isCorrect: false },
      { label: 'B', text: 'Uncle', isCorrect: false },
      { label: 'C', text: 'Father', isCorrect: true },
      { label: 'D', text: 'Grandfather', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },

  // ── C# & .NET 10 (Round 2 Technical Assessment) ───────────────────────────
  {
    id: 5,
    code: 'QB-DOT-01',
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Junior',
    questionText: 'What is the primary architectural difference between a class and a struct in C# memory management?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'Class instances are allocated on the Managed Heap (Reference Type); Structs are allocated inline on the Stack (Value Type).', isCorrect: true },
      { label: 'B', text: 'Structs support multi-level class inheritance.', isCorrect: false },
      { label: 'C', text: 'Classes cannot implement interfaces.', isCorrect: false },
      { label: 'D', text: 'Structs cannot have parameterized constructors.', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 6,
    code: 'QB-DOT-02',
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'MULTI_CHOICE',
    experienceTier: 'Senior',
    questionText: 'Which of the following statements about Garbage Collection in .NET Core are true? (Select all that apply)',
    marks: 2.0,
    options: [
      { label: 'A', text: 'Gen 0 collects short-lived objects most frequently.', isCorrect: true },
      { label: 'B', text: 'Objects surviving Gen 1 collection are promoted to Gen 2.', isCorrect: true },
      { label: 'C', text: 'Large Object Heap (LOH) holds objects >= 85,000 bytes and avoids frequent compaction.', isCorrect: true },
      { label: 'D', text: 'Calling GC.Collect() manually in high-throughput production paths is always recommended.', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 7,
    code: 'QB-DOT-03',
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Senior',
    questionText: 'In ASP.NET Core dependency injection, which service lifetime registers an instance created once per HTTP client request pipeline?',
    marks: 2.0,
    options: [
      { label: 'A', text: 'Transient (AddTransient)', isCorrect: false },
      { label: 'B', text: 'Scoped (AddScoped)', isCorrect: true },
      { label: 'C', text: 'Singleton (AddSingleton)', isCorrect: false },
      { label: 'D', text: 'Hosted (AddHostedService)', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 8,
    code: 'QB-DOT-04',
    language: 'C# (.NET)',
    sectionType: 'Coding',
    questionType: 'CODING',
    experienceTier: 'Senior',
    questionText: 'Implement a thread-safe LRU (Least Recently Used) Cache with O(1) time complexity for Get and Put operations in C# using a Doubly Linked List and Dictionary.',
    marks: 20.0,
    starterCode: `public class LRUCache<TKey, TValue> {
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
    isActive: true,
    updatedAt: '2026-02-18',
  },

  // ── React & TypeScript ───────────────────────────────────────────────────────
  {
    id: 9,
    code: 'QB-RCT-01',
    language: 'JavaScript / React',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Mid-Level',
    questionText: 'In React 19, which hook is natively provided for managing asynchronous form submissions and pending server action state?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'useActionState', isCorrect: true },
      { label: 'B', text: 'useAsyncEffect', isCorrect: false },
      { label: 'C', text: 'useServerTransition', isCorrect: false },
      { label: 'D', text: 'useFormSubmit', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 10,
    code: 'QB-RCT-02',
    language: 'JavaScript / React',
    sectionType: 'TechnicalMCQ',
    questionType: 'MULTI_CHOICE',
    experienceTier: 'Senior',
    questionText: 'Which techniques prevent unnecessary re-renders in a high-scale React component tree? (Select all that apply)',
    marks: 2.0,
    options: [
      { label: 'A', text: 'Wrapping functional components with React.memo() with shallow prop comparison', isCorrect: true },
      { label: 'B', text: 'Memoizing heavy computed values with useMemo()', isCorrect: true },
      { label: 'C', text: 'Memoizing callback handlers passed to children with useCallback()', isCorrect: true },
      { label: 'D', text: 'Declaring inline arrow functions directly in JSX props', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 11,
    code: 'QB-RCT-03',
    language: 'TypeScript',
    sectionType: 'Coding',
    questionType: 'CODING',
    experienceTier: 'Senior',
    questionText: 'Implement a custom TypeScript debounce hook `useDebounce<T>(value: T, delayMs: number): T` with cancellation support on unmount.',
    marks: 15.0,
    starterCode: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  // TODO: Implement debounced value state and cleanup
  return value;
}`,
    isActive: true,
    updatedAt: '2026-02-18',
  },

  // ── SQL & Relational Databases ───────────────────────────────────────────────
  {
    id: 12,
    code: 'QB-SQL-01',
    language: 'SQL (Database)',
    sectionType: 'SQLQuery',
    questionType: 'SQL',
    experienceTier: 'Mid-Level',
    questionText: 'Write a query to find the 2nd highest salary from the Employee table using SQL Window Functions without using LIMIT or TOP.',
    marks: 10.0,
    sqlSchema: `CREATE TABLE Employees (
    Id INT PRIMARY KEY,
    FullName VARCHAR(100),
    Department VARCHAR(50),
    Salary DECIMAL(18,2)
);`,
    isActive: true,
    updatedAt: '2026-02-18',
  },
  {
    id: 13,
    code: 'QB-SQL-02',
    language: 'SQL (Database)',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Senior',
    questionText: 'What is the primary difference between a Clustered and a Non-Clustered Index in SQL Server?',
    marks: 2.0,
    options: [
      { label: 'A', text: 'A Clustered Index physically determines the storage order of table data rows; a Non-Clustered Index is a separate pointer structure.', isCorrect: true },
      { label: 'B', text: 'A table can have multiple clustered indexes but only one non-clustered index.', isCorrect: false },
      { label: 'C', text: 'Non-clustered indexes cannot include covered columns.', isCorrect: false },
      { label: 'D', text: 'Clustered indexes are stored in RAM while non-clustered are on disk.', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },

  // ── Cloud & DevOps ──────────────────────────────────────────────────────────
  {
    id: 14,
    code: 'QB-DOP-01',
    language: 'DevOps & Cloud',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Senior',
    questionText: 'In Kubernetes, which controller is responsible for ensuring that a specified number of Pod replicas are running across worker nodes at all times?',
    marks: 2.0,
    options: [
      { label: 'A', text: 'ReplicaSet (managed by Deployment)', isCorrect: true },
      { label: 'B', text: 'DaemonSet', isCorrect: false },
      { label: 'C', text: 'StatefulSet', isCorrect: false },
      { label: 'D', text: 'Ingress Controller', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-02-18',
  },
];
