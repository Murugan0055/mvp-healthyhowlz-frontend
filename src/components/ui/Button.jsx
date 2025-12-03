import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  isLoading = false, 
  children, 
  disabled, 
  type = 'button',
  ...props 
}, ref) => {
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-700 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-emerald-600 focus:ring-secondary',
    outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-gray-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    link: 'text-primary underline-offset-4 hover:underline p-0 h-auto'
  };

  const sizes = {
    default: 'h-12 px-4 py-2', // Big tap target
    sm: 'h-9 px-3',
    lg: 'h-14 px-8 text-lg',
    icon: 'h-12 w-12',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
