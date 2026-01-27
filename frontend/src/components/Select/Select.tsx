/**
 * Custom Select Component
 * 
 * A styled dropdown select that matches the retro-maximalist theme.
 * Uses a custom dropdown instead of native select for full styling control.
 */

import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  /** Currently selected value */
  value: string;
  /** Available options */
  options: SelectOption[];
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional label */
  label?: string;
  /** Size variant */
  size?: 'default' | 'compact';
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Optional className */
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  label,
  size = 'default',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          onChange(options[nextIndex].value);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const prevIndex = Math.max(currentIndex - 1, 0);
          onChange(options[prevIndex].value);
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select ${size === 'compact' ? 'custom-select--compact' : ''} ${fullWidth ? 'custom-select--full-width' : ''} ${disabled ? 'custom-select--disabled' : ''} ${className}`}
    >
      {label && <label className="custom-select__label">{label}</label>}
      <button
        type="button"
        className={`custom-select__trigger ${isOpen ? 'custom-select__trigger--open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="custom-select__value">
          {selectedOption?.icon && (
            <span className="custom-select__icon">{selectedOption.icon}</span>
          )}
          <span className="custom-select__text">
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <span className="custom-select__arrow">▼</span>
      </button>

      {isOpen && (
        <ul className="custom-select__dropdown" role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={`custom-select__option ${option.value === value ? 'custom-select__option--selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.icon && (
                <span className="custom-select__option-icon">{option.icon}</span>
              )}
              <span className="custom-select__option-text">{option.label}</span>
              {option.value === value && (
                <span className="custom-select__check">✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
