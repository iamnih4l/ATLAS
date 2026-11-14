import React from 'react';
import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#09090b] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 vignette-radial pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/60 transition-all glow-emerald-subtle">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-xl tracking-widest text-[#f5f5f0] uppercase">
            ATLAS
          </span>
        </Link>
        <p className="text-xs text-[#71717a] mt-1.5 font-medium tracking-tight">
          A digital atlas of your life. Every location tells a story.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-md bg-[#121215] border border-[#23232b] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[#52525b] relative z-10">
        Encrypted & Private Geographical Archive
      </div>
    </div>
  );
}

