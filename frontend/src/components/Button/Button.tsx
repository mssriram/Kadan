/**
 * Button Component
 * 
 * Primary interactive element following the retro-maximalist style guide.
 * Variants: primary (red), secondary (outlined), danger (bright red)
 * 
 * Features:
 * - Chunky shadow with lift effect on hover
 * - Press effect on active state
 * - Disabled state styling
 */

import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size variant */
  size?: 'default' | 'compact';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Button content */
  children: React.ReactNode;
}

/**
 * Button component with retro-maximalist styling.
 * Uses thick borders and chunky shadows as per style guide.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full-width' : '',
    isLoading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="btn__loader">Loading...</span> : children}
    </button>
  );
};

export default Button;
