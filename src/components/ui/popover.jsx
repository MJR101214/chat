import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * @typedef {Object} PopoverContextValue
 * @property {boolean} open - Whether popover is open
 * @property {Function} setOpen - Function to set open state
 * @property {React.RefObject} triggerRef - Reference to trigger element
 */

const PopoverContext = createContext(/** @type {PopoverContextValue | null} */ (null));

/**
 * @typedef {Object} PopoverProps
 * @property {boolean} [open] - Controlled open state
 * @property {Function} [onOpenChange] - Callback for open state changes
 * @property {React.ReactNode} children - Popover content
 */

/**
 * Popover compound component
 * @param {PopoverProps} props
 */
const Popover = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen) => {
    if (!isControlled) setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  );
};

/**
 * @returns {PopoverContextValue}
 */
const usePopoverContext = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover provider');
  }
  return context;
};

/**
 * @typedef {Object} PopoverTriggerProps
 * @property {React.ReactNode} children - Trigger content
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Popover trigger component
 * @param {PopoverTriggerProps & {asChild?: boolean}} props
 */
const PopoverTrigger = ({ children, className = '', asChild, ...props }) => {
  const { setOpen, triggerRef } = usePopoverContext();
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: () => { setOpen(true); children.props.onClick?.(); }
    });
  }
  
  return (
    <button
      ref={triggerRef}
      className={className}
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * @typedef {Object} PopoverContentProps
 * @property {React.ReactNode} children - Content
 * @property {string} [className] - Additional CSS classes
 * @property {string} [align='center'] - Horizontal alignment: 'start', 'center', 'end'
 */

/**
 * Popover content component
 * @param {PopoverContentProps & {side?: 'top' | 'bottom' | 'left' | 'right'}} props
 */
const PopoverContent = ({ children, className = '', align = 'center', side = 'bottom' }) => {
  const { open, setOpen, triggerRef } = usePopoverContext();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + 8;
      
      if (align === 'center') {
        left = rect.left + rect.width / 2;
      } else if (align === 'end') {
        left = rect.right;
      }

      if (side === 'top') {
        top = rect.top - 8;
      } else if (side === 'left') {
        left = rect.left - 8;
        top = rect.top + rect.height / 2;
      } else if (side === 'right') {
        left = rect.right + 8;
        top = rect.top + rect.height / 2;
      }

      setPosition({ top, left });
    }
  }, [open, align, side]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          'glass rounded-xl shadow-xl p-4 z-50',
          'animate-in fade-in slide-in-from-top-2 duration-200',
          className
        )}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: align === 'center' ? 'translateX(-50%)' : align === 'end' ? 'translateX(-100%)' : 'translateX(0)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
