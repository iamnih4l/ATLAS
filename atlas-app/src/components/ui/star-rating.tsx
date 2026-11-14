'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showNumber = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const activeRating = hoverValue !== null ? hoverValue : (value || 0);

  const handleMouseMove = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverValue(starIndex + (isHalf ? 0.5 : 1.0));
  };

  const handleClick = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newRating = starIndex + (isHalf ? 0.5 : 1.0);
    onChange(newRating);
  };

  return (
    <div className="inline-flex items-center gap-1.5" onMouseLeave={() => !readOnly && setHoverValue(null)}>
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const fillPercentage = Math.max(0, Math.min(100, (activeRating - starIndex) * 100));

          return (
            <button
              key={starIndex}
              type="button"
              disabled={readOnly}
              onMouseMove={(e) => handleMouseMove(starIndex, e)}
              onClick={(e) => handleClick(starIndex, e)}
              className={cn(
                'relative p-0.5 rounded transition-transform',
                !readOnly && 'hover:scale-110 cursor-pointer focus:outline-none'
              )}
            >
              {/* Background empty star */}
              <Star className={cn(starSizes[size], 'text-[#27272a] fill-transparent stroke-[#3f3f46]')} />

              {/* Foreground filled star with clip */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 p-0.5 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={cn(starSizes[size], 'text-amber-400 fill-amber-400 stroke-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]')} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showNumber && value !== null && (
        <span className="text-xs font-semibold text-amber-400/90 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

