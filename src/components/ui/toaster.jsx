import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @typedef {Object} Toast
 * @property {string} id - Unique toast ID
 * @property {string} message - Toast message
 * @property {string} [type='info'] - Toast type: 'info', 'success', 'error', 'warning'
 * @property {number} [duration=3000] - Duration in milliseconds before auto-dismiss
 */

const TOAST_STACK = [];
let TOAST_ID = 0;

/**
 * Create a new toast
 * @param {Omit<Toast, 'id'>} toast
 * @returns {string} Toast ID
 */
const createToast = ({ message, type = 'info', duration = 3000 }) => {
  const id = String(TOAST_ID++);
  const toast = { id, message, type, duration };
  TOAST_STACK.push(toast);
  // Notify listeners
  window.dispatchEvent(
    new CustomEvent('toast:add', { detail: toast })
  );
  return id;
};

/**
 * Remove a toast
 * @param {string} id
 */
const removeToast = (id) => {
  const index = TOAST_STACK.findIndex(t => t.id === id);
  if (index > -1) {
    TOAST_STACK.splice(index, 1);
    window.dispatchEvent(
      new CustomEvent('toast:remove', { detail: { id } })
    );
  }
};

/**
 * @typedef {Object} ToastItemProps
 * @property {Toast} toast - Toast data
 * @property {Function} onRemove - Callback to remove toast
 */

/**
 * Individual toast item
 * @param {ToastItemProps} props
 */
const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  return (
    <div
      className={cn(
        'glass rounded-lg p-4 flex items-center gap-3 shadow-lg',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      {icons[toast.type] || icons.info}
      <span className="text-sm font-medium text-foreground flex-1">
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * Toaster container component
 */
const Toaster = () => {
  const [toasts, setToasts] = useState(/** @type {Toast[]} */ ([]));

  useEffect(() => {
    const handleAdd = (e) => {
      setToasts(prev => [...prev, e.detail]);
    };

    const handleRemove = (e) => {
      setToasts(prev => prev.filter(t => t.id !== e.detail.id));
    };

    window.addEventListener('toast:add', handleAdd);
    window.addEventListener('toast:remove', handleRemove);

    return () => {
      window.removeEventListener('toast:add', handleAdd);
      window.removeEventListener('toast:remove', handleRemove);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-auto">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={(id) => removeToast(id)}
        />
      ))}
    </div>
  );
};

export { Toaster, createToast, removeToast };
