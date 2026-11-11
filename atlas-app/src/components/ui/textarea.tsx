import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-[#121215] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-sm text-[#f5f5f0] placeholder-[#52525b] transition-colors focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 resize-y',
            error && 'border-rose-500/60 focus:border-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
