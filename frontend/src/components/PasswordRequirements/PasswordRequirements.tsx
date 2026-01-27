/**
 * PasswordRequirements Component
 * 
 * Displays password requirements as a checklist with real-time validation.
 * Each requirement shows a tick (✓) when met and updates color accordingly.
 */

import React from 'react';
import './PasswordRequirements.css';

export interface PasswordRequirement {
  id: string;
  label: string;
  isMet: boolean;
}

export interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

/**
 * Check individual password requirements.
 */
export const getPasswordRequirements = (password: string): PasswordRequirement[] => {
  return [
    {
      id: 'length',
      label: '8-20 characters',
      isMet: password.length >= 8 && password.length <= 20,
    },
    {
      id: 'number',
      label: 'At least 1 number',
      isMet: /\d/.test(password),
    },
    {
      id: 'special',
      label: 'At least 1 special character (!@#$%^&* etc.)',
      isMet: /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?\\`~]/.test(password),
    },
  ];
};

/**
 * PasswordRequirements displays a real-time checklist of password rules.
 * Shows visual feedback as each requirement is satisfied.
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className = '',
}) => {
  const requirements = getPasswordRequirements(password);

  return (
    <div className={`password-requirements ${className}`}>
      <span className="password-requirements__title">Password must have:</span>
      <ul className="password-requirements__list">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={`password-requirements__item ${req.isMet ? 'password-requirements__item--met' : ''}`}
          >
            <span className="password-requirements__icon">
              {req.isMet ? '✓' : '○'}
            </span>
            <span className="password-requirements__label">{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
