/**
 * Input Component
 * 
 * Text input field following the retro-maximalist style guide.
 * Features paper background, ink border, and subtle focus ring.
 * 
 * Supports:
 * - Label and helper text
 * - Error state with message
 * - Different input types (text, email, password, etc.)
 */

import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message (also sets error styling) */
  error?: string;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component with retro-maximalist styling.
 * Uses paper background and subtle warm focus ring (no blue!).
 */
export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  // Generate a unique ID if not provided (for label association)
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const wrapperClassNames = [
    'input-wrapper',
    fullWidth ? 'input-wrapper--full-width' : '',
    error ? 'input-wrapper--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassNames}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      {/* Input field */}
      <input
        id={inputId}
        className="input-field"
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {/* Error message */}
      {error && (
        <span id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}

      {/* Helper text (only shown if no error) */}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="input-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
