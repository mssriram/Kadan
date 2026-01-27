import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import './DatePicker.css';

export interface DatePickerProps {
  value: string; // ISO format YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  // Sync input value with prop value
  useEffect(() => {
    if (selectedDate && isValid(selectedDate)) {
      setInputValue(format(selectedDate, 'dd/MM/yyyy'));
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Try to parse the date when user types
    const parsed = parse(val, 'dd/MM/yyyy', new Date());
    if (isValid(parsed) && val.length === 10) {
      onChange(format(parsed, 'yyyy-MM-dd'));
    }
  };

  const handleInputBlur = () => {
    // On blur, validate and format the input
    const parsed = parse(inputValue, 'dd/MM/yyyy', new Date());
    if (isValid(parsed) && inputValue.length === 10) {
      onChange(format(parsed, 'yyyy-MM-dd'));
      setInputValue(format(parsed, 'dd/MM/yyyy'));
    } else if (inputValue && inputValue.length > 0) {
      // Reset to last valid value if invalid
      if (selectedDate && isValid(selectedDate)) {
        setInputValue(format(selectedDate, 'dd/MM/yyyy'));
      } else {
        setInputValue('');
      }
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`datepicker ${className}`}>
      <div className="datepicker__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="datepicker__input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-expanded={isOpen}
        />
        <button
          type="button"
          className="datepicker__icon-btn"
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={-1}
        >
          📅
        </button>
      </div>

      {isOpen && (
        <div className="datepicker__dropdown datepicker__dropdown--above">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            showOutsideDays
            fixedWeeks
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
