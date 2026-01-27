/**
 * Login Page
 * 
 * Public route for user authentication.
 * Features email/password form with retro-maximalist styling.
 * 
 * Validations (client-side, before API call):
 * - Email: valid format, max 255 characters
 * - Password: 1-20 characters (simple length check)
 * 
 * API: POST /api/public/login
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '@/components';
import { config } from '@/config/environment';
import { authService, ApiException } from '@/services';
import { validateLoginForm, type FieldErrors } from '@/utils/validation';
import './LoginPage.css';

/**
 * LoginPage component handles user authentication.
 * Includes validation and API integration.
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success message from registration redirect (if any) - stored in state so we can clear it
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    (location.state as { message?: string })?.message
  );
  
  // Form field state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage(undefined);
    }
  };

  /**
   * Handle form submission.
   * Validates fields, then calls the login API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setSuccessMessage(undefined); // Clear success message on submit

    // Run client-side validation before API request
    const validation = validateLoginForm(email, password);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // Call the login API
      await authService.login({
        email: email.trim(),
        password,
      });

      // Login successful - navigate to dashboard
      navigate('/app/groups');
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.status === 401) {
          setGeneralError('Invalid email or password. Please try again.');
        } else if (error.fieldErrors) {
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
    <div className="login-page">
      {/* Login card container */}
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">{config.appName}</h1>
          <p className="login-subtitle">Split expenses with friends</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Success message from registration */}
          {successMessage && (
            <div className="login-success" role="status">
              {successMessage}
            </div>
          )}

          {/* General error message */}
          {generalError && (
            <div className="login-error" role="alert">
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

          {/* Password input */}
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
            error={fieldErrors.password}
            fullWidth
            autoComplete="current-password"
            maxLength={20}
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Footer with register link */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="login-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
