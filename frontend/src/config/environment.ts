/**
 * Environment configuration for Kadan Frontend.
 * All environment variables are extracted here for centralized access.
 * Values can be provided at runtime via .env files (Vite convention: VITE_ prefix).
 */

export const config = {
  /**
   * Base URL for the backend API.
   * Should NOT include a trailing slash.
   * Example: "http://localhost:8080/api"
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',

  /**
   * Application display name.
   */
  appName: import.meta.env.VITE_APP_NAME || 'Kadan',
} as const;
