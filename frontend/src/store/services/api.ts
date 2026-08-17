// ── Central API Barrel & Re-export File ──
// Re-exports baseApi, all types, and all V1 & V2 endpoint hooks for seamless backward compatibility.

export * from './types';
export * from './baseApi';

// Common / Platform Core APIs (Shared across V1 & V2)
export * from './common/authApi';
export * from './common/usersApi';

// V1 Domain APIs
export * from './v1/masterDataApi';
export * from './v1/vacanciesApi';
export * from './v1/questionPapersApi';
export * from './v1/candidatesApi';
export * from './v1/examsApi';
export * from './v1/interviewsApi';
export * from './v1/offersApi';
export * from './v1/reportsApi';
export * from './v1/qrCodesApi';

// V2 Autonomous Recruitment Engine APIs
export * from './v2/hiringProfilesApi';
export * from './v2/questionBankApi';
export * from './v2/instantDriveApi';
export * from './v2/examsV2Api';
