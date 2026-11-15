'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  User,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
  Compass,
  Check,
  X,
} from 'lucide-react';
import { WashiTape, PassportStamp, DoodleSparkle } from '@/components/ui/doodles';
import { PixelPlane, PixelCompass, PixelBalloon } from '@/components/ui/pixel-stickers';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, resendVerification, continueAsGuest, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Validation helpers
  const isLengthValid = password.length >= 6;
  const isMatchValid = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!isLengthValid) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    const res = await signUp(email, password, fullName);

    if (res.success) {
      if (res.needsEmailVerification) {
        setRegisteredEmail(email.trim());
        setIsVerificationSent(true);
      } else {
        // Automatically proceed through the cinematic loading experience
        router.push('/loading');
      }
    } else {
      setErrorMessage(res.error || 'Registration failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    const res = await resendVerification(registeredEmail);
    setIsResending(false);
    if (res.success) {
      setResendStatus('Fresh confirmation link sent! Check your inbox & spam folder.');
    } else {
      setResendStatus(res.error || 'Could not resend confirmation email.');
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    router.push('/loading');
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
      {/* LEFT SECTION (Hero Branding) */}
      <div className="lg:col-span-6 space-y-6 text-left">
        {/* Mobile Badge */}
        <div className="inline-flex lg:hidden items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD45A] border-2 border-[#171313] text-[10px] font-black text-[#171313] uppercase shadow-pop-xs">
          <span>🚀</span>
          <span>ATLAS PASSPORT • REGISTRATION</span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 bg-[#10B981] text-white rounded-full text-xs font-black uppercase tracking-wider border-2 border-[#171313] shadow-pop-xs">
              Start Your Archive
            </span>
            <DoodleSparkle size={18} color="#FFD45A" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171313] tracking-tight font-serif leading-[1.1]">
            CREATE YOUR <span className="text-[#F04432]">PRIVATE ATLAS.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#171313]/80 font-bold leading-relaxed max-w-md">
            Begin cataloging your real-world journeys, personal milestones, and hidden venues on a living 3D Earth.
          </p>
        </div>

        {/* Pixel Art Showcase Card */}
        <div className="relative bg-white border-2 border-[#171313] rounded-3xl p-5 shadow-pop overflow-hidden hidden sm:block">
          <WashiTape className="absolute -top-3 left-10 z-10" rotate="-2deg" color="bg-[#F04432]" />

          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center shadow-pop-sm shrink-0">
              <PixelCompass size={40} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-black text-[#171313] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#6425F5]" />
                <span>Your Lifelong Travel Journal</span>
              </h3>
              <p className="text-xs text-[#171313]/70 font-medium">
                Photographs, coordinates, sensory notes, and AI-curated discovery suggestions.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-black">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
            <span>Encrypted & Private: Your memories belong exclusively to you.</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Registration Card */}
      <div className="lg:col-span-6 w-full">
        <div className="relative w-full bg-white border-2 border-[#171313] rounded-3xl p-6 sm:p-8 shadow-pop-lg">
          {/* Top Folder Tab */}
          <div className="absolute -top-3 left-8 z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-t-xl bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black text-[#171313] uppercase tracking-wider shadow-pop-sm">
            <span>📁</span>
            <span>ATLAS PASSPORT • REGISTER</span>
          </div>

          {!isVerificationSent ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-[#171313] tracking-tight font-serif">
                  Begin Your Journey
                </h2>
                <p className="text-xs text-[#171313]/70 font-bold mt-1">
                  Create your private passport to start mapping your world.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 bg-[#F04432]/10 border-2 border-[#F04432] rounded-2xl text-xs font-black text-[#F04432] flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <Input
                  type="text"
                  label="Full Name"
                  placeholder="e.g. Alex Drake"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 stroke-[2.5]" />}
                  required
                  autoComplete="name"
                />

                <Input
                  type="email"
                  label="Email Address"
                  placeholder="alex@explorer.journal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 stroke-[2.5]" />}
                  required
                  autoComplete="email"
                />

                <PasswordInput
                  label="Password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                {/* Live Password Requirements Checklist */}
                {password.length > 0 && (
                  <div className="p-3 bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl space-y-1.5 shadow-pop-xs">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#171313]/70">
                      Security Check:
                    </p>
                    <div className="flex items-center gap-2 text-xs font-black">
                      {isLengthValid ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#F04432] stroke-[3]" />
                      )}
                      <span className={isLengthValid ? 'text-emerald-700' : 'text-[#F04432]'}>
                        At least 6 characters
                      </span>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-black">
                        {isMatchValid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#F04432] stroke-[3]" />
                        )}
                        <span className={isMatchValid ? 'text-emerald-700' : 'text-[#F04432]'}>
                          Passwords match
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[48px] py-3 px-6 rounded-2xl text-sm font-black text-white bg-[#F04432] hover:bg-[#d63b2b] border-2 border-[#171313] shadow-pop hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Your Passport…</span>
                      </span>
                    ) : (
                      <>
                        <span>Begin My Adventure</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl text-xs font-black text-[#171313] bg-[#FFD45A] hover:bg-[#ffcd38] border-2 border-[#171313] shadow-pop-sm hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🧭</span>
                    <span>Explore as Guest (No Account Required)</span>
                  </button>
                </div>
              </form>

              {/* Switch to Sign In */}
              <div className="text-center text-xs font-bold text-[#171313]/70 pt-4 border-t-2 border-[#171313]/10">
                Already have an archive?{' '}
                <Link
                  href="/login"
                  className="text-[#6425F5] hover:text-[#521ecf] font-black underline underline-offset-2 ml-1"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>
          ) : (
            /* EMAIL CONFIRMATION REQUIRED SCREEN */
            <div className="space-y-5 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center mx-auto shadow-pop">
                <Mail className="w-8 h-8 text-[#171313] stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#171313] tracking-tight font-serif">
                  Check Your Inbox! ✉️
                </h2>
                <p className="text-xs text-[#171313]/80 font-bold leading-relaxed max-w-sm mx-auto">
                  We sent a confirmation link to <span className="text-[#6425F5] font-black">{registeredEmail}</span>.
                  Please tap the link in the email to activate your ATLAS passport.
                </p>
              </div>

              {resendStatus && (
                <div className="p-3 bg-white border-2 border-[#171313] rounded-xl text-xs font-black text-[#6425F5] shadow-pop-xs">
                  {resendStatus}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <Link
                  href="/login"
                  className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl text-xs font-black text-white bg-[#6425F5] hover:bg-[#521ecf] border-2 border-[#171313] shadow-pop hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>

                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResend}
                  className="w-full min-h-[42px] py-2 px-4 rounded-2xl text-xs font-black text-[#171313] bg-white hover:bg-[#FFF4D9] border-2 border-[#171313] shadow-pop-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isResending ? 'Sending link…' : 'Resend Confirmation Email'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
