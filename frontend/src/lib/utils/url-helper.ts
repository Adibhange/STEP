/**
 * Resolves the Frontend Web Application origin dynamically.
 * 
 * - In Browser: Uses `window.location.origin` (which ALWAYS returns the Frontend Next.js app origin where the user is browsing).
 * - In SSR: Uses `process.env.NEXT_PUBLIC_APP_URL` (Frontend URL), completely separated from `NEXT_PUBLIC_API_BASE_URL` (Backend API).
 * 
 * This ensures candidate QR Codes and Apply Links (/apply/[code]) ALWAYS point to the Frontend UI,
 * while API calls remain directed to the ASP.NET Core Backend (https://stepapi.scipl.info.in/api/v2).
 */
export const getAppOrigin = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
};
