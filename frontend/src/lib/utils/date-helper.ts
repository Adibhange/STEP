/**
 * Date formatting helpers for STEP Enterprise ATS
 */

export function formatDateToYYYYMMDD(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
