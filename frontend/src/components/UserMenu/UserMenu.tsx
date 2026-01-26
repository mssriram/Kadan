/**
 * UserMenu Component
 * 
 * A dropdown menu showing the user's name as a button.
 * When clicked, reveals options for Profile and Logout.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserMenu.css';

interface UserMenuProps {
  displayName: string;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ displayName, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleProfile = () => {
    setIsOpen(false);
    // TODO: Navigate to profile page when implemented
    navigate('/app/profile');
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="user-menu__name">{displayName}</span>
        <span className={`user-menu__arrow ${isOpen ? 'user-menu__arrow--open' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <button
            className="user-menu__item"
            onClick={handleProfile}
            role="menuitem"
          >
            Profile
          </button>
          <button
            className="user-menu__item user-menu__item--danger"
            onClick={handleLogout}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
