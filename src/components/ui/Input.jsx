import React from 'react';
import { cn } from './Button'; // Reusing cn utility

const Input = React.forwardRef(({ className, label, error, type = 'text', id, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={cn(
          "flex h-12 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1 fade-in-0">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
