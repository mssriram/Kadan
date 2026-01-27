/**
 * Validation Utilities
 * 
 * Common validation functions for form fields.
 * These run client-side before API requests to provide fast feedback.
 */

// ========================================
// VALIDATION RESULT TYPE
// ========================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ========================================
// EMAIL VALIDATION
// ========================================

/**
 * Validate email format and length.
 * - Must be a valid email format
 * - Must be 255 characters or less
 */
export const validateEmail = (email: string): ValidationResult => {
  // Check if empty
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  // Check max length (255 characters)
if (email.length >= 255) {
    return { isValid: false, error: 'Email must be less than 255 characters' };
}

  // Check valid email format using a reasonable regex
  // This covers most common email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

// ========================================
// PASSWORD VALIDATION
// ========================================

/**
 * Validate password requirements.
 * - Must be 8-20 characters
 * - Must contain at least 1 number
 * - Must contain at least 1 special character
 */
export const validatePassword = (password: string): ValidationResult => {
  // Check if empty
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  // Check length (8-20 characters)
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 20) {
    return { isValid: false, error: 'Password must be 20 characters or less' };
  }

  // Check for at least 1 number
  const hasNumber = /\d/.test(password);
  if (!hasNumber) {
    return { isValid: false, error: 'Password must contain at least 1 number' };
  }

  // Check for at least 1 special character
  // Common special characters: !@#$%^&*()_+-=[]{}|;':",./<>?
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?\\`~]/.test(password);
  if (!hasSpecialChar) {
    return { isValid: false, error: 'Password must contain at least 1 special character' };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation matches.
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

// ========================================
// DISPLAY NAME VALIDATION
// ========================================

/**
 * Validate display name.
 * - Must not be empty
 * - Max 100 characters
 * - Only letters, numbers, and spaces allowed
 */
export const validateDisplayName = (displayName: string): ValidationResult => {
  // Check if empty
  if (!displayName || displayName.trim() === '') {
    return { isValid: false, error: 'Display name is required' };
  }

  // Check max length (100 characters)
  if (displayName.length > 100) {
    return { isValid: false, error: 'Display name must be 100 characters or less' };
  }

  // Check for valid characters (letters, numbers, spaces only)
  // This regex allows Unicode letters to support international names
  const validNameRegex = /^[a-zA-Z0-9\s]+$/;
  if (!validNameRegex.test(displayName)) {
    return { isValid: false, error: 'Display name can only contain letters, numbers, and spaces' };
  }

  return { isValid: true };
};

// ========================================
// FORM VALIDATION HELPER
// ========================================

/**
 * Field errors object for form state.
 */
export interface FieldErrors {
  email?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

/**
 * Validate all registration form fields.
 * Returns an object with field-specific errors.
 */
export const validateRegistrationForm = (
  email: string,
  displayName: string,
  password: string,
  confirmPassword: string
): { isValid: boolean; errors: FieldErrors } => {
  const errors: FieldErrors = {};

  // Validate email
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  // Validate display name
  const displayNameResult = validateDisplayName(displayName);
  if (!displayNameResult.isValid) {
    errors.displayName = displayNameResult.error;
  }

  // Validate password
  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  // Validate password confirmation
  const confirmResult = validatePasswordMatch(password, confirmPassword);
  if (!confirmResult.isValid) {
    errors.confirmPassword = confirmResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ========================================
// LOGIN VALIDATION
// ========================================

/**
 * Validate password for login (simpler than registration).
 * - Must be 1-20 characters (just check it's not empty and not too long)
 */
export const validateLoginPassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length > 20) {
    return { isValid: false, error: 'Password must be 20 characters or less' };
  }

  return { isValid: true };
};

/**
 * Validate login form fields.
 * Returns an object with field-specific errors.
 */
export const validateLoginForm = (
  email: string,
  password: string
): { isValid: boolean; errors: FieldErrors } => {
  const errors: FieldErrors = {};

  // Validate email
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  // Validate password (simple check for login)
  const passwordResult = validateLoginPassword(password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
