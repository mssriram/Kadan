/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 * 
 * Extends ImportMetaEnv to include custom environment variables.
 * These are defined in .env files with VITE_ prefix.
 */

interface ImportMetaEnv {
  /** Base URL for the backend API */
  readonly VITE_API_BASE_URL: string;
  /** Application display name */
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
