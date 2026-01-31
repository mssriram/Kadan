/**
 * Toast Event Emitter
 * 
 * Simple event system for showing toast notifications from anywhere in the app.
 * Used by the API layer to trigger error toasts without needing React context.
 */

type ToastListener = (message: string) => void;

const listeners: Set<ToastListener> = new Set();

/**
 * Subscribe to toast events.
 * Returns an unsubscribe function.
 */
const subscribe = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Emit an error toast.
 * Called from api.ts when any API request fails.
 */
const showError = (message = 'Something went wrong. Please try again.'): void => {
  listeners.forEach((listener) => listener(message));
};

export const toastEvents = {
  subscribe,
  showError,
};
