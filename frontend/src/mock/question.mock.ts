export interface QuestionRecord {
  id: number;
  code: string;
  category: 'C#' | 'Next.js' | 'SQL Server' | 'Data Structures' | 'System Design' | 'Aptitude';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  marks: number;
  tags: string[];
}

const categories: QuestionRecord['category'][] = ['C#', 'Next.js', 'SQL Server', 'Data Structures', 'System Design', 'Aptitude'];
const difficulties: QuestionRecord['difficulty'][] = ['Easy', 'Medium', 'Hard'];

const questionTemplates = [
  'What is the difference between IEnumerable and IQueryable in Entity Framework Core?',
  'Explain the Server Components execution model in Next.js 16 App Router.',
  'How do you optimize indexed views and query execution plans in SQL Server?',
  'Implement an O(1) time complexity LRU Cache data structure.',
  'Design a high-concurrency anti-cheating video/tab proctoring pipeline.',
  'What is the result of evaluated closure state in asynchronous JavaScript promises?',
  'Explain dependency injection lifetimes (Transient, Scoped, Singleton) in .NET Core.',
];

export const mockQuestions: QuestionRecord[] = Array.from({ length: 1000 }, (_, i) => {
  const id = i + 1;
  const category = categories[i % categories.length];
  const difficulty = difficulties[i % difficulties.length];
  const title = `[Q${id}] ${questionTemplates[i % questionTemplates.length]}`;
  const marks = difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 5 : 10;

  return {
    id,
    code: `QST-${String(id).padStart(4, '0')}`,
    category,
    difficulty,
    title,
    marks,
    tags: [category.toLowerCase(), difficulty.toLowerCase(), 'core-assessment'],
  };
});
