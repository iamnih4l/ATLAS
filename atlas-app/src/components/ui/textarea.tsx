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
          <label className="block text-xs font-black text-[#171313] uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-white border-2 border-[#171313] rounded-2xl px-3.5 py-2.5 text-sm text-[#171313] placeholder-[#171313]/40 font-black shadow-pop-sm focus:shadow-pop focus:outline-none transition-all resize-y',
            error && 'border-[#F04432] focus:border-[#F04432]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
