import type {
  LiveExamWorkspaceData,
  ExamEvaluationViewData,
  SubmitExamResultData,
  ReportExamViolationResultData,
  PublishResultData,
} from '@/store/services/api';

export const MOCK_EXAM_SESSIONS: Record<string, LiveExamWorkspaceData> = {
  'SES-EXAM-1001': {
    sessionToken: 'SES-EXAM-1001',
    candidateName: 'Aarav Sharma',
    vacancyTitle: 'Senior .NET Core Architect',
    paperTitle: '.NET Core 10 & Distributed Systems Paper',
    durationMinutes: 60,
    totalTimeLeftSeconds: 3200,
    activeQuestionIndex: 0,
    sessionStatus: 'InProgress',
    questions: [
      {
        id: 101,
        displayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In ASP.NET Core dependency injection, which service lifetime registers an instance created once per client request/connection?',
        marks: 10,
        timeAllowedMinutes: 5,
        programmingLanguage: null,
        sqlSchema: null,
        maxWordCount: null,
        options: [
          { id: 1, label: 'A', text: 'Transient' },
          { id: 2, label: 'B', text: 'Scoped' },
          { id: 3, label: 'C', text: 'Singleton' },
          { id: 4, label: 'D', text: 'Pooled' },
        ],
        submittedAnswerText: null,
        selectedOptionIds: [2],
      },
      {
        id: 102,
        displayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'When designing a distributed transaction across microservices where ACID is impossible, which architectural pattern is recommended?',
        marks: 10,
        timeAllowedMinutes: 5,
        programmingLanguage: null,
        sqlSchema: null,
        maxWordCount: null,
        options: [
          { id: 5, label: 'A', text: 'Two-Phase Commit (2PC) over HTTP' },
          { id: 6, label: 'B', text: 'Saga Pattern (Orchestration or Choreography)' },
          { id: 7, label: 'C', text: 'Shared database locking' },
          { id: 8, label: 'D', text: 'Eventual Read Replica Poll' },
        ],
        submittedAnswerText: null,
        selectedOptionIds: [6],
      },
      {
        id: 103,
        displayOrder: 3,
        questionType: 'CODING',
        questionText: 'Implement a thread-safe LRU (Least Recently Used) Cache with O(1) time complexity for Get and Put operations in C#.',
        marks: 30,
        timeAllowedMinutes: 25,
        programmingLanguage: 'csharp',
        sqlSchema: null,
        maxWordCount: null,
        options: [],
        submittedAnswerText: `using System;
using System.Collections.Generic;

public class LRUCache<TKey, TValue> {
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>> _map;
    private readonly LinkedList<(TKey Key, TValue Value)> _list;
    private readonly object _lock = new object();

    public LRUCache(int capacity) {
        _capacity = capacity;
        _map = new Dictionary<TKey, LinkedListNode<(TKey, TValue)>>(capacity);
        _list = new LinkedList<(TKey, TValue)>();
    }

    public TValue Get(TKey key) {
        lock (_lock) {
            if (_map.TryGetValue(key, out var node)) {
                _list.Remove(node);
                _list.AddFirst(node);
                return node.Value.Value;
            }
            throw new KeyNotFoundException();
        }
    }

    public void Put(TKey key, TValue value) {
        lock (_lock) {
            if (_map.TryGetValue(key, out var node)) {
                _list.Remove(node);
                node.Value = (key, value);
                _list.AddFirst(node);
            } else {
                if (_map.Count >= _capacity) {
                    var last = _list.Last;
                    _map.Remove(last.Value.Key);
                    _list.RemoveLast();
                }
                var newNode = new LinkedListNode<(TKey, TValue)>((key, value));
                _list.AddFirst(newNode);
                _map[key] = newNode;
            }
        }
    }
}`,
        selectedOptionIds: [],
      },
    ],
  },
};

