'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtlasStore } from '@/lib/store';
import { Sparkles, MessageCircle, X, Volume2, Heart } from 'lucide-react';

const TRAVEL_QUOTES = [
  '“Not all those who wander are lost!” 🧭',
  '“Collect moments, not things!” 📸',
  '“The world is a book, and those who do not travel read only one page.” 📖',
  '“Life is short and the world is wide!” 🌍',
  '“Take only memories, leave only footprints!” 👣',
  '“Adventure is worthwhile in itself.” ✈️',
  '“Pack light, laugh often, explore endlessly!” 🎒',
];

export function PixelCompanion() {
  const { selectedLocation, experiences, wishlistItems } = useAtlasStore();
  const [bubbleText, setBubbleText] = useState<string>(
    'Hey explorer! I’m Pip, your travel buddy! Click me for travel tips! 🎒'
  );
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  // Update Pip's commentary whenever the user selects a landmark
  useEffect(() => {
    if (selectedLocation) {
      const name = selectedLocation.name.toLowerCase();
      let comment = `We just landed in ${selectedLocation.name}! What an incredible spot! 📍`;

      if (name.includes('dubai') || name.includes('palm')) {
        comment = 'Whoa, Dubai! Are we jumping out of an airplane today?! 🪂☀️';
      } else if (name.includes('kyoto') || name.includes('fushimi')) {
        comment = 'Konnichiwa! ⛩️ Kyoto’s thousand torii gates are pure magic!';
      } else if (name.includes('niagara') || name.includes('falls')) {
        comment = 'Feel that mist! 🌊 Niagara’s roar is unbelievable!';
      } else if (name.includes('paris') || name.includes('eiffel')) {
        comment = 'Bonjour Paris! 🗼 Time for fresh croissants and cafe journaling!';
      } else if (name.includes('machu picchu') || name.includes('andes')) {
        comment = 'High up in the Andes clouds! 🏔️ Ancient Incan wonders!';
      }

      setBubbleText(comment);
      setIsBubbleVisible(true);
      setIsMinimized(false);
    }
  }, [selectedLocation]);

  const handlePipClick = () => {
    setFlipCount((prev) => prev + 1);
    const randomQuote =
      TRAVEL_QUOTES[Math.floor(Math.random() * TRAVEL_QUOTES.length)];
    setBubbleText(randomQuote);
    setIsBubbleVisible(true);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          setIsBubbleVisible(true);
        }}
        className="fixed bottom-5 right-6 z-40 p-2.5 rounded-full bg-white/95 border-2 border-slate-900 shadow-pop-sm hover:scale-110 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group"
        title="Wake up Pip the Explorer"
      >
        <div className="relative">
          {/* Mini Pixel Pip Avatar */}
          <PixelPipAvatar size={32} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
      </button>
    );
  }

  return (
    <aside
      aria-label="Pixel Travel Buddy"
      className="fixed bottom-5 right-6 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {isBubbleVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-2.5 relative max-w-[250px] bg-[#FFF4D9] border-2 border-[#171313] rounded-3xl p-4 shadow-pop text-left"
          >
            <button
              onClick={() => setIsBubbleVisible(false)}
              className="absolute top-2.5 right-2.5 text-[#171313]/50 hover:text-[#171313] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#6425F5] mb-1">
              <span>✦ Pip the Scout</span>
            </div>
            <p className="text-xs font-black text-[#171313] leading-snug">
              {bubbleText}
            </p>
            {/* Bubble Tail pointing down to Pip */}
            <div className="absolute -bottom-2 right-6 w-3.5 h-3.5 bg-[#FFF4D9] border-r-2 border-b-2 border-[#171313] transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pip Character & Action Dock */}
      <div className="flex items-center gap-2">
        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-full bg-[#FFF4D9] hover:bg-[#FFD45A] text-[#171313] border-2 border-[#171313] shadow-pop-sm transition-colors cursor-pointer"
          title="Minimize Pip"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Animated Pixel Pip Explorer */}
        <motion.div
          key={flipCount}
          animate={{
            rotate: [0, -10, 360, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onClick={handlePipClick}
          className="relative cursor-pointer group"
          title="Click Pip for fun travel wisdom!"
        >
          <div className="p-2.5 rounded-2xl bg-[#FFD45A] border-2 border-[#171313] shadow-pop group-hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all">
            <PixelPipAvatar size={48} />
          </div>

          {/* Floating tiny paper airplane badge */}
          <div className="absolute -top-2 -left-2 text-sm animate-bounce">
            ✈️
          </div>
        </motion.div>
      </div>
    </aside>
  );
}

/**
 * 16-Bit Handcrafted SVG Pixel Art Avatar for "Pip the Explorer"
 */
function PixelPipAvatar({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className="inline-block"
    >
      {/* Explorer Safari Hat (Khaki / Gold) */}
      <rect x="3" y="1" width="10" height="2" fill="#d97706" />
      <rect x="5" y="0" width="6" height="2" fill="#f59e0b" />
      <rect x="2" y="3" width="12" height="1" fill="#b45309" />
      <rect x="4" y="2" width="8" height="1" fill="#fbbf24" />

      {/* Face (Warm Peach) */}
      <rect x="4" y="4" width="8" height="5" fill="#fed7aa" />

      {/* Goggles / Aviator Glasses (Sky Blue + Dark Frame) */}
      <rect x="4" y="4" width="3" height="2" fill="#0284c7" />
      <rect x="9" y="4" width="3" height="2" fill="#0284c7" />
      <rect x="5" y="4" width="1" height="1" fill="#bae6fd" />
      <rect x="10" y="4" width="1" height="1" fill="#bae6fd" />
      <rect x="7" y="5" width="2" height="1" fill="#0369a1" />

      {/* Rosy Cheeks */}
      <rect x="4" y="7" width="1" height="1" fill="#f87171" />
      <rect x="11" y="7" width="1" height="1" fill="#f87171" />

      {/* Happy Smile */}
      <rect x="7" y="7" width="2" height="1" fill="#9a3412" />

      {/* Scarf / Bandana (Vibrant Coral Red) */}
      <rect x="5" y="9" width="6" height="1" fill="#ef4444" />
      <rect x="6" y="10" width="2" height="1" fill="#dc2626" />

      {/* Explorer Jacket (Teal Green) */}
      <rect x="4" y="10" width="8" height="4" fill="#0d9488" />
      <rect x="6" y="11" width="4" height="2" fill="#14b8a6" />

      {/* Backpack Straps */}
      <rect x="4" y="10" width="1" height="3" fill="#78350f" />
      <rect x="11" y="10" width="1" height="3" fill="#78350f" />

      {/* Boots / Legs */}
      <rect x="5" y="14" width="2" height="2" fill="#451a03" />
      <rect x="9" y="14" width="2" height="2" fill="#451a03" />

      {/* Waving Hand (Right) */}
      <rect x="12" y="9" width="2" height="2" fill="#fed7aa" />
    </svg>
  );
}

