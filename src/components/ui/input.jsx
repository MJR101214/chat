import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Glass-styled Input component
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props
 */
const Input = React.forwardRef(({
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'glass rounded-xl px-4 py-2 text-sm',
        'text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
