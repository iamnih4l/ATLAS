import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'emerald' | 'amber' | 'violet' | 'cyan' | 'rose' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
    violet: 'bg-violet-50 text-violet-700 border border-violet-200 font-bold',
    cyan: 'bg-sky-50 text-sky-700 border border-sky-200 font-bold',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    outline: 'bg-white text-slate-600 border border-slate-200 font-medium',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full whitespace-nowrap transition-colors shadow-2xs',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
