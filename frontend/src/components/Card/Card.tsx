/**
 * Card Component
 * 
 * Container component with retro-maximalist styling.
 * Features thick border, chunky shadow, and optional accent header.
 */

import React from 'react';
import './Card.css';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Optional title for the card header */
  title?: string;
  /** Accent variant for the header */
  accent?: 'default' | 'yellow' | 'red';
  /** Additional CSS classes */
  className?: string;
  /** Click handler (makes card interactive) */
  onClick?: () => void;
}

/**
 * Card component with retro-maximalist styling.
 * Uses thick borders and chunky shadows as per style guide.
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  accent = 'default',
  className = '',
  onClick,
}) => {
  const classNames = [
    'card',
    onClick ? 'card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const headerClassNames = [
    'card__header',
    `card__header--${accent}`,
  ].join(' ');

  return (
    <div
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Optional header with title */}
      {title && (
        <div className={headerClassNames}>
          <h3 className="card__title">{title}</h3>
        </div>
      )}
      
      {/* Card content */}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};

export default Card;
