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
    default: 'bg-[#1e1e24] text-[#d4d4d8] border border-[#27272a]',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    violet: 'bg-violet-500/10 text-violet-300 border border-violet-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    outline: 'bg-transparent text-[#a1a1aa] border border-[#3f3f46]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full whitespace-nowrap transition-colors',
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
