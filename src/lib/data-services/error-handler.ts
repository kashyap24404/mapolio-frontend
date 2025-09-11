import { ServiceError } from './types';

export class DataServiceError extends Error {
  public code?: string;
  public details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'DataServiceError';
    this.code = code;
    this.details = details;
  }
}

export class ErrorHandler {
  static handle(error: any, context?: string): ServiceError {
    console.error(`[DataService] Error in ${context}:`, error);

    // Supabase errors
    if (error?.code) {
      return {
        name: 'ServiceError',
        message: error.message || 'Database operation failed',
        code: error.code,
        details: error.details,
      };
    }

    // Network errors
    if (error?.message?.includes('Network')) {
      return {
        name: 'ServiceError',
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }

    // Timeout errors
    if (error?.message?.includes('timeout')) {
      return {
        name: 'ServiceError',
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR',
      };
    }

    // Default error
    return {
      name: 'ServiceError',
      message: error?.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  static isRetryable(error: ServiceError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'PGRST116', // Connection failed
      'PGRST002', // Database error
    ];

    return retryableCodes.includes(error.code || '');
  }

  static shouldInvalidateCache(error: ServiceError): boolean {
    const nonRetryableCodes = [
      'PGRST301', // Malformed request
      'PGRST401', // Unauthorized
      'PGRST403', // Forbidden
    ];

    return !nonRetryableCodes.includes(error.code || '');
  }
}