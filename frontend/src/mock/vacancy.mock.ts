export interface VacancyRecord {
  id: number;
  code: string;
  title: string;
  department: string;
  location: string;
  minExperience: number;
  maxExperience: number;
  openingsCount: number;
  status: 'Published' | 'Draft' | 'Closed' | 'Hold';
  candidateCount: number;
  closureDate: string;
}

const titles = [
  'Senior Full Stack Engineer',
  'Backend Architect (.NET 10)',
  'Lead Next.js Frontend Developer',
  'DevOps Cloud Engineer',
  'Database Administrator (SQL Server)',
  'Senior QA Specialist',
  'Product Manager (HR Tech)',
  'Security & Anti-Cheat Compliance Lead',
];

const departments = ['Engineering', 'Product', 'Infrastructure', 'Quality Assurance', 'Security'];

export const mockVacancies: VacancyRecord[] = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const title = `${titles[i % titles.length]} ${Math.floor(i / titles.length) > 0 ? `Team ${Math.floor(i / titles.length) + 1}` : ''}`;
  const code = `VAC-2026-${String(id).padStart(3, '0')}`;
  const department = departments[i % departments.length];

  return {
    id,
    code,
    title,
    department,
    location: i % 3 === 0 ? 'Mumbai' : i % 3 === 1 ? 'Pune' : 'Remote India',
    minExperience: 3,
    maxExperience: 8,
    openingsCount: 3 + (i % 5),
    status: i % 6 === 0 ? 'Draft' : i % 8 === 0 ? 'Hold' : 'Published',
    candidateCount: 15 + (i * 3) % 40,
    closureDate: new Date(2026, 8, 15 + (i % 15)).toISOString().split('T')[0],
  };
});
