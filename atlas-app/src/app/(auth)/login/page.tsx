'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import {
  Mail,
  ArrowRight,
  Globe2,
  Sparkles,
  ShieldCheck,
  Compass,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
} from 'lucide-react';
import { WashiTape, PassportStamp, DoodleSparkle, DoodleUnderline } from '@/components/ui/doodles';
import { PixelPlane, PixelCompass, PixelBalloon } from '@/components/ui/pixel-stickers';
import { JoyBlob, StarSpike } from '@/components/ui/mascot-doodles';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, continueAsGuest, resendVerification, resetPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Forgot Password Mode
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setNeedsVerification(false);

    if (!email || !password) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    const res = await signIn(email, password);

    if (res.success) {
      // Seamlessly transition through the cinematic pixel loading experience
      router.push('/loading');
    } else {
      setErrorMessage(res.error || 'Failed to authenticate');
      if (res.needsEmailVerification) {
        setNeedsVerification(true);
      }
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    router.push('/loading');
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage('Please enter your email above to resend verification.');
      return;
    }
    setIsResending(true);
    const res = await resendVerification(email);
    setIsResending(false);
    if (res.success) {
      setSuccessMessage(res.message || 'Verification link sent to your email.');
    } else {
      setErrorMessage(res.error || 'Could not resend email.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const res = await resetPassword(forgotEmail);
    if (res.success) {
      setForgotStatus('Password reset link sent! Please check your inbox.');
    } else {
      setForgotStatus(res.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
      {/* LEFT SECTION (Hero on Desktop, compact banner on Mobile) */}
      <div className="lg:col-span-6 space-y-6 text-left">
        {/* Mobile Header Badge */}
        <div className="inline-flex lg:hidden items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD45A] border-2 border-[#171313] text-[10px] font-black text-[#171313] uppercase shadow-pop-xs">
          <span>✈️</span>
          <span>ATLAS PASSPORT • SIGN IN</span>
        </div>

        {/* Big Editorial Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 bg-[#6425F5] text-white rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#171313] shadow-pop-xs">
              Welcome Back
            </span>
            <DoodleSparkle size={18} color="#F04432" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171313] tracking-tight font-serif leading-[1.1]">
            YOUR NEXT ADVENTURE <span className="text-[#6425F5]">STARTS HERE.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#171313]/80 font-bold leading-relaxed max-w-md">
            Keep track of everywhere you’ve been, every experience you’ve collected, and everything still waiting to be explored.
          </p>
        </div>

        {/* Pixel Art Illustration Showcase Card (Desktop & Tablet) */}
        <div className="relative bg-white border-2 border-[#171313] rounded-3xl p-5 shadow-pop overflow-hidden hidden sm:block">
          <WashiTape className="absolute -top-3 left-10 z-10" rotate="-2deg" color="bg-[#FFD45A]" />

          <div className="flex items-center gap-4">
            {/* Mini Pixel Earth with Plane */}
            <div className="relative w-20 h-20 rounded-2xl bg-[#326BEE] border-2 border-[#171313] flex items-center justify-center shadow-pop-sm shrink-0 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
                <rect x="8" y="6" width="10" height="6" fill="#10B981" />
                <rect x="12" y="12" width="12" height="8" fill="#10B981" />
                <rect x="4" y="16" width="8" height="8" fill="#34D399" />
              </svg>
              <div className="absolute top-2 right-2 animate-bounce">
                <PixelPlane size={24} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-black text-[#171313] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#6425F5]" />
                <span>Private 3D Geographical Archive</span>
              </h3>
              <p className="text-xs text-[#171313]/70 font-medium">
                Log real-world coordinates, pin memories to Earth, and curate your personal wishlist.
              </p>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t-2 border-[#171313]/10 text-[11px] font-black">
            <span className="px-2.5 py-1 bg-[#FFF4D9] rounded-xl border border-[#171313]/30 text-[#171313] flex items-center gap-1">
              🌍 3D Earth
            </span>
            <span className="px-2.5 py-1 bg-[#FFF4D9] rounded-xl border border-[#171313]/30 text-[#171313] flex items-center gap-1">
              🔒 Encrypted Memories
            </span>
            <span className="px-2.5 py-1 bg-[#FFF4D9] rounded-xl border border-[#171313]/30 text-[#171313] flex items-center gap-1">
              ✨ Orion AI Companion
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Bento-Pop Authentication Card */}
      <div className="lg:col-span-6 w-full">
        <div className="relative w-full bg-white border-2 border-[#171313] rounded-3xl p-6 sm:p-8 shadow-pop-lg">
          {/* Top Folder Tab */}
          <div className="absolute -top-3 left-8 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-xl bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black text-[#171313] uppercase tracking-wider shadow-pop-sm">
            <span>📁</span>
            <span>ATLAS PASSPORT • SIGN IN</span>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-[#171313] tracking-tight font-serif">
                Sign In to ATLAS
              </h2>
              <p className="text-xs text-[#171313]/70 font-bold mt-1">
                Enter your credentials to unlock your 3D globe and journals.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-[#F04432]/10 border-2 border-[#F04432] rounded-2xl text-xs font-black text-[#F04432] flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p>{errorMessage}</p>
                  {needsVerification && (
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendVerification}
                      className="text-xs text-[#6425F5] underline hover:text-[#521ecf] flex items-center gap-1 mt-1 font-black cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isResending ? 'Sending…' : 'Resend Verification Email'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-xs font-black text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Main Form */}
            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="explorer@atlas.journal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 stroke-[2.5]" />}
                  required
                  autoComplete="email"
                />

                <div className="space-y-1">
                  <PasswordInput
                    label="Password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-[#6425F5] hover:underline font-black cursor-pointer pt-1"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[48px] py-3 px-6 rounded-2xl text-sm font-black text-white bg-[#6425F5] hover:bg-[#521ecf] border-2 border-[#171313] shadow-pop hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials…</span>
                      </span>
                    ) : (
                      <>
                        <span>Unlock My Atlas</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>

                  {/* Guest Exploration Option */}
                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl text-xs font-black text-[#171313] bg-[#FFD45A] hover:bg-[#ffcd38] border-2 border-[#171313] shadow-pop-sm hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🧭</span>
                    <span>Explore as Guest (No Login Required)</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Forgot Password Form */
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-[#171313]/80 font-bold">
                  Enter your email address to receive a secure password recovery link.
                </p>

                <Input
                  type="email"
                  label="Registered Email"
                  placeholder="explorer@atlas.journal"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 stroke-[2.5]" />}
                  required
                />

                {forgotStatus && (
                  <p className="text-xs font-black text-[#6425F5] bg-[#6425F5]/10 p-2.5 rounded-xl border border-[#6425F5]/30">
                    {forgotStatus}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-[#6425F5] border-2 border-[#171313] shadow-pop-sm hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotStatus(null);
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-black text-[#171313] bg-white border-2 border-[#171313] hover:bg-[#FFF4D9] transition-all cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* Switch to Registration */}
            <div className="text-center text-xs font-bold text-[#171313]/70 pt-4 border-t-2 border-[#171313]/10">
              Don’t have an archive yet?{' '}
              <Link
                href="/register"
                className="text-[#6425F5] hover:text-[#521ecf] font-black underline underline-offset-2 ml-1"
              >
                Create private account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