export const MOCK_EVALUATION_SESSIONS: Record<number, ExamEvaluationViewData> = {
  9001: {
    candidateExamSessionId: 9001,
    candidateName: 'Aarav Sharma',
    vacancyTitle: 'Senior .NET Core Architect',
    paperTitle: 'General Aptitude & Logical Elimination Paper (QP-APT-2026)',
    sessionStatus: 'Completed',
    evaluationStatus: 'Evaluated',
    totalMarks: 100,
    totalScore: 88,
    frozenTotalDurationMinutes: 45,
    startedAt: '2026-01-19T09:00:00Z',
    submittedAt: '2026-01-19T09:45:00Z',
    tabSwitchWarnings: 0,
    assessmentIntegrityScore: 100,
    answers: [
      {
        candidateExamAnswerId: 401,
        questionDisplayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'If the price of a commodity increases by 25%, by what percent must a household reduce its consumption so as not to increase its total expenditure?',
        submittedAnswerText: null,
        marks: 20,
        marksObtained: 20,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Correct calculation: (25 / 125) * 100 = 20%.',
        options: [
          { id: 1, label: 'A', text: '15%', isCorrect: false },
          { id: 2, label: 'B', text: '20%', isCorrect: true },
          { id: 3, label: 'C', text: '25%', isCorrect: false },
          { id: 4, label: 'D', text: '30%', isCorrect: false },
        ],
        selectedOptionIds: [2],
      },
      {
        candidateExamAnswerId: 402,
        questionDisplayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'Statements: All architects are engineers. Some engineers are innovators.\nConclusions:\nI. Some innovators are architects.\nII. Some engineers are architects.',
        submittedAnswerText: null,
        marks: 20,
        marksObtained: 20,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Correct deduction: Only conclusion II definitely follows.',
        options: [
          { id: 5, label: 'A', text: 'Only Conclusion I follows', isCorrect: false },
          { id: 6, label: 'B', text: 'Only Conclusion II follows', isCorrect: true },
          { id: 7, label: 'C', text: 'Either I or II follows', isCorrect: false },
          { id: 8, label: 'D', text: 'Both I and II follow', isCorrect: false },
        ],
        selectedOptionIds: [6],
      },
      {
        candidateExamAnswerId: 403,
        questionDisplayOrder: 3,
        questionType: 'SINGLE_CHOICE',
        questionText: 'Two trains 140m and 160m long run at 60 km/h and 40 km/h respectively in opposite directions. The time taken to completely cross each other is:',
        submittedAnswerText: null,
        marks: 20,
        marksObtained: 20,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Relative speed = 100 km/h = 27.78 m/s. Total distance = 300m. Time = 300 / 27.78 = 10.8s.',
        options: [
          { id: 9, label: 'A', text: '9.5 seconds', isCorrect: false },
          { id: 10, label: 'B', text: '10.8 seconds', isCorrect: true },
          { id: 11, label: 'C', text: '12.0 seconds', isCorrect: false },
          { id: 12, label: 'D', text: '14.2 seconds', isCorrect: false },
        ],
        selectedOptionIds: [10],
      },
      {
        candidateExamAnswerId: 404,
        questionDisplayOrder: 4,
        questionType: 'SINGLE_CHOICE',
        questionText: 'Identify the next number in the pattern sequence: 4, 18, 48, 100, 180, ?',
        submittedAnswerText: null,
        marks: 20,
        marksObtained: 18,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Correct cubic-quadratic polynomial progression n^3 - n^2.',
        options: [
          { id: 13, label: 'A', text: '248', isCorrect: false },
          { id: 14, label: 'B', text: '294', isCorrect: true },
          { id: 15, label: 'C', text: '312', isCorrect: false },
          { id: 16, label: 'D', text: '360', isCorrect: false },
        ],
        selectedOptionIds: [14],
      },
      {
        candidateExamAnswerId: 405,
        questionDisplayOrder: 5,
        questionType: 'SUBJECTIVE',
        questionText: 'An enterprise recruitment portal observed high walk-in attendance on Saturdays but longer wait times during interview rounds. Propose 3 operational optimizations to resolve the bottleneck.',
        submittedAnswerText: `1. Implement parallel batch scheduling for Aptitude tests with automated instant grading elimination.
2. Pre-screen resumes and assign dedicated tech panel interview time slots based on Aptitude cut-off scores (≥70%).
3. Establish a live queue display on digital boards and candidate SMS notifications to eliminate hall congestion.`,
        marks: 20,
        marksObtained: 18,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Practical, well-structured operational bottleneck mitigation proposal.',
        options: [],
        selectedOptionIds: [],
      },
    ],
  },
  1001: {
    candidateExamSessionId: 1001,
    candidateName: 'Aarav Sharma',
    vacancyTitle: 'Senior .NET Core Architect',
    paperTitle: '.NET Core 10 & Distributed Systems Paper',
    sessionStatus: 'Completed',
    evaluationStatus: 'Evaluated',
    totalMarks: 100,
    totalScore: 88,
    frozenTotalDurationMinutes: 52,
    startedAt: '2026-01-19T10:00:00Z',
    submittedAt: '2026-01-19T10:52:00Z',
    tabSwitchWarnings: 0,
    assessmentIntegrityScore: 100,
    answers: [
      {
        candidateExamAnswerId: 501,
        questionDisplayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'In ASP.NET Core dependency injection, which service lifetime registers an instance created once per client request/connection?',
        submittedAnswerText: null,
        marks: 10,
        marksObtained: 10,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Correct option B (Scoped) selected.',
        options: [
          { id: 1, label: 'A', text: 'Transient', isCorrect: false },
          { id: 2, label: 'B', text: 'Scoped', isCorrect: true },
          { id: 3, label: 'C', text: 'Singleton', isCorrect: false },
          { id: 4, label: 'D', text: 'Pooled', isCorrect: false },
        ],
        selectedOptionIds: [2],
      },
      {
        candidateExamAnswerId: 502,
        questionDisplayOrder: 2,
        questionType: 'SINGLE_CHOICE',
        questionText: 'When designing a distributed transaction across microservices where ACID is impossible, which architectural pattern is recommended?',
        submittedAnswerText: null,
        marks: 10,
        marksObtained: 10,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Correct option B (Saga Pattern) selected.',
        options: [
          { id: 5, label: 'A', text: 'Two-Phase Commit (2PC) over HTTP', isCorrect: false },
          { id: 6, label: 'B', text: 'Saga Pattern (Orchestration or Choreography)', isCorrect: true },
          { id: 7, label: 'C', text: 'Shared database locking', isCorrect: false },
          { id: 8, label: 'D', text: 'Eventual Read Replica Poll', isCorrect: false },
        ],
        selectedOptionIds: [6],
      },
      {
        candidateExamAnswerId: 503,
        questionDisplayOrder: 3,
        questionType: 'CODING',
        questionText: 'Implement a thread-safe LRU (Least Recently Used) Cache with O(1) time complexity for Get and Put operations in C#.',
        submittedAnswerText: `public class LRUCache<TKey, TValue> {
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>> _map;
    private readonly LinkedList<(TKey Key, TValue Value)> _list;
    private readonly object _lock = new object();

    public LRUCache(int capacity) {
        _capacity = capacity;
        _map = new Dictionary<TKey, LinkedListNode<(TKey, TValue)>>(capacity);
        _list = new LinkedList<(TKey, TValue)>();
    }

    public TValue Get(TKey key) {
        lock (_lock) {
            if (_map.TryGetValue(key, out var node)) {
                _list.Remove(node);
                _list.AddFirst(node);
                return node.Value.Value;
            }
            throw new KeyNotFoundException();
        }
    }

    public void Put(TKey key, TValue value) {
        lock (_lock) {
            if (_map.TryGetValue(key, out var node)) {
                _list.Remove(node);
                node.Value = (key, value);
                _list.AddFirst(node);
            } else {
                if (_map.Count >= _capacity) {
                    var last = _list.Last;
                    _map.Remove(last.Value.Key);
                    _list.RemoveLast();
                }
                var newNode = new LinkedListNode<(TKey, TValue)>((key, value));
                _list.AddFirst(newNode);
                _map[key] = newNode;
            }
        }
    }
}`,
        marks: 30,
        marksObtained: 28,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Excellent O(1) thread-safe implementation using Dictionary + LinkedList with lock synchronization.',
        options: [],
        selectedOptionIds: [],
      },
      {
        candidateExamAnswerId: 504,
        questionDisplayOrder: 4,
        questionType: 'SQL',
        questionText: 'Write a SQL query to find the 2nd highest salary from the Employee table without using the TOP or LIMIT keyword.',
        submittedAnswerText: `SELECT MAX(Salary) AS SecondHighestSalary
FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);`,
        marks: 15,
        marksObtained: 15,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Perfect subquery solution.',
        options: [],
        selectedOptionIds: [],
      },
      {
        candidateExamAnswerId: 505,
        questionDisplayOrder: 5,
        questionType: 'SUBJECTIVE',
        questionText: 'Explain the difference between CQRS and Event Sourcing. How would you handle eventual consistency in a banking payment transfer?',
        submittedAnswerText: `CQRS separates Read operations (Queries) from Write operations (Commands) using dedicated models. Event Sourcing stores the state of a business entity as an append-only sequence of domain events instead of mutating a single row.

In a banking payment transfer:
1. TransferRequested Command produces 'TransferInitiatedEvent'
2. MoneyDebitedEvent from Source Account
3. MoneyCreditedEvent to Destination Account
4. In case of network failure on step 3, Compensating Transaction 'MoneyRefundedEvent' is published to restore balance.
Read replicas consume events asynchronously to update AccountBalanceView.`,
        marks: 20,
        marksObtained: 18,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Clear explanation of compensating saga transactions for eventual consistency.',
        options: [],
        selectedOptionIds: [],
      },
    ],
  },
  1002: {
    candidateExamSessionId: 1002,
    candidateName: 'Ananya Iyer',
    vacancyTitle: 'Full Stack React / Node Lead Developer',
    paperTitle: 'React 19 & Modern Web Architecture Paper',
    sessionStatus: 'Completed',
    evaluationStatus: 'Evaluated',
    totalMarks: 100,
    totalScore: 92,
    frozenTotalDurationMinutes: 40,
    startedAt: '2026-01-23T11:00:00Z',
    submittedAt: '2026-01-23T11:40:00Z',
    tabSwitchWarnings: 0,
    assessmentIntegrityScore: 100,
    answers: [
      {
        candidateExamAnswerId: 506,
        questionDisplayOrder: 1,
        questionType: 'SINGLE_CHOICE',
        questionText: 'What is the key benefit of React Server Components (RSC) compared to traditional client-side rendering?',
        submittedAnswerText: null,
        marks: 15,
        marksObtained: 15,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Correct option A selected.',
        options: [
          { id: 21, label: 'A', text: 'Zero bundle size impact on the client for server-only dependencies', isCorrect: true },
          { id: 22, label: 'B', text: 'Automatic WebSocket connection for state synchronization', isCorrect: false },
          { id: 23, label: 'C', text: 'Direct access to client localStorage on the server', isCorrect: false },
          { id: 24, label: 'D', text: 'Renders synchronous layout without streaming HTML', isCorrect: false },
        ],
        selectedOptionIds: [21],
      },
      {
        candidateExamAnswerId: 507,
        questionDisplayOrder: 2,
        questionType: 'CODING',
        questionText: 'Implement a custom debounce hook useDebounce<T>(value: T, delay: number): T in TypeScript with cleanup.',
        submittedAnswerText: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}`,
        marks: 35,
        marksObtained: 35,
        evaluationStatus: 'Evaluated',
        evaluationLocked: true,
        evaluatorRemarks: 'Flawless implementation with cleanup timeout.',
        options: [],
        selectedOptionIds: [],
      },
    ],
  },
};
