import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/50';

    const variants = {
      primary: 'bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-sm hover:shadow-emerald-500/20',
      secondary: 'bg-[#18181b] text-[#f5f5f0] border border-[#27272a] hover:bg-[#27272a] hover:border-[#3f3f46]',
      outline: 'bg-transparent text-[#f5f5f0] border border-[#3f3f46] hover:bg-[#18181b] hover:border-emerald-500/60',
      ghost: 'bg-transparent text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#18181b]',
      danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30',
      glow: 'bg-emerald-500 text-black font-semibold hover:bg-emerald-400 glow-emerald',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'p-2 aspect-square',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
