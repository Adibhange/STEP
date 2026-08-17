export interface MockQuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface MockQuestionBankItem {
  id: number;
  code?: string;
  language: string; // e.g. "General Aptitude", "C# (.NET)", "JavaScript / React", "TypeScript", "SQL (Database)", "Python", "Java", "C++", "Go (Golang)"
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
  {
    id: 1,
    code: 'QB-APT-01',
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'If a car travels 120 km in 2 hours, what is its average speed in meters per second (m/s)?',
    marks: 1.0,
    options: [
      { label: 'A', text: '16.67 m/s', isCorrect: true },
      { label: 'B', text: '20.00 m/s', isCorrect: false },
      { label: 'C', text: '60.00 m/s', isCorrect: false },
      { label: 'D', text: '25.50 m/s', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 2,
    code: 'QB-APT-02',
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'Find the next number in the series: 3, 6, 12, 24, 48, ?',
    marks: 1.0,
    options: [
      { label: 'A', text: '72', isCorrect: false },
      { label: 'B', text: '96', isCorrect: true },
      { label: 'C', text: '84', isCorrect: false },
      { label: 'D', text: '108', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 3,
    code: 'QB-DOT-01',
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Junior',
    questionText: 'What is the primary architectural difference between a class and a struct in C#?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'Class is a reference type (heap); Struct is a value type (stack).', isCorrect: true },
      { label: 'B', text: 'Structs support inheritance while classes do not.', isCorrect: false },
      { label: 'C', text: 'There is no difference in memory allocation.', isCorrect: false },
      { label: 'D', text: 'Structs cannot have constructors.', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 4,
    code: 'QB-DOT-02',
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'MULTI_CHOICE',
    experienceTier: 'Senior',
    questionText: 'Which of the following statements about Garbage Collection in .NET are true? (Select all that apply)',
    marks: 2.0,
    options: [
      { label: 'A', text: 'Gen 0 collects short-lived objects most frequently.', isCorrect: true },
      { label: 'B', text: 'Objects surviving Gen 1 collection are promoted to Gen 2.', isCorrect: true },
      { label: 'C', text: 'Large Object Heap (LOH) is compacted during every Gen 0 collection.', isCorrect: false },
      { label: 'D', text: 'GC only manages memory and does not deterministically close unmanaged file handles.', isCorrect: true },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 5,
    code: 'QB-RCT-01',
    language: 'JavaScript / React',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Junior',
    questionText: 'What is the primary purpose of the useCallback hook in React?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'Memoizes callback instances between renders to prevent unnecessary re-renders.', isCorrect: true },
      { label: 'B', text: 'Executes side effects after the browser finishes rendering.', isCorrect: false },
      { label: 'C', text: 'Directly mutates the real DOM tree.', isCorrect: false },
      { label: 'D', text: 'Persists component state into localStorage automatically.', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 6,
    code: 'QB-SQL-01',
    language: 'SQL (Database)',
    sectionType: 'SQLQuery',
    questionType: 'SQL',
    experienceTier: 'Mid-Level',
    questionText: 'Write an SQL query to find the 2nd highest salary from the Employee table without using hardcoded limits.',
    marks: 5.0,
    sqlSchema: 'CREATE TABLE Employee (\n  Id INT PRIMARY KEY IDENTITY(1,1),\n  Name NVARCHAR(50) NOT NULL,\n  Salary DECIMAL(18,2) NOT NULL\n);',
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 7,
    code: 'QB-ALG-01',
    language: 'JavaScript / React',
    sectionType: 'Coding',
    questionType: 'CODING',
    experienceTier: 'Senior',
    questionText: 'Implement a function isPalindrome(str) that returns true if a given string reads the same forwards and backwards, ignoring casing and spaces.',
    starterCode: 'function isPalindrome(str) {\n  // Your code here\n}',
    testCases: 'Input: "racecar" -> true | Input: "hello" -> false',
    marks: 10.0,
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 8,
    code: 'QB-PY-01',
    language: 'Python',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'Which Python keyword is used to create an anonymous inline function?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'def', isCorrect: false },
      { label: 'B', text: 'lambda', isCorrect: true },
      { label: 'C', text: 'func', isCorrect: false },
      { label: 'D', text: 'inline', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 9,
    code: 'QB-TS-01',
    language: 'TypeScript',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Junior',
    questionText: 'What does the `readonly` modifier do when applied to a TypeScript array (e.g. `readonly number[]`)?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'Prevents mutation methods like push(), pop(), splice(), and reassigning elements.', isCorrect: true },
      { label: 'B', text: 'Freezes the array at JavaScript runtime via Object.freeze.', isCorrect: false },
      { label: 'C', text: 'Converts the array into a Set data structure.', isCorrect: false },
      { label: 'D', text: 'Only allows reading the first element of the array.', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
  {
    id: 10,
    code: 'QB-JV-01',
    language: 'Java',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Mid-Level',
    questionText: 'In Java, which collection class is synchronized and thread-safe by default?',
    marks: 1.0,
    options: [
      { label: 'A', text: 'ArrayList', isCorrect: false },
      { label: 'B', text: 'Vector', isCorrect: true },
      { label: 'C', text: 'LinkedList', isCorrect: false },
      { label: 'D', text: 'HashSet', isCorrect: false },
    ],
    isActive: true,
    updatedAt: '2026-08-17',
  },
];
