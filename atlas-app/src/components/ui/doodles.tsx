'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Handcrafted SVG Travel Doodles & Scrapbook Accents

/**
 * Translucent Scrapbook Washi Tape
 */
export function WashiTape({
  className,
  color = 'bg-amber-200/80',
  rotate = '-2deg',
}: {
  className?: string;
  color?: string;
  rotate?: string;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate})` }}
      className={cn(
        'h-4 w-16 backdrop-blur-xs shadow-2xs pointer-events-none z-20 transition-transform',
        'border-y border-white/40',
        color,
        className
      )}
    >
      {/* Tape ragged serrated edge simulation */}
      <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.7)_3px,rgba(255,255,255,0.7)_6px)]" />
    </div>
  );
}

/**
 * Rubber Souvenir Stamp (like an authentic border passport stamp)
 */
export function PassportStamp({
  label = 'VERIFIED ADVENTURE',
  sublabel = 'ATLAS ARCHIVE',
  date,
  color = 'text-rose-600 border-rose-600',
  rotate = '-6deg',
  className,
}: {
  label?: string;
  sublabel?: string;
  date?: string;
  color?: string;
  rotate?: string;
  className?: string;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate})` }}
      className={cn(
        'inline-flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed font-mono uppercase tracking-widest text-center select-none pointer-events-none opacity-85 transition-transform hover:scale-105',
        color,
        className
      )}
    >
      <span className="text-[9px] font-black leading-none tracking-tighter">✦ {sublabel} ✦</span>
      <span className="text-[11px] font-black my-0.5 tracking-wider border-y border-current px-2 py-0.5">
        {label}
      </span>
      <span className="text-[8px] font-bold opacity-80 leading-none">
        {date || 'ENTRY RECORDED'}
      </span>
    </div>
  );
}

/**
 * Playful Hand-Drawn Arrow Doodle
 */
export function DoodleArrow({
  className,
  color = '#f97316',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-16 h-8 pointer-events-none', className)}
    >
      <path
        d="M5 25C25 10 60 15 85 20M85 20L72 12M85 20L75 28"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 0"
      />
    </svg>
  );
}

/**
 * Hand-Drawn Sparkle / Starburst Doodle
 */
export function DoodleSparkle({
  className,
  color = '#f59e0b',
  size = 24,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block animate-pulse pointer-events-none', className)}
    >
      <path
        d="M12 2V22M2 12H22M5 5L19 19M5 19L19 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Hand-Drawn Looped Flight Path
 */
export function DoodleFlightLoop({
  className,
  color = '#38bdf8',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-28 h-10 pointer-events-none', className)}
    >
      <path
        d="M5 45 C40 45, 60 10, 80 15 C100 20, 80 55, 105 45 C130 35, 145 20, 155 15"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <polygon points="152,10 160,15 153,20" fill={color} />
    </svg>
  );
}

/**
 * Handwritten Journal Accent Underline
 */
export function DoodleUnderline({
  className,
  color = '#fb923c',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-2.5 pointer-events-none', className)}
    >
      <path
        d="M2 7C35 2 75 11 118 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

