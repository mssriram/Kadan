/**
 * Profile Modal
 * 
 * Modal for viewing and editing the current user's profile.
 * 
 * API:
 * - GET /api/users/me
 * - PUT /api/users/me
 */

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Input, Button } from '@/components';
import { api, ApiException } from '@/services/api';
import type { User } from '@/types';
import './ProfileModal.css';

// ========================================
// TYPES
// ========================================

interface UpdateProfileRequest {
  email?: string;
  displayName?: string;
  defaultCurrency?: string;
}

export interface ProfileModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when profile is updated */
  onProfileUpdated?: (user: User) => void;
}

// ========================================
// COMPONENT
// ========================================

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');

  const resetForm = () => {
    setOriginalUser(null);
    setEmail('');
    setDisplayName('');
    setDefaultCurrency('INR');
    setError(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        const user = await api.get<User>('/users/me');
        setOriginalUser(user);
        setEmail(user.email);
        setDisplayName(user.displayName);
        setDefaultCurrency(user.defaultCurrency);
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (err instanceof ApiException) {
          setError(err.message);
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const buildUpdateRequest = (): UpdateProfileRequest => {
    if (!originalUser) return {};

    const request: UpdateProfileRequest = {};
    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim();

    if (trimmedEmail && trimmedEmail !== originalUser.email) {
      request.email = trimmedEmail;
    }

    if (trimmedDisplayName && trimmedDisplayName !== originalUser.displayName) {
      request.displayName = trimmedDisplayName;
    }

    if (defaultCurrency && defaultCurrency !== originalUser.defaultCurrency) {
      request.defaultCurrency = defaultCurrency;
    }

    return request;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!originalUser) {
      setError('Profile data is not ready yet.');
      return;
    }

    const request = buildUpdateRequest();

    if (Object.keys(request).length === 0) {
      setError('No changes to save.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await api.patch<User>('/users/me', request);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
      onProfileUpdated?.(updatedUser);
      handleClose();
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Your Profile" maxWidth="520px">
      <form onSubmit={handleSubmit} className="profile-form">
        {error && (
          <div className="profile-form__error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="profile-form__loading">Loading profile...</div>
        ) : (
          <>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              placeholder="you@example.com"
              fullWidth
              required
            />

            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={fieldErrors.displayName}
              placeholder="Your name"
              fullWidth
              required
            />

            <div className="input-wrapper input-wrapper--full-width">
              <label htmlFor="defaultCurrency" className="input-label">
                Default Currency
              </label>
              <select
                id="defaultCurrency"
                className="input-field"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div className="profile-form__actions">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default ProfileModal;
