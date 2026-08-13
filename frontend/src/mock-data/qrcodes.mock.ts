import type {
  QRCodeData,
  QRCodeAnalyticsData,
  QRScanResultData,
  QRRegistrationEligibilityData,
} from '@/store/services/api';

export const MOCK_QR_CODES: Record<string, QRCodeData> = {
  'WALK-IN-2026-PUNE': {
    id: 1,
    vacancyId: 2,
    vacancyTitle: 'Full Stack React / Node Lead Developer',
    code: 'WALK-IN-2026-PUNE',
    registrationUrl: 'http://localhost:3000/apply/WALK-IN-2026-PUNE',
    venueName: 'Pune Assessment Hub (Hinjawadi Phase 2)',
    venueAddress: 'Plot 14, Hinjawadi Rajiv Gandhi Infotech Park, Pune, Maharashtra 411057',
    driveDate: '2026-03-15',
    driveStartTime: '09:00 AM',
    driveEndTime: '05:00 PM',
    capacity: 250,
    registrationDeadline: '2026-03-14T23:59:59Z',
    status: 'Active',
  },
  'WALK-IN-2026-MUMBAI': {
    id: 2,
    vacancyId: 1,
    vacancyTitle: 'Senior .NET Core Architect',
    code: 'WALK-IN-2026-MUMBAI',
    registrationUrl: 'http://localhost:3000/apply/WALK-IN-2026-MUMBAI',
    venueName: 'Mumbai HQ Assessment Center',
    venueAddress: 'Tower 2, Nariman Point, Marine Drive, Mumbai 400021',
    driveDate: '2026-03-20',
    driveStartTime: '09:30 AM',
    driveEndTime: '06:00 PM',
    capacity: 150,
    registrationDeadline: '2026-03-19T23:59:59Z',
    status: 'Active',
  },
};

export const MOCK_QR_ANALYTICS: Record<number, QRCodeAnalyticsData> = {
  1: {
    qrCodeId: 1,
    totalScans: 342,
    successfulRegistrations: 128,
    conversionRate: 37.4,
  },
  2: {
    qrCodeId: 2,
    totalScans: 198,
    successfulRegistrations: 64,
    conversionRate: 32.3,
  },
};

export function getMockQRScanResult(code: string): QRScanResultData {
  const qr = MOCK_QR_CODES[code] || Object.values(MOCK_QR_CODES)[0];
  return {
    qrCodeId: qr?.id || 1,
    vacancyId: qr?.vacancyId || 1,
    vacancyTitle: qr?.vacancyTitle || 'Senior Software Engineer (Walk-in Drive)',
    venueName: qr?.venueName || 'Pune Assessment Hub',
    isOpenForRegistration: true,
    message: null,
  };
}

export function checkMockEligibility(code: string, email?: string, phone?: string): QRRegistrationEligibilityData {
  // Check if candidate already applied in last 90 days
  return {
    canApply: true,
    eligibleFrom: null,
    lastAppliedAt: null,
  };
}
