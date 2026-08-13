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
