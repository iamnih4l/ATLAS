'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ATLAS Graphic Identity System
 * Original vector illustrations designed with:
 * - Thick 2.5px Ink Black outlines (#171313)
 * - Reference palette: Electric Purple (#6425F5), Sunflower Yellow (#FFD45A),
 *   Tomato Red (#F04432), Cobalt Blue (#326BEE), Warm Cream (#FFF4D9)
 */

interface IllustrationProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

// 1. ATLAS Wordmark & Hero Badge
export function AtlasWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#171313] font-serif uppercase">
          ATLAS
        </span>
        {/* Playful mini crown / star dot */}
        <span className="text-xs absolute -top-1 -right-3 text-[#F04432] animate-bounce">
          ★
        </span>
      </div>
      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-[#6425F5] text-white border-2 border-[#171313] shadow-pop-sm uppercase">
        JOURNAL
      </span>
    </div>
  );
}

// 2. Character-Shaped Globe Mascot ("Geo")
export function CharacterGlobe({ size = 56, className = '', animate = true }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { y: [0, -3, 0], rotate: [0, 2, -2, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Globe Sphere */}
      <circle cx="40" cy="40" r="32" fill="#326BEE" stroke="#171313" strokeWidth="3" />
      {/* Continents in Sunflower Yellow */}
      <path
        d="M20 30C24 24 35 24 38 28C40 32 36 38 32 40C28 42 22 40 20 34Z"
        fill="#FFD45A"
        stroke="#171313"
        strokeWidth="2"
      />
      <path
        d="M48 24C54 22 62 26 62 32C62 38 56 42 52 40C46 38 46 30 48 24Z"
        fill="#FFD45A"
        stroke="#171313"
        strokeWidth="2"
      />
      <path
        d="M28 50C34 46 44 48 44 56C44 62 36 66 30 64C26 62 24 56 28 50Z"
        fill="#FFD45A"
        stroke="#171313"
        strokeWidth="2"
      />
      {/* Aviator Goggles Strap */}
      <path d="M8 38H72" stroke="#6425F5" strokeWidth="4" strokeLinecap="round" />
      {/* Goggles Lenses */}
      <circle cx="30" cy="38" r="8" fill="#FFF4D9" stroke="#171313" strokeWidth="2.5" />
      <circle cx="50" cy="38" r="8" fill="#FFF4D9" stroke="#171313" strokeWidth="2.5" />
      {/* Cartoon Pupils */}
      <circle cx="32" cy="38" r="3.5" fill="#171313" />
      <circle cx="52" cy="38" r="3.5" fill="#171313" />
      {/* Pupil Gleams */}
      <circle cx="34" cy="36.5" r="1.2" fill="#FFFFFF" />
      <circle cx="54" cy="36.5" r="1.2" fill="#FFFFFF" />
      {/* Cheerful Smile */}
      <path
        d="M34 52C37 56 43 56 46 52"
        stroke="#171313"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Rosy Cheeks */}
      <circle cx="24" cy="48" r="3" fill="#F04432" />
      <circle cx="56" cy="48" r="3" fill="#F04432" />
    </motion.svg>
  );
}

// 3. Playful Compass Rose
export function PlayfulCompass({ size = 48, className = '', animate = true }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={animate ? { rotate: [0, 8, -6, 0] } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx="32" cy="32" r="26" fill="#FFF4D9" stroke="#171313" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="21" fill="#FFFFFF" stroke="#171313" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* North Point (Tomato Red) */}
      <polygon points="32,10 37,32 32,29 27,32" fill="#F04432" stroke="#171313" strokeWidth="2" />
      {/* South Point (Cobalt Blue) */}
      <polygon points="32,54 37,32 32,35 27,32" fill="#326BEE" stroke="#171313" strokeWidth="2" />
      {/* East & West Points (Sunflower Yellow) */}
      <polygon points="54,32 32,37 35,32 32,27" fill="#FFD45A" stroke="#171313" strokeWidth="2" />
      <polygon points="10,32 32,37 29,32 32,27" fill="#FFD45A" stroke="#171313" strokeWidth="2" />
      {/* Center Pivot Ring */}
      <circle cx="32" cy="32" r="4.5" fill="#6425F5" stroke="#171313" strokeWidth="2" />
      <circle cx="32" cy="32" r="1.5" fill="#FFFFFF" />
      {/* Cardinal Labels */}
      <text x="32" y="8" textAnchor="middle" fontSize="6" fontWeight="900" fill="#F04432" fontFamily="sans-serif">N</text>
    </motion.svg>
  );
}

