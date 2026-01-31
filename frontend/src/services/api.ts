/**
 * API Service
 * 
 * Centralized HTTP client for making API requests.
 * Handles authentication headers, error normalization, and base URL configuration.
 */

import { config } from '@/config/environment';
import { toastEvents } from '@/components/Toast';

// ========================================
// ERROR TYPES
// ========================================

/**
 * Standardized API error structure.
 * All API errors are normalized to this shape for consistent handling.
 */
export interface ApiError {
    status: number;
    message: string;
    fieldErrors?: Record<string, string>;
}

/**
 * Custom error class for API errors.
 * Allows `instanceof` checks and carries structured error data.
 */
export class ApiException extends Error {
    status: number;
    fieldErrors?: Record<string, string>;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiException';
        this.status = error.status;
        this.fieldErrors = error.fieldErrors;
    }
}

// ========================================
// HTTP CLIENT
// ========================================

/**
 * Get the stored authentication token.
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

/**
 * Build request headers with optional authentication.
 */
const buildHeaders = (includeAuth = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

/**
 * Extended API error structure for internal parsing.
 */
interface ParsedApiError extends ApiError {
    type?: string;
}

/**
 * Parse error response from the API.
 * 
 * Known backend error formats:
 * - Validation: { "type": "VALIDATION_ERROR", "invalidFields": { "error": "..." } }
 * - Auth: { "type": "AUTHENTICATION_ERROR", "message": "..." }
 * - Some errors (e.g., 404) may have no body
 */
const parseErrorResponse = async (response: Response): Promise<ParsedApiError> => {
    let message = 'An unexpected error occurred';
    let fieldErrors: Record<string, string> | undefined;
    let type: string | undefined;

    try {
        const data = await response.json();
        type = data.type;
        
        // Handle validation error format
        if (data.type === 'VALIDATION_ERROR' && data.invalidFields) {
            message = data.invalidFields.error || message;
            // Collect field-specific errors (excluding the generic 'error' key)
            for (const [key, value] of Object.entries(data.invalidFields)) {
                if (key !== 'error' && typeof value === 'string') {
                    fieldErrors = fieldErrors || {};
                    fieldErrors[key] = value;
                }
            }
        } else if (data.message) {
            message = data.message;
        }
    } catch {
        // No JSON body (e.g., 404)
    }

    return { status: response.status, message, fieldErrors, type };
};

/**
 * Handle authentication error by logging out and redirecting to login.
 * Only triggers if user was previously authenticated (has stored token).
 */
const handleAuthenticationError = (): void => {
    // Only logout if user was logged in (has a stored token)
    const hasToken = localStorage.getItem('auth_token');
    if (!hasToken) {
        return; // Not logged in, no need to logout/redirect (e.g., login page invalid credentials)
    }
    
    // Clear stored credentials
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Redirect to login page
    window.location.href = '/login';
};

/**
 * Handle API error - shows toast and throws exception.
 * For authentication errors (401 with AUTHENTICATION_ERROR type), logs out and redirects.
 */
const handleApiError = async (response: Response): Promise<never> => {
    const error = await parseErrorResponse(response);
    
    // Handle 401 with AUTHENTICATION_ERROR - logout and redirect
    if (response.status === 401 && error.type === 'AUTHENTICATION_ERROR') {
        handleAuthenticationError();
    }
    
    toastEvents.showError();
    throw new ApiException(error);
};

/**
 * Make a GET request to the API.
 */
export const get = async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return response.json();
};

/**
 * Make a POST request to the API.
 * @param endpoint - API endpoint (e.g., '/users')
 * @param body - Request body object
 * @param options - Additional options
 */
export const post = async <T>(
    endpoint: string,
    body: unknown,
    options: { includeAuth?: boolean } = {}
): Promise<T> => {
    const { includeAuth = true } = options;

    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: buildHeaders(includeAuth),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return response.json();
};

/**
 * Make a PUT request to the API.
 */
export const put = async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return response.json();
};

/**
 * Make a PATCH request to the API.
 */
export const patch = async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return response.json();
};

/**
 * Make a DELETE request to the API.
 */
export const del = async (endpoint: string): Promise<void> => {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: buildHeaders(),
    });

    if (!response.ok) {
        return handleApiError(response);
    }
};

export const api = {
    get,
    post,
    put,
    patch,
    delete: del,
};

export default api;
