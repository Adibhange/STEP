import { CandidateBulkItem } from '../types/vacancy.types';

/**
 * STEP Enterprise Platform — Candidate Directory & Bulk Flow Utility
 *
 * Generates 500+ mock candidates and implements 1-click 50/50 Random A/B Flow Distribution.
 */

export function generateMockCandidates(count: number = 500): CandidateBulkItem[] {
  const sampleNames = [
    'Aarav Sharma', 'Ananya Patel', 'Rohan Gupta', 'Priya Verma', 'Vikram Singh',
    'Neha Reddy', 'Rahul Joshi', 'Sneha Kulkarni', 'Aditya Iyer', 'Pooja Mehta',
    'Siddharth Nair', 'Kavya Rao', 'Karan Deshmukh', 'Divya Malhotra', 'Amit Choudhury',
    'Ishaan Bhatia', 'Riya Saxena', 'Manish Kapoor', 'Tanvi Agarwal', 'Varun Pillai',
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = sampleNames[i % sampleNames.length] + (i >= sampleNames.length ? ` (${Math.floor(i / sampleNames.length) + 1})` : '');
    const code = `STEP-2026-${(1000 + i + 1)}`;
    const email = `${name.toLowerCase().replace(/[^\w]/g, '.')}@example.com`;
    const assignedFlow = i % 2 === 0 ? 'Flow A — Standard Walk-in' : 'Flow B — Fast-Track Tech';

    return {
      id: `cand-${i + 1}`,
      code,
      name,
      email,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      appliedDate: '2026-08-01',
      flowVersion: assignedFlow,
      status: 'Assigned',
    };
  });
}

// 1-Click Random 50/50 A/B Flow Distribution
export function distributeRandomABFlows(
  candidates: CandidateBulkItem[],
  flowNames: string[] = ['Flow A — Standard Walk-in', 'Flow B — Fast-Track Tech']
): CandidateBulkItem[] {
  return candidates.map((cand) => {
    const randomFlow = flowNames[Math.floor(Math.random() * flowNames.length)];
    return {
      ...cand,
      flowVersion: randomFlow,
    };
  });
}
