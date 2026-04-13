import React, { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @typedef {Object} DialogContextValue
 * @property {boolean} open - Whether dialog is open
 * @property {Function} setOpen - Function to set open state
 */

const DialogContext = createContext(/** @type {DialogContextValue | null} */ (null));

/**
 * @typedef {Object} DialogProps
 * @property {boolean} [open] - Controlled open state
 * @property {Function} [onOpenChange] - Callback for open state changes
 * @property {React.ReactNode} children - Dialog content
 */

/**
 * Dialog compound component
 * @param {DialogProps} props
 */
const Dialog = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen) => {
    if (!isControlled) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

/**
 * @returns {DialogContextValue}
 */
const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog provider');
  }
  return context;
};

/**
 * @typedef {Object} DialogTriggerProps
 * @property {React.ReactNode} children - Trigger content
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Dialog trigger component
 * @param {DialogTriggerProps} props
 */
const DialogTrigger = ({ children, className = '', ...props }) => {
  const { setOpen } = useDialogContext();
  return (
    <button
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * @typedef {Object} DialogContentProps
 * @property {React.ReactNode} children - Content
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Dialog content component
 * @param {DialogContentProps} props
 */
const DialogContent = ({ children, className = '' }) => {
  const { open, setOpen } = useDialogContext();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          'glass rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6',
          'animate-in fade-in zoom-in duration-300',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>
        {children}
      </div>
      <div onClick={() => setOpen(false)} className="absolute inset-0 -z-10" />
    </div>
  );
};

/**
 * @typedef {Object} DialogHeaderProps
 * @property {React.ReactNode} children - Header content
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Dialog header component
 * @param {DialogHeaderProps} props
 */
const DialogHeader = ({ children, className = '' }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

/**
 * @typedef {Object} DialogTitleProps
 * @property {React.ReactNode} children - Title content
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Dialog title component
 * @param {DialogTitleProps} props
 */
const DialogTitle = ({ children, className = '' }) => (
  <h2 className={cn('text-xl font-bold text-foreground', className)}>
    {children}
  </h2>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
