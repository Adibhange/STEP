// ── Central API Barrel & Re-export File ──
// Consolidated direct exports for all V2 domain services.

export * from './types';
export * from './baseApi';

// Core Authentication & Staff
export * from './authApi';
export * from './usersApi';

// Master Data & Configuration
export * from './masterDataApi';
export * from './hiringProfilesApi';
export * from './questionBankApi';
export * from './questionPapersApi';

// Recruitment Operations
export * from './vacanciesApi';
export * from './candidatesApi';
export * from './examsApi';
export * from './interviewsApi';
export * from './offersApi';
export * from './reportsApi';
export * from './qrCodesApi';