// 4. Illustrated Mountains Adventure Badge
export function AdventurePeaks({ size = 48, className = '' }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="28" fill="#FFD45A" stroke="#171313" strokeWidth="2.5" />
      {/* Background Peak (Electric Purple) */}
      <polygon points="32,16 46,44 18,44" fill="#6425F5" stroke="#171313" strokeWidth="2" />
      {/* Foreground Peak (Tomato Red) */}
      <polygon points="44,24 56,46 32,46" fill="#F04432" stroke="#171313" strokeWidth="2" />
      {/* Snowcaps */}
      <polygon points="32,16 35,23 33,21 31,23 29,22" fill="#FFFFFF" stroke="#171313" strokeWidth="1.5" />
      <polygon points="44,24 47,30 45,28 43,30 41,29" fill="#FFFFFF" stroke="#171313" strokeWidth="1.5" />
      {/* Rising Sun */}
      <circle cx="20" cy="22" r="5" fill="#FFFFFF" stroke="#171313" strokeWidth="2" />
    </svg>
  );
}

// 5. Retro Hot-Air Balloon
export function HotAirBalloon({ size = 48, className = '', animate = true }: IllustrationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      animate={animate ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Balloon Envelope */}
      <path
        d="M32 6C20 6 12 16 12 26C12 34 22 42 28 46H36C42 42 52 34 52 26C52 16 44 6 32 6Z"
        fill="#FFD45A"
        stroke="#171313"
        strokeWidth="2.5"
      />
      {/* Stripes (Purple and Red) */}
      <path d="M26 6C20 12 20 34 29 46" stroke="#6425F5" strokeWidth="4" />
      <path d="M38 6C44 12 44 34 35 46" stroke="#F04432" strokeWidth="4" />
      {/* Ropes */}
      <line x1="28" y1="46" x2="26" y2="52" stroke="#171313" strokeWidth="1.5" />
      <line x1="36" y1="46" x2="38" y2="52" stroke="#171313" strokeWidth="1.5" />
      {/* Basket */}
      <rect x="25" y="52" width="14" height="8" rx="2" fill="#326BEE" stroke="#171313" strokeWidth="2" />
    </motion.svg>
  );
}

// 6. Travel Stamp ("VERIFIED ATLAS")
export function VerifiedStamp({
  label = "VERIFIED",
  sublabel = "ATLAS",
  rotate = "-6deg",
  className = "",
}: {
  label?: string;
  sublabel?: string;
  rotate?: string;
  className?: string;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate})` }}
      className={`inline-flex flex-col items-center justify-center border-2 border-dashed border-[#F04432] bg-[#FFF4D9]/90 px-3 py-1 rounded-xl shadow-pop-sm text-center select-none ${className}`}
    >
      <div className="flex items-center gap-1 text-[9px] font-black tracking-widest text-[#F04432] uppercase">
        <span>★</span>
        <span>{label}</span>
        <span>★</span>
      </div>
      <div className="text-[12px] font-black text-[#171313] tracking-tighter font-serif">
        {sublabel}
      </div>
    </div>
  );
}

// 7. Travel Boarding Ticket Stub Badge
export function TicketBadge({ code = "ATLAS-01", className = "" }: { code?: string; className?: string }) {
  return (
    <div className={`inline-flex items-center bg-[#FFD45A] border-2 border-[#171313] rounded-xl px-2.5 py-1 shadow-pop-sm text-xs font-black text-[#171313] gap-2 ${className}`}>
      <span className="w-2 h-2 rounded-full bg-[#F04432] border border-[#171313]" />
      <span className="tracking-widest uppercase text-[10px]">{code}</span>
      <span className="text-[10px] text-[#6425F5]">✈</span>
    </div>
  );
}

