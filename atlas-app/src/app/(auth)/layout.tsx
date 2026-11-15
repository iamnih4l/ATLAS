import React from 'react';
import Link from 'next/link';
import { PixelCompass } from '@/components/ui/pixel-stickers';
import { DoodleSparkle } from '@/components/ui/doodles';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-warm-cream-grid flex flex-col justify-between items-center p-3 sm:p-6 md:p-8 relative overflow-y-auto">
      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group cursor-pointer"
          title="ATLAS — Return Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#6425F5] border-2 border-[#171313] flex items-center justify-center text-white shadow-pop-sm group-hover:scale-105 group-hover:rotate-6 transition-all">
            <PixelCompass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#171313] uppercase font-serif leading-none">
                ATLAS
              </span>
              <span className="text-xs text-[#F04432] animate-bounce">★</span>
            </div>
            <span className="text-[9px] font-black text-[#6425F5] tracking-widest uppercase block mt-0.5">
              PERSONAL GEOGRAPHICAL ARCHIVE
            </span>
          </div>
        </Link>

        {/* Passport Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD45A] border-2 border-[#171313] text-[10px] font-black text-[#171313] uppercase shadow-pop-xs">
          <span>✈️</span>
          <span>PASSPORT CONTROL</span>
          <DoodleSparkle size={12} color="#F04432" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl flex-1 py-4 sm:py-8 flex items-center justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t-2 border-[#171313]/10 text-center text-xs font-bold text-[#171313]/60">
        <div>
          <span>© {new Date().getFullYear()} ATLAS. Your life, mapped. Encrypted & Private.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black text-[#171313]/70">
          <span>3D EARTH</span>
          <span>•</span>
          <span>PERSONAL MEMORIES</span>
          <span>•</span>
          <span>ORION AI</span>
        </div>
      </footer>
    </div>
  );
}
