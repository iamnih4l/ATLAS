'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAtlasStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Sparkles, MapPin, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { DoodleSparkle } from '@/components/ui/doodles';

const LOADING_MESSAGES = [
  'PREPARING YOUR ATLAS...',
  'CHARTING YOUR WORLD...',
  'GATHERING YOUR MEMORIES...',
  'GETTING YOUR GLOBE READY...',
  'YOUR NEXT ADVENTURE AWAITS...',
];

interface AtlasPixelLoaderProps {
  destination?: string;
  onComplete?: () => void;
}

export function AtlasPixelLoader({
  destination = '/globe',
  onComplete,
}: AtlasPixelLoaderProps) {
  const router = useRouter();
  const { user, initAuth } = useAuth();
  const { setExperiences, setWishlistItems, setLocations } = useAtlasStore();

  const [progress, setProgress] = useState(12);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const hasStartedRef = useRef(false);

  // Message rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Main functional initialization
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function initializeAtlas() {
      try {
        // Step 1: Initialize session / verify auth (0% - 25%)
        setProgress(25);
        await initAuth();

        // Step 2: Parallel fetch of experiences, wishlist, and texture pre-warm (25% - 75%)
        const fetchTimeout = (ms: number) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), ms)
          );

        // Fetch Experiences
        const expPromise = Promise.race([
          fetch('/api/experiences').then((r) => (r.ok ? r.json() : null)),
          fetchTimeout(4500),
        ]).catch(() => null);

        // Fetch Wishlist
        const wishPromise = Promise.race([
          fetch('/api/wishlist').then((r) => (r.ok ? r.json() : null)),
          fetchTimeout(4500),
        ]).catch(() => null);

        // Preload daylight texture
        const texturePromise = new Promise<void>((resolve) => {
          if (typeof window === 'undefined') return resolve();
          const img = new Image();
          img.src = '/textures/earth_gamified_pop.png';
          img.onload = () => resolve();
          img.onerror = () => resolve(); // non-critical, resolve regardless
          setTimeout(resolve, 3500); // 3.5s max cap
        });

        // Run data fetching with progress increments
        const [expResult, wishResult] = await Promise.allSettled([
          expPromise,
          wishPromise,
          texturePromise,
        ]);

        setProgress(60);

        // Populate store safely (merge without wiping local unsynced pins)
        if (expResult.status === 'fulfilled' && expResult.value) {
          const rawExps = Array.isArray(expResult.value)
            ? expResult.value
            : expResult.value.experiences || [];
          if (rawExps.length > 0) {
            const localExps = useAtlasStore.getState().experiences;
            const serverIds = new Set(rawExps.map((e: any) => e.id));
            const preservedLocal = localExps.filter(
              (e) => !serverIds.has(e.id) && e.id.startsWith('exp-')
            );
            setExperiences([...rawExps, ...preservedLocal]);
            const extractedLocations = rawExps
              .map((e: any) => e.location)
              .filter(Boolean);
            if (extractedLocations.length > 0) {
              const localLocs = useAtlasStore.getState().locations;
              const locMap = new Map<string, any>();
              [...localLocs, ...extractedLocations].forEach((l: any) => {
                if (l?.id) locMap.set(l.id, l);
              });
              setLocations(Array.from(locMap.values()));
            }
          }
        }

        if (wishResult.status === 'fulfilled' && wishResult.value) {
          const rawWish = Array.isArray(wishResult.value)
            ? wishResult.value
            : wishResult.value.wishlist || wishResult.value.items || [];
          if (rawWish.length > 0) {
            const localWish = useAtlasStore.getState().wishlistItems;
            const serverIds = new Set(rawWish.map((w: any) => w.id));
            const preservedLocal = localWish.filter(
              (w) => !serverIds.has(w.id) && w.id.startsWith('wish-')
            );
            setWishlistItems([...rawWish, ...preservedLocal]);
          }
        }

        setProgress(85);

        // Final polishing pause for smooth animation pacing
        await new Promise((r) => setTimeout(r, 600));
        setProgress(100);

        // Smooth exit transition
        await new Promise((r) => setTimeout(r, 450));
        setIsFinishing(true);

        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            router.push(destination);
          }
        }, 350);
      } catch (err: any) {
        console.warn('Initialization warning:', err);
        // Non-fatal fallback: allow user through to globe anyway
        setProgress(100);
        setIsFinishing(true);
        setTimeout(() => {
          if (onComplete) onComplete();
          else router.push(destination);
        }, 400);
      }
    }

    initializeAtlas();
  }, [destination, initAuth, onComplete, router, setExperiences, setLocations, setWishlistItems]);

  const handleRetry = () => {
    setErrorState(null);
    hasStartedRef.current = false;
    setProgress(15);
  };

  const handleSkipToGlobe = () => {
    router.push('/globe');
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none bg-warm-cream-grid overflow-hidden transition-all duration-500',
        isFinishing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      )}
    >
      {/* Top Travel Manifest Tag */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD45A] border-2 border-[#171313] text-xs font-black uppercase tracking-wider text-[#171313] shadow-pop-sm">
        <span>✈️</span>
        <span>ATLAS EXPEDITION • FLIGHT MANIFEST</span>
        <DoodleSparkle size={14} color="#F04432" />
      </div>

      {/* Main Pixel-Art Postcard Scene Card */}
      <div className="relative w-full max-w-lg bg-white border-2 border-[#171313] rounded-3xl p-6 sm:p-8 shadow-pop-lg flex flex-col items-center text-center space-y-6">
        {/* Pixel Earth & Flight Path Stage */}
        <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-[#FFF4D9] border-2 border-[#171313] overflow-hidden flex items-center justify-center shadow-inner">
          {/* Subtle Latitude/Longitude Grid in Ink Black */}
          <div className="absolute inset-0 opacity-15 pointer-events-none [background-size:24px_24px] [background-image:linear-gradient(to_right,#171313_1px,transparent_1px),linear-gradient(to_bottom,#171313_1px,transparent_1px)]" />

          {/* Pixel Clouds floating across */}
          <div className="absolute top-4 left-6 animate-pulse opacity-85">
            <PixelCloud size={44} />
          </div>
          <div className="absolute top-12 right-8 opacity-75 hidden sm:block">
            <PixelCloud size={36} />
          </div>
          <div className="absolute bottom-6 left-10 opacity-70">
            <PixelCloud size={30} />
          </div>

          {/* Central Pixel Earth Canvas */}
          <div className="relative flex items-center justify-center">
            <PixelGlobeSphere progress={progress} />

            {/* Flight Path SVG Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 240 180"
            >
              {/* Curved dotted flight trail */}
              <path
                d="M 25,140 Q 70,30 140,55 T 215,95"
                fill="none"
                stroke="#171313"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                className="opacity-40"
              />
              <path
                d="M 25,140 Q 70,30 140,55 T 215,95"
                fill="none"
                stroke="#F04432"
                strokeWidth="3"
                strokeDasharray="6 6"
                style={{
                  strokeDashoffset: `${180 - (progress / 100) * 180}`,
                  transition: 'stroke-dashoffset 0.4s ease-out',
                }}
              />

              {/* Waypoint Markers */}
              <g transform="translate(25, 140)">
                <circle r="4" fill="#326BEE" stroke="#171313" strokeWidth="2" />
              </g>
              {progress >= 40 && (
                <g transform="translate(95, 42)">
                  <circle r="4.5" fill="#FFD45A" stroke="#171313" strokeWidth="2" />
                </g>
              )}
              {progress >= 75 && (
                <g transform="translate(170, 75)">
                  <circle r="4.5" fill="#10B981" stroke="#171313" strokeWidth="2" />
                </g>
              )}
              {progress >= 95 && (
                <g transform="translate(215, 95)">
                  <circle r="5" fill="#F04432" stroke="#171313" strokeWidth="2" />
                </g>
              )}
            </svg>

            {/* Flying Pixel Aeroplane */}
            <div
              className="absolute transition-all duration-300 ease-out z-20"
              style={{
                // Calculate position along curve
                left: `${15 + (progress / 100) * 65}%`,
                top: `${60 - Math.sin((progress / 100) * Math.PI) * 45}%`,
                transform: `rotate(${Math.sin((progress / 100) * Math.PI) > 0.5 ? -12 : 12}deg)`,
              }}
            >
              <PixelAirplaneSprite />
            </div>
          </div>

          {/* Mini Pin Pill */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white border-2 border-[#171313] text-[10px] font-black text-[#171313] flex items-center gap-1 shadow-pop-xs">
            <MapPin className="w-3 h-3 text-[#F04432] stroke-[3]" />
            <span>ALT: 32,000 FT</span>
          </div>
        </div>

        {/* Dynamic Status Text & Progress Bar */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wider text-[#6425F5] uppercase flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#6425F5] stroke-[2.5] animate-spin" />
              {LOADING_MESSAGES[currentMessageIndex]}
            </span>
            <span className="text-xs font-mono font-black text-[#171313] px-2 py-0.5 rounded-md bg-[#FFD45A] border border-[#171313]">
              {progress}%
            </span>
          </div>

          {/* Chunky Bento-Pop Progress Bar */}
          <div className="w-full h-4 bg-[#FFF4D9] rounded-full border-2 border-[#171313] overflow-hidden p-0.5 shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-[#FFD45A] via-[#F04432] to-[#6425F5] rounded-full border-r-2 border-[#171313] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-[#171313]/60 font-bold">
            Synchronizing your geographical passport, memories, and personal coordinates.
          </p>
        </div>

        {/* Error / Timeout Fallback */}
        {errorState && (
          <div className="w-full p-3 bg-rose-50 border-2 border-[#F04432] rounded-2xl flex items-center justify-between text-xs font-black text-[#F04432]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorState}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-2.5 py-1 bg-[#F04432] text-white rounded-lg flex items-center gap-1 hover:bg-[#d63b2b]"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Skip button if taking more than 3 seconds */}
        <button
          onClick={handleSkipToGlobe}
          className="text-[11px] text-[#171313]/50 hover:text-[#171313] font-black underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Skip directly to Globe</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Footer Branding */}
      <div className="mt-5 text-center">
        <p className="text-xs font-black tracking-tight text-[#171313] uppercase font-serif">
          ATLAS — YOUR LIFE, MAPPED.
        </p>
      </div>
    </div>
  );
}

// Pixel Earth Sphere with pixelated continents
function PixelGlobeSphere({ progress }: { progress: number }) {
  return (
    <div
      className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#326BEE] border-4 border-[#171313] shadow-pop overflow-hidden flex items-center justify-center"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pixel Continent Shapes (Handcrafted Pixel Landmasses) */}
      <svg
        className="w-full h-full"
        viewBox="0 0 64 64"
        style={{
          imageRendering: 'pixelated',
          transform: `rotate(${progress * 0.4}deg)`,
          transition: 'transform 0.4s linear',
        }}
      >
        {/* Eurasia / Africa */}
        <rect x="22" y="10" width="12" height="6" fill="#10B981" />
        <rect x="18" y="14" width="18" height="8" fill="#10B981" />
        <rect x="26" y="22" width="16" height="12" fill="#10B981" />
        <rect x="28" y="34" width="10" height="10" fill="#10B981" />
        <rect x="30" y="44" width="6" height="6" fill="#10B981" />

        {/* Americas */}
        <rect x="6" y="14" width="10" height="8" fill="#34D399" />
        <rect x="8" y="22" width="8" height="12" fill="#34D399" />
        <rect x="10" y="34" width="7" height="14" fill="#34D399" />
        <rect x="12" y="48" width="4" height="6" fill="#34D399" />

        {/* Islands & Outliers */}
        <rect x="46" y="18" width="6" height="6" fill="#10B981" />
        <rect x="48" y="38" width="10" height="8" fill="#10B981" />
      </svg>

      {/* Atmospheric highlight */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none" />
    </div>
  );
}

// Handcrafted Pixel Aeroplane Sprite
function PixelAirplaneSprite() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className="drop-shadow-md"
    >
      {/* Fuselage (White/Cream) */}
      <rect x="7" y="2" width="2" height="12" fill="#FFFFFF" />
      <rect x="6" y="4" width="4" height="8" fill="#FFFFFF" />
      <rect x="7" y="1" width="2" height="2" fill="#F04432" /> {/* Nose cone in Tomato Red */}

      {/* Cockpit Window in Ink Black */}
      <rect x="7" y="4" width="2" height="2" fill="#171313" />

      {/* Main Wings in Sunflower Yellow */}
      <rect x="2" y="7" width="12" height="2" fill="#FFD45A" />
      <rect x="1" y="8" width="14" height="2" fill="#FFD45A" />
      <rect x="0" y="9" width="3" height="1" fill="#F04432" /> {/* Wingtip red */}
      <rect x="13" y="9" width="3" height="1" fill="#F04432" />

      {/* Tail Fin */}
      <rect x="6" y="12" width="4" height="2" fill="#6425F5" />
      <rect x="5" y="13" width="6" height="1" fill="#6425F5" />

      {/* Jet Exhaust pixel puffs */}
      <rect x="7" y="14" width="2" height="2" fill="#FFD45A" className="animate-pulse" />
    </svg>
  );
}

// Cute pixel cloud
function PixelCloud({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.6)}
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="6" y="2" width="8" height="4" fill="#FFFFFF" />
      <rect x="4" y="4" width="16" height="6" fill="#FFFFFF" />
      <rect x="2" y="6" width="20" height="6" fill="#FFFFFF" />
      <rect x="0" y="8" width="24" height="4" fill="#FFFFFF" />
      <rect x="2" y="12" width="20" height="2" fill="#E2E8F0" />
    </svg>
  );
}
