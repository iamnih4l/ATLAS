'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe2,
  Compass,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DoodleSparkle, DoodleUnderline, PassportStamp, WashiTape } from '@/components/ui/doodles';
import { PixelCompass, PixelPlane } from '@/components/ui/pixel-stickers';
import { VerifiedStamp } from '@/components/ui/atlas-illustrations';

function VerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const handleExplore = () => {
    // Seamlessly transition through the cinematic pixel loading experience to the 3D globe
    router.push('/loading');
  };

  if (errorParam) {
    return (
      <div className="relative w-full max-w-lg bg-white border-3 border-[#171313] rounded-3xl p-6 sm:p-8 shadow-pop-lg text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Top Folder Tab */}
        <div className="absolute -top-3.5 left-8 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-xl bg-[#F04432] border-2 border-[#171313] border-b-0 text-[10px] font-black text-white uppercase tracking-wider shadow-pop-sm">
          <span>⚠️</span>
          <span>PASSPORT VERIFICATION • NOTICE</span>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-[#F04432]/10 border-2 border-[#F04432] mx-auto flex items-center justify-center text-[#F04432] mb-4 shadow-pop-sm">
          <AlertCircle className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 className="text-2xl font-black text-[#171313] tracking-tight font-serif mb-2">
          Verification Link Expired
        </h2>

        <p className="text-xs text-[#171313]/70 font-bold mb-6 max-w-sm mx-auto leading-relaxed">
          {errorParam.length > 3
            ? decodeURIComponent(errorParam)
            : 'This confirmation link is invalid or has already expired. If your account is already confirmed, you can sign in directly.'}
        </p>

        <div className="space-y-3 pt-2">
          <Link
            href="/login"
            className="w-full min-h-[48px] py-3 px-6 rounded-2xl text-xs font-black text-white bg-[#6425F5] hover:bg-[#521ecf] border-2 border-[#171313] shadow-pop hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <Link
            href="/register"
            className="block text-xs font-black text-[#171313]/70 hover:text-[#171313] hover:underline pt-1"
          >
            Create a New Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg bg-white border-3 border-[#171313] rounded-3xl p-6 sm:p-10 shadow-pop-lg text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Top Folder Tab */}
      <div className="absolute -top-3.5 left-8 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-xl bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black text-[#171313] uppercase tracking-wider shadow-pop-sm">
        <span>✈️</span>
        <span>ATLAS PASSPORT • VERIFIED</span>
      </div>

      {/* Rubber Passport Stamp in upper corner */}
      <div className="absolute top-4 right-5 pointer-events-none opacity-90 hidden sm:block">
        <PassportStamp label="OFFICIAL" sublabel="VERIFIED" color="#10B981" />
      </div>

      {/* Decorative Icon Centerpiece */}
      <div className="relative w-20 h-20 mx-auto mb-5">
        <div className="w-20 h-20 rounded-3xl bg-[#FFD45A] border-3 border-[#171313] flex items-center justify-center text-[#171313] shadow-pop transform -rotate-3">
          <PixelCompass size={40} />
        </div>
        <DoodleSparkle size={18} color="#6425F5" className="absolute -top-2 -right-2 animate-bounce" />
      </div>

      {/* Status Pill */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border-2 border-emerald-600 text-[11px] font-black text-emerald-800 uppercase tracking-wider mb-4 shadow-pop-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
        <span>Passport Activated</span>
      </div>

      {/* Main Canonical Heading */}
      <h1 className="text-3xl sm:text-4xl font-black text-[#171313] tracking-tight font-serif uppercase leading-none mb-3">
        YOUR WORLD IS WAITING.
      </h1>

      {/* Supporting Message */}
      <p className="text-sm font-bold text-[#171313]/80 max-w-sm mx-auto mb-8 leading-relaxed">
        Your email has been verified successfully. Welcome to ATLAS.
      </p>

      {/* Feature Highlights Bento Box */}
      <div className="p-4 bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl mb-8 text-left space-y-2 shadow-pop-xs">
        <div className="flex items-center gap-2.5 text-xs font-black text-[#171313]">
          <span className="w-5 h-5 rounded-lg bg-[#6425F5] text-white flex items-center justify-center text-[10px] shrink-0 border border-[#171313]">
            1
          </span>
          <span>Explore your personal 3D Earth globe</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-black text-[#171313]">
          <span className="w-5 h-5 rounded-lg bg-[#F04432] text-white flex items-center justify-center text-[10px] shrink-0 border border-[#171313]">
            2
          </span>
          <span>Pin travel memories, photos, and journal entries</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-black text-[#171313]">
          <span className="w-5 h-5 rounded-lg bg-[#326BEE] text-white flex items-center justify-center text-[10px] shrink-0 border border-[#171313]">
            3
          </span>
          <span>Unlock Orion AI travel companion insights</span>
        </div>
      </div>

      {/* Primary Action Button: EXPLORE ATLAS */}
      <button
        type="button"
        onClick={handleExplore}
        className="w-full min-h-[52px] py-3.5 px-8 rounded-2xl text-sm font-black text-white bg-[#6425F5] hover:bg-[#521ecf] border-3 border-[#171313] shadow-pop hover:scale-[1.02] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
      >
        <span>EXPLORE ATLAS</span>
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-black text-sm text-[#171313]">
          Loading verification status…
        </div>
      }
    >
      <VerifiedContent />
    </Suspense>
  );
}
