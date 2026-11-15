'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-black text-[#171313] uppercase tracking-wider"
            >
              {label}
            </label>
            {hint && <span className="text-[11px] text-[#171313]/60 font-bold">{hint}</span>}
          </div>
        )}

        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-[#171313]/60 pointer-events-none flex items-center">
            {leftIcon || <Lock className="w-4 h-4 stroke-[2.5]" />}
          </div>

          <input
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            ref={ref}
            className={cn(
              'w-full bg-white border-2 border-[#171313] rounded-2xl pl-10 pr-12 py-2.5 text-sm text-[#171313] placeholder-[#171313]/40 font-bold shadow-pop-sm focus:shadow-pop focus:outline-none transition-all',
              error && 'border-[#F04432] focus:border-[#F04432]',
              className
            )}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            {...props}
          />

          <button
            type="button"
            onClick={toggleVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#171313]/60 hover:text-[#171313] hover:bg-[#FFD45A]/30 rounded-xl transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6425F5]/40"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Eye className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {error && <p className="text-xs text-[#F04432] font-black mt-1">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
