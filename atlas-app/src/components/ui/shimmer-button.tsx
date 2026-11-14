import React, { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.08em',
      shimmerDuration = '2.5s',
      borderRadius = '16px',
      background = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f43f5e 100%)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/20 px-5 py-2.5 text-white [background:var(--bg)] [border-radius:var(--radius)] shadow-md shadow-orange-500/25',
          'transform-gpu transition-all duration-200 ease-in-out active:scale-95 hover:shadow-lg hover:shadow-orange-500/35',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            '-z-30 blur-[2px]',
            'absolute inset-0 overflow-visible [container-type:size]'
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        
        {children}

        {/* Highlight inner glow */}
        <div
          className={cn(
            'inset-0 absolute size-full',
            'rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-4px_8px_rgba(255,255,255,0.25)]',
            'transform-gpu transition-all duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-6px_12px_rgba(255,255,255,0.35)]',
            'group-active:shadow-[inset_0_-8px_14px_rgba(255,255,255,0.45)]'
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            'absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]'
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

