/**
 * Toast Component
 * 
 * Global toast notification that displays error messages.
 * Listens to toastEvents for centralized error handling.
 * Auto-dismisses after a timeout.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { toastEvents } from './toastEvents';
import './Toast.css';

const TOAST_DURATION = 5000; // 5 seconds

export const Toast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    const unsubscribe = toastEvents.subscribe((msg: string) => {
      setMessage(msg);
      setVisible(true);
    });

    return unsubscribe;
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [visible, message]);

  if (!visible) return null;

  return (
    <div className="toast toast--error" role="alert">
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={hideToast}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
