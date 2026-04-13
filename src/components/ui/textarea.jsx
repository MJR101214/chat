import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @typedef {Object} TextareaProps
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [value] - Textarea value
 * @property {Function} [onChange] - Change handler
 * @property {boolean} [disabled=false] - Whether textarea is disabled
 * @property {string} [className] - Additional CSS classes
 * @property {number} [rows=3] - Number of visible text rows
 */

/**
 * Glass-styled Textarea component
 * @param {TextareaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>} props
 */
const Textarea = React.forwardRef(({
  placeholder,
  disabled,
  className = '',
  rows = 3,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={cn(
        'glass rounded-xl px-4 py-2 text-sm',
        'text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'resize-none transition-all duration-200',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
