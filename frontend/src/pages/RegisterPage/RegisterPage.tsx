/**
 * Register Page
 * 
 * Public route for new user registration.
 * Features email/displayName/password form with retro-maximalist styling.
 * 
 * Validations (client-side, before API call):
 * - Email: valid format, max 255 characters
 * - Display Name: max 100 characters, only letters/numbers/spaces
 * - Password: 8-20 characters, at least 1 number, at least 1 special character
 * 
 * API: POST /api/public/register
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, PasswordRequirements } from '@/components';
import { config } from '@/config/environment';
import { authService, ApiException } from '@/services';
import { validateRegistrationForm, type FieldErrors } from '@/utils/validation';
import './RegisterPage.css';

/**
 * RegisterPage component handles new user creation.
 * Includes comprehensive validation and API integration.
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form field state
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Clear field error when user starts typing.
   */
  const handleFieldChange = (
    field: keyof FieldErrors,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(value);
    // Clear the specific field error when user starts correcting
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    // Clear general error on any input
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * Handle form submission.
   * Validates all fields, then calls the registration API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    // Run client-side validation before API request
    const validation = validateRegistrationForm(email, displayName, password, confirmPassword);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // Call the register API
      await authService.register({
        email: email.trim(),
        displayName: displayName.trim(),
        password,
      });

      // Registration successful - navigate to login
      navigate('/login', { 
        state: { message: 'Account created successfully! Please sign in.' } 
      });
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Register card container */}
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">{config.appName}</h1>
          <p className="register-subtitle">Create your account</p>
        </div>

        {/* Register form */}
        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {/* General error message (non-field-specific) */}
          {generalError && (
            <div className="register-error" role="alert">
              {generalError}
            </div>
          )}

          {/* Email input */}
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
            error={fieldErrors.email}
            fullWidth
            autoComplete="email"
            maxLength={255}
          />

          {/* Display name input */}
          <Input
            type="text"
            label="Display Name"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => handleFieldChange('displayName', e.target.value, setDisplayName)}
            error={fieldErrors.displayName}
            helperText={!fieldErrors.displayName ? 'Letters, numbers, and spaces only' : undefined}
            fullWidth
            autoComplete="name"
            maxLength={100}
          />

          {/* Password input with requirements checklist */}
          <div className="password-field-group">
            <Input
              type="password"
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
              error={fieldErrors.password}
              fullWidth
              autoComplete="new-password"
              maxLength={20}
            />
            {/* Real-time password requirements checklist */}
            <PasswordRequirements password={password} />
          </div>

          {/* Confirm password input */}
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
            error={fieldErrors.confirmPassword}
            fullWidth
            autoComplete="new-password"
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        {/* Footer with login link */}
        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="register-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
