import { ENTERPRISE_ERROR_MESSAGES } from './notification.constants';

export interface ExtractedErrorInfo {
  title: string;
  description?: string;
  code?: string | number;
}

/**
 * Enterprise API Error Extractor
 *
 * Converts Axios, Fetch, Prisma, Validation (Zod), standard Error objects,
 * strings, and unknown errors into consistent, human-readable UI messages.
 */
export function extractErrorMessage(error: unknown, fallbackTitle = 'Action Failed'): ExtractedErrorInfo {
  if (!error) {
    return { title: fallbackTitle, description: ENTERPRISE_ERROR_MESSAGES.UNKNOWN_ERROR };
  }

  // String errors
  if (typeof error === 'string') {
    return { title: fallbackTitle, description: error };
  }

  if (typeof error === 'object') {
    const errObj = error as Record<string, unknown>;

    // Axios or custom API response error
    if (errObj.response && typeof errObj.response === 'object') {
      const response = errObj.response as Record<string, unknown>;
      const status = response.status as number | undefined;
      const data = response.data as Record<string, unknown> | undefined;

      if (status === 401) {
        return { title: 'Unauthorized', description: ENTERPRISE_ERROR_MESSAGES.UNAUTHORIZED, code: 401 };
      }
      if (status === 403) {
        return { title: 'Access Denied', description: ENTERPRISE_ERROR_MESSAGES.FORBIDDEN, code: 403 };
      }
      if (status === 404) {
        return { title: 'Not Found', description: ENTERPRISE_ERROR_MESSAGES.NOT_FOUND, code: 404 };
      }

      if (data) {
        const message = (data.message || data.error || data.detail) as string | undefined;
        if (message) {
          return { title: fallbackTitle, description: message, code: status };
        }
      }
    }

    // Network / Fetch error
    if (errObj.message === 'Network Error' || errObj.name === 'FetchError') {
      return { title: 'Network Error', description: ENTERPRISE_ERROR_MESSAGES.NETWORK_ERROR };
    }

    // Zod / Form validation error array
    if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
      const firstErr = errObj.errors[0] as Record<string, unknown>;
      const msg = (firstErr.message || firstErr.msg) as string | undefined;
      return {
        title: 'Validation Error',
        description: msg || ENTERPRISE_ERROR_MESSAGES.VALIDATION_FAILED,
      };
    }

    // Standard Error object
    if (typeof errObj.message === 'string' && errObj.message.length > 0) {
      return { title: fallbackTitle, description: errObj.message };
    }
  }

  return { title: fallbackTitle, description: ENTERPRISE_ERROR_MESSAGES.UNKNOWN_ERROR };
}
