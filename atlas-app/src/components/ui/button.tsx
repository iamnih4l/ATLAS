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
    const baseStyles = 'inline-flex items-center justify-center font-black rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#171313] shadow-pop-sm hover:shadow-pop active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus:outline-none cursor-pointer';

    const variants = {
      primary: 'bg-[#F04432] text-white hover:bg-[#F04432]/90 font-black',
      secondary: 'bg-[#FFD45A] text-[#171313] hover:bg-[#FFD45A]/90 font-black',
      outline: 'bg-white text-[#171313] hover:bg-[#FFD45A]/30 font-black',
      ghost: 'border-transparent shadow-none hover:bg-[#FFD45A]/30 text-[#171313] font-black',
      danger: 'bg-rose-100 text-[#F04432] hover:bg-rose-200 font-black',
      glow: 'bg-[#6425F5] text-white hover:bg-[#6425F5]/90 font-black',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 gap-2',
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
