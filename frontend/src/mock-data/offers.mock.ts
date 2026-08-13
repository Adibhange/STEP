import type { OfferLetterData } from '@/store/services/api';

export const MOCK_OFFERS: Record<number, OfferLetterData> = {
  4001: {
    id: 4001,
    candidateId: 3,
    candidateName: 'Rohan Kulkarni',
    vacancyId: 1,
    vacancyTitle: 'Senior .NET Core Architect',
    offeredCTC: 3500000,
    joiningDate: '2026-03-01',
    status: 'Approved',
    preparedByName: 'Priya Sharma (HR)',
    approvedByName: 'Rajesh Kulkarni (Director)',
    approvedAt: '2026-01-26T18:10:00Z',
    generatedPdfPath: '/mock-documents/offer_rohan_kulkarni.pdf',
  },
  4002: {
    id: 4002,
    candidateId: 2,
    candidateName: 'Ananya Iyer',
    vacancyId: 2,
    vacancyTitle: 'Full Stack React / Node Lead Developer',
    offeredCTC: 2100000,
    joiningDate: '2026-03-15',
    status: 'Draft',
    preparedByName: 'Priya Sharma (HR)',
    approvedByName: null,
    approvedAt: null,
    generatedPdfPath: null,
  },
};
