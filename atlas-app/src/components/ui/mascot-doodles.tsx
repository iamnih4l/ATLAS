'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Expressive Mascot Doodles inspired by Child Edu Mellow, Suntera, and Claud.
 * Vector-handcrafted with vibrant pop colors, thick black outlines, and playful personalities.
 */

interface MascotProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

// 1. JoyBlob - The fluffy grinning orange/coral cloud with cartoon eyes and teeth (inspired by Suntera "Joy" & Mellow)
export function JoyBlob({ size = 48, className = '', animate = true }: MascotProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { y: [0, -3, 0], rotate: [0, 2, -2, 0] } : undefined}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Cloud Blob Body */}
      <path
        d="M20 54C14 54 8 48 8 40C8 32 14 26 22 26C24 16 34 10 44 10C55 10 64 18 66 28C72 29 76 35 76 42C76 49 71 54 64 54H20Z"
        fill="#FF6B4A"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Cartoon Eyes */}
      <ellipse cx="32" cy="34" rx="4.5" ry="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      <ellipse cx="48" cy="34" rx="4.5" ry="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      {/* Pupils looking slightly right */}
      <circle cx="34" cy="34" r="2.5" fill="#0F172A" />
      <circle cx="50" cy="34" r="2.5" fill="#0F172A" />
      {/* Grinning Mouth with 2 goofy teeth */}
      <path
        d="M32 44C32 49 37 52 40 52C43 52 48 49 48 44H32Z"
        fill="#0F172A"
      />
      <rect x="36" y="44" width="3" height="3" fill="#FFFFFF" rx="0.5" />
      <rect x="41" y="44" width="3" height="3" fill="#FFFFFF" rx="0.5" />
    </motion.svg>
  );
}

// 2. StarSpike - Spiky star character with cartoon pupils and smile (inspired by Mellow spiky mascot)
export function StarSpike({ size = 48, className = '', animate = true }: MascotProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* 8-point spiky star body */}
      <path
        d="M40 6L47 25L67 18L59 36L78 44L59 52L67 70L47 63L40 82L33 63L13 70L21 52L2 44L21 36L13 18L33 25L40 6Z"
        fill="#F43F5E"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Cartoon Eyes */}
      <ellipse cx="34" cy="40" rx="4" ry="5.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      <ellipse cx="46" cy="40" rx="4" ry="5.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      {/* Pupils looking down */}
      <circle cx="34" cy="42" r="2" fill="#0F172A" />
      <circle cx="46" cy="42" r="2" fill="#0F172A" />
      {/* Cute smile */}
      <path
        d="M36 49C38 52 42 52 44 49"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// 3. WanderBlob - Intrepid green mountain blob with headband and sweat drops (inspired by Suntera)
export function WanderBlob({ size = 48, className = '', animate = true }: MascotProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Triangle Mountain Body */}
      <path
        d="M40 12C45 12 68 55 68 62C68 69 61 72 40 72C19 72 12 69 12 62C12 55 35 12 40 12Z"
        fill="#10B981"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Retro Striped Headband */}
      <path
        d="M24 30C29 27 51 27 56 30"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M26 30C30 28 50 28 54 30"
        stroke="#F43F5E"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Wide expressive eyes */}
      <ellipse cx="32" cy="44" rx="4.5" ry="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      <ellipse cx="48" cy="44" rx="4.5" ry="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
      <circle cx="32" cy="44" r="2.5" fill="#0F172A" />
      <circle cx="48" cy="44" r="2.5" fill="#0F172A" />
      {/* Small mouth */}
      <ellipse cx="40" cy="54" rx="2.5" ry="2" fill="#0F172A" />
      {/* Sweat drops */}
      <path
        d="M60 36C61 38 62 40 60 41C58.5 41 58 39.5 60 36Z"
        fill="#38BDF8"
        stroke="#0F172A"
        strokeWidth="1.5"
      />
      <path
        d="M63 44C64 46 65 48 63 49C61.5 49 61 47.5 63 44Z"
        fill="#38BDF8"
        stroke="#0F172A"
        strokeWidth="1.5"
      />
    </motion.svg>
  );
}

// 4. ChillCloud - Relaxed daydreaming lavender cloud mascot (inspired by Claud)
export function ChillCloud({ size = 48, className = '', animate = true }: MascotProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { scale: [1, 1.04, 1] } : undefined}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Lavender Cloud Body */}
      <path
        d="M24 58C16 58 10 52 10 44C10 36 16 30 24 30C26 20 37 14 47 14C57 14 66 22 68 32C74 33 78 39 78 46C78 53 73 58 66 58H24Z"
        fill="#C084FC"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Cool Sunglasses */}
      <path
        d="M26 36H38L37 43H27L26 36Z"
        fill="#0F172A"
      />
      <path
        d="M42 36H54L53 43H43L42 36Z"
        fill="#0F172A"
      />
      <path d="M38 38H42" stroke="#0F172A" strokeWidth="2.5" />
      {/* Smile */}
      <path
        d="M36 49C39 52 43 52 46 49"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// 5. SunDoodle - Cheerful retro sun with big cartoon eyes
export function SunDoodle({ size = 44, className = '', animate = true }: MascotProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { rotate: 360 } : undefined}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="30" cy="30" r="14" fill="#FBBF24" stroke="#0F172A" strokeWidth="2.5" />
      {/* Rays */}
      <line x1="30" y1="4" x2="30" y2="10" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="50" x2="30" y2="56" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="30" x2="10" y2="30" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="30" x2="56" y2="30" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="12" x2="16" y2="16" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="44" x2="48" y2="48" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="48" x2="16" y2="44" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="16" x2="48" y2="12" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}

// 6. Interactive Vibe / Mood Selector inspired by Suntera
export interface MoodOption {
  id: string;
  label: string;
  color: string;
  textColor: string;
  mascot: React.ReactNode;
}

export const TRAVEL_MOODS: MoodOption[] = [
  {
    id: 'joy',
    label: 'Pure Joy',
    color: 'bg-amber-300',
    textColor: 'text-amber-950',
    mascot: <JoyBlob size={24} animate={false} />,
  },
  {
    id: 'wonder',
    label: 'Wonder',
    color: 'bg-purple-300',
    textColor: 'text-purple-950',
    mascot: <ChillCloud size={24} animate={false} />,
  },
  {
    id: 'adventure',
    label: 'Wild Adventure',
    color: 'bg-emerald-300',
    textColor: 'text-emerald-950',
    mascot: <WanderBlob size={24} animate={false} />,
  },
  {
    id: 'epic',
    label: 'Epic Milestone',
    color: 'bg-rose-300',
    textColor: 'text-rose-950',
    mascot: <StarSpike size={24} animate={false} />,
  },
  {
    id: 'chill',
    label: 'Serene & Chill',
    color: 'bg-sky-300',
    textColor: 'text-sky-950',
    mascot: <SunDoodle size={22} animate={false} />,
  },
];

