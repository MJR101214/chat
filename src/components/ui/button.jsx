import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Glass-styled Button component
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement> & {size?: string, variant?: string}} props
 */
const Button = React.forwardRef(({
  children,
  className = '',
  type = 'button',
  size,
  variant,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'glass rounded-xl px-4 py-2 text-sm font-medium',
        'transition-all duration-200',
        'hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
