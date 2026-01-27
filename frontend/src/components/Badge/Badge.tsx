/**
 * Badge Component
 * 
 * Small label/tag component for displaying status, roles, and key info.
 * Uses the retro-maximalist color palette.
 */

import React from 'react';
import './Badge.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'red' | 'green' | 'orange' | 'neutral';
  size?: 'default' | 'small';
  className?: string;
}

/**
 * Badge component for status labels and tags.
 * Yellow for Owner/You, Green for success, Orange for attention.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'default',
  className = '',
}) => {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
};

export default Badge;
