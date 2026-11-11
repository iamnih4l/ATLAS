import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#71717a] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-[#121215] border border-[#27272a] rounded-lg px-3.5 py-2 text-sm text-[#f5f5f0] placeholder-[#52525b] transition-colors focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500/60 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#71717a] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
