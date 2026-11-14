'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PixelStickerProps {
  size?: number;
  className?: string;
}

/**
 * 16-Bit Pixel Art Instant Camera (Polaroid)
 */
export function PixelCamera({ size = 32, className }: PixelStickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className={cn('inline-block', className)}
    >
      {/* Body */}
      <rect x="2" y="4" width="12" height="9" fill="#f8fafc" />
      <rect x="2" y="4" width="12" height="1" fill="#e2e8f0" />
      <rect x="2" y="12" width="12" height="1" fill="#cbd5e1" />
      {/* Rainbow Stripe */}
      <rect x="2" y="7" width="12" height="1" fill="#f97316" />
      <rect x="2" y="8" width="12" height="1" fill="#facc15" />
      {/* Lens */}
      <rect x="6" y="5" width="4" height="4" fill="#0f172a" />
      <rect x="7" y="6" width="2" height="2" fill="#38bdf8" />
      <rect x="7" y="6" width="1" height="1" fill="#ffffff" />
      {/* Shutter Button & Flash */}
      <rect x="3" y="3" width="2" height="1" fill="#ef4444" />
      <rect x="11" y="3" width="2" height="1" fill="#fbbf24" />
    </svg>
  );
}

/**
 * 16-Bit Pixel Art Hot Air Balloon
 */
export function PixelBalloon({ size = 32, className }: PixelStickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className={cn('inline-block animate-pulse', className)}
    >
      {/* Balloon Top */}
      <rect x="5" y="1" width="6" height="2" fill="#ef4444" />
      <rect x="3" y="3" width="10" height="2" fill="#f59e0b" />
      <rect x="2" y="5" width="12" height="3" fill="#10b981" />
      <rect x="3" y="8" width="10" height="2" fill="#0ea5e9" />
      <rect x="5" y="10" width="6" height="2" fill="#8b5cf6" />
      {/* Ropes */}
      <rect x="6" y="12" width="1" height="2" fill="#78350f" />
      <rect x="9" y="12" width="1" height="2" fill="#78350f" />
      {/* Basket */}
      <rect x="6" y="14" width="4" height="2" fill="#b45309" />
    </svg>
  );
}

/**
 * 16-Bit Pixel Art Paper Airplane
 */
export function PixelPlane({ size = 32, className }: PixelStickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className={cn('inline-block', className)}
    >
      <rect x="14" y="2" width="2" height="2" fill="#0284c7" />
      <rect x="10" y="4" width="4" height="2" fill="#0284c7" />
      <rect x="6" y="6" width="5" height="2" fill="#38bdf8" />
      <rect x="3" y="8" width="4" height="2" fill="#38bdf8" />
      <rect x="1" y="10" width="3" height="2" fill="#7dd3fc" />
      {/* Shadow Wing */}
      <rect x="4" y="9" width="3" height="2" fill="#0369a1" />
      <rect x="7" y="7" width="3" height="2" fill="#0369a1" />
    </svg>
  );
}

/**
 * 16-Bit Pixel Campfire
 */
export function PixelCampfire({ size = 32, className }: PixelStickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className={cn('inline-block', className)}
    >
      {/* Logs */}
      <rect x="2" y="13" width="12" height="2" fill="#78350f" />
      <rect x="3" y="12" width="10" height="1" fill="#9a3412" />
      {/* Red Flame */}
      <rect x="5" y="6" width="6" height="6" fill="#ef4444" />
      <rect x="7" y="3" width="2" height="3" fill="#ef4444" />
      {/* Orange Flame */}
      <rect x="6" y="7" width="4" height="4" fill="#f97316" />
      {/* Yellow Core */}
      <rect x="7" y="8" width="2" height="2" fill="#facc15" />
    </svg>
  );
}

/**
 * 16-Bit Pixel Compass
 */
export function PixelCompass({ size = 32, className }: PixelStickerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className={cn('inline-block', className)}
    >
      {/* Rim */}
      <rect x="5" y="1" width="6" height="1" fill="#d97706" />
      <rect x="3" y="2" width="10" height="1" fill="#f59e0b" />
      <rect x="2" y="3" width="12" height="1" fill="#f59e0b" />
      <rect x="1" y="5" width="14" height="6" fill="#fef3c7" />
      <rect x="2" y="12" width="12" height="1" fill="#f59e0b" />
      <rect x="5" y="14" width="6" height="1" fill="#d97706" />
      {/* Dial Dial Needle: North (Red) & South (Blue) */}
      <rect x="7" y="4" width="2" height="4" fill="#ef4444" />
      <rect x="7" y="8" width="2" height="4" fill="#3b82f6" />
      <rect x="7" y="7" width="2" height="2" fill="#0f172a" />
    </svg>
  );
}

