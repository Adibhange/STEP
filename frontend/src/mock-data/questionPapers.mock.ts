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
  {
    id: 1,
    title: '.NET Core 10 & Distributed Systems Paper',
    paperCode: 'QP-NET-2026',
    category: 'Backend Engineering',
    vacancyId: 1,
    vacancyTitle: 'Senior .NET Core Architect',
    status: 'Active',
    totalQuestions: 6,
    totalMarks: 100,
    durationMinutes: 60,
    publishedAt: '2026-01-16T10:00:00Z',
    questions: [
      {
        id: 101,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In ASP.NET Core dependency injection, which service lifetime registers an instance created once per client request/connection?',
        marks: 10,
        timeAllowedMinutes: 5,
        options: [
          { id: 1, label: 'A', text: 'Transient', optionLabel: 'A', optionText: 'Transient', isCorrect: false },
          { id: 2, label: 'B', text: 'Scoped', optionLabel: 'B', optionText: 'Scoped', isCorrect: true },
          { id: 3, label: 'C', text: 'Singleton', optionLabel: 'C', optionText: 'Singleton', isCorrect: false },
          { id: 4, label: 'D', text: 'Pooled', optionLabel: 'D', optionText: 'Pooled', isCorrect: false },
        ],
      },
      {
        id: 102,
        displayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'When designing a distributed transaction across microservices where ACID is impossible, which architectural pattern is recommended?',
        marks: 10,
        timeAllowedMinutes: 5,
        options: [
          { id: 5, label: 'A', text: 'Two-Phase Commit (2PC) over HTTP', optionLabel: 'A', optionText: 'Two-Phase Commit (2PC) over HTTP', isCorrect: false },
          { id: 6, label: 'B', text: 'Saga Pattern (Orchestration or Choreography)', optionLabel: 'B', optionText: 'Saga Pattern (Orchestration or Choreography)', isCorrect: true },
          { id: 7, label: 'C', text: 'Shared database locking', optionLabel: 'C', optionText: 'Shared database locking', isCorrect: false },
          { id: 8, label: 'D', text: 'Eventual Read Replica Poll', optionLabel: 'D', optionText: 'Eventual Read Replica Poll', isCorrect: false },
        ],
      },
      {
        id: 103,
        displayOrder: 3,
        questionType: 'MULTI_CHOICE',
        questionText: 'Which of the following are valid performance optimizations in Entity Framework Core? (Select all that apply)',
        marks: 15,
        timeAllowedMinutes: 5,
        options: [
          { id: 9, label: 'A', text: 'AsNoTracking() for read-only queries', optionLabel: 'A', optionText: 'AsNoTracking() for read-only queries', isCorrect: true },
          { id: 10, label: 'B', text: 'Projection using Select() into DTOs', optionLabel: 'B', optionText: 'Projection using Select() into DTOs', isCorrect: true },
          { id: 11, label: 'C', text: 'Calling ToList() before applying Where clauses', optionLabel: 'C', optionText: 'Calling ToList() before applying Where clauses', isCorrect: false },
          { id: 12, label: 'D', text: 'Split Queries via AsSplitQuery() for multi-collection joins', optionLabel: 'D', optionText: 'Split Queries via AsSplitQuery() for multi-collection joins', isCorrect: true },
        ],
      },
      {
        id: 104,
        displayOrder: 4,
        questionType: 'CODING',
        questionText: 'Implement a thread-safe LRU (Least Recently Used) Cache with O(1) time complexity for Get and Put operations in C#.',
        marks: 30,
        timeAllowedMinutes: 25,
        programmingLanguage: 'csharp',
        codeTemplate: `using System;
using System.Collections.Generic;

public class LRUCache<TKey, TValue> {
    private readonly int _capacity;
    // TODO: Add internal data structures (Dictionary + LinkedList)

    public LRUCache(int capacity) {
        _capacity = capacity;
    }

    public TValue Get(TKey key) {
        // Implement O(1) Get and update access order
        throw new NotImplementedException();
    }

    public void Put(TKey key, TValue value) {
        // Implement O(1) Put with eviction if capacity exceeded
        throw new NotImplementedException();
    }
}`,
        options: [],
      },
      {
        id: 105,
        displayOrder: 5,
        questionType: 'SQL',
        questionText: 'Write a SQL query to find the 2nd highest salary from the Employee table without using the TOP or LIMIT keyword.',
        marks: 15,
        timeAllowedMinutes: 10,
        sqlSchema: `CREATE TABLE Employees (
    Id INT PRIMARY KEY,
    FullName VARCHAR(100),
    Salary DECIMAL(18,2),
    DepartmentId INT
);`,
        options: [],
      },
      {
        id: 106,
        displayOrder: 6,
        questionType: 'SUBJECTIVE',
        questionText: 'Explain the difference between CQRS (Command Query Responsibility Segregation) and Event Sourcing. How would you handle eventual consistency in a banking payment transfer?',
        marks: 20,
        timeAllowedMinutes: 10,
        maxWordCount: 500,
        options: [],
      },
    ],
  },
  {
    id: 2,
    title: 'React 19 & Modern Web Architecture Paper',
    paperCode: 'QP-REACT-2026',
    category: 'Frontend Engineering',
    vacancyId: 2,
    vacancyTitle: 'Full Stack React / Node Lead Developer',
    status: 'Active',
    totalQuestions: 5,
    totalMarks: 100,
    durationMinutes: 45,
    publishedAt: '2026-01-21T11:00:00Z',
    questions: [
      {
        id: 201,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'What is the key benefit of React Server Components (RSC) compared to traditional client-side rendering?',
        marks: 15,
        timeAllowedMinutes: 5,
        options: [
          { id: 21, label: 'A', text: 'Zero bundle size impact on the client for server-only dependencies', optionLabel: 'A', optionText: 'Zero bundle size impact on the client for server-only dependencies', isCorrect: true },
          { id: 22, label: 'B', text: 'Automatic WebSocket connection for state synchronization', optionLabel: 'B', optionText: 'Automatic WebSocket connection for state synchronization', isCorrect: false },
          { id: 23, label: 'C', text: 'Direct access to client localStorage on the server', optionLabel: 'C', optionText: 'Direct access to client localStorage on the server', isCorrect: false },
          { id: 24, label: 'D', text: 'Renders synchronous layout without streaming HTML', optionLabel: 'D', optionText: 'Renders synchronous layout without streaming HTML', isCorrect: false },
        ],
      },
      {
        id: 202,
        displayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In React 19, what does the useActionState hook primarily provide?',
        marks: 15,
        timeAllowedMinutes: 5,
        options: [
          { id: 25, label: 'A', text: 'Manages Redux store subscriptions automatically', optionLabel: 'A', optionText: 'Manages Redux store subscriptions automatically', isCorrect: false },
          { id: 26, label: 'B', text: 'Updates state based on the result of a form action, including pending state', optionLabel: 'B', optionText: 'Updates state based on the result of a form action, including pending state', isCorrect: true },
          { id: 27, label: 'C', text: 'Replaces all standard useState hooks', optionLabel: 'C', optionText: 'Replaces all standard useState hooks', isCorrect: false },
          { id: 28, label: 'D', text: 'Injects CSS variables into DOM elements', optionLabel: 'D', optionText: 'Injects CSS variables into DOM elements', isCorrect: false },
        ],
      },
      {
        id: 203,
        displayOrder: 3,
        questionType: 'CODING',
        questionText: 'Implement a custom debounce hook `useDebounce<T>(value: T, delay: number): T` in TypeScript with cleanup.',
        marks: 35,
        timeAllowedMinutes: 20,
        programmingLanguage: 'typescript',
        codeTemplate: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
    // Implement debounce logic with useEffect and timeout cleanup
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    return debouncedValue;
}`,
        options: [],
      },
      {
        id: 204,
        displayOrder: 4,
        questionType: 'SUBJECTIVE',
        questionText: 'Describe how you would architect an enterprise Design System in React with support for dynamic theming (Dark/Light/High Contrast) and WCAG 2.1 AA accessibility.',
        marks: 35,
        timeAllowedMinutes: 15,
        maxWordCount: 400,
        options: [],
      },
    ],
  },
  {
    id: 3,
    title: 'QA Automation & Test Strategy Paper',
    paperCode: 'QP-QA-2026',
    category: 'Quality Assurance',
    vacancyId: 3,
    vacancyTitle: 'QA Automation Lead',
    status: 'Active',
    totalQuestions: 4,
    totalMarks: 100,
    durationMinutes: 45,
    publishedAt: '2026-02-02T09:00:00Z',
    questions: [
      {
        id: 301,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In Playwright, what is the primary advantage of Page Object Models (POM)?',
        marks: 20,
        timeAllowedMinutes: 5,
        options: [
          { id: 31, label: 'A', text: 'Faster network packet delivery', optionLabel: 'A', optionText: 'Faster network packet delivery', isCorrect: false },
          { id: 32, label: 'B', text: 'Encapsulates page selectors and user workflows to maximize maintainability', optionLabel: 'B', optionText: 'Encapsulates page selectors and user workflows to maximize maintainability', isCorrect: true },
          { id: 33, label: 'C', text: 'Eliminates the need for assertions', optionLabel: 'C', optionText: 'Eliminates the need for assertions', isCorrect: false },
          { id: 34, label: 'D', text: 'Compiles TypeScript to native machine code', optionLabel: 'D', optionText: 'Compiles TypeScript to native machine code', isCorrect: false },
        ],
      },
      {
        id: 302,
        displayOrder: 2,
        questionType: 'CODING',
        questionText: 'Write a Playwright TypeScript test that visits a login page, fills credentials, asserts redirect to dashboard, and verifies authentication token in localStorage.',
        marks: 40,
        timeAllowedMinutes: 25,
        programmingLanguage: 'typescript',
        codeTemplate: `import { test, expect } from '@playwright/test';

test('Verify successful candidate login and dashboard redirect', async ({ page }) => {
    // TODO: Navigate to '/', fill inputs, click submit, assert URL and storage
});`,
        options: [],
      },
      {
        id: 303,
        displayOrder: 3,
        questionType: 'SUBJECTIVE',
        questionText: 'Explain how you design a CI/CD test pipeline with parallel test shard execution, flaky test retry quarantine, and automated Slack/Email reporting.',
        marks: 40,
        timeAllowedMinutes: 15,
        maxWordCount: 500,
        options: [],
      },
    ],
  },
];
