'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  Settings,
  BarChart3,
  Clock,
  Sparkles,
  X,
  ChevronDown,
  Shield,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { DoodleSparkle } from '@/components/ui/doodles';

export function AccountMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setIsOpen(false);
      // Hard redirect to login page ensures all React & DOM state is cleanly reloaded
      window.location.href = '/login';
    } catch (err) {
      console.error('Sign out error:', err);
      setIsSigningOut(false);
    }
  };

  const displayName = user?.fullName || (user?.isGuest ? 'Guest Explorer' : 'Explorer');
  const displayEmail = user?.email || (user?.isGuest ? 'guest@atlas.journal' : '');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'EX';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button: Bento Pop Avatar Capsule */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Account & Session Menu"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full border-2 border-[#171313] transition-all cursor-pointer shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5',
          isOpen ? 'bg-[#FFD45A]' : 'bg-white hover:bg-[#FFF4D9]'
        )}
      >
        {/* Avatar Circle */}
        <div className="w-7 h-7 rounded-full bg-[#6425F5] text-white flex items-center justify-center text-[11px] font-black border border-[#171313] shadow-pop-xs">
          {initials}
        </div>

        {/* Desktop Name Label */}
        <span className="hidden md:inline text-xs font-black text-[#171313] max-w-[90px] truncate">
          {displayName}
        </span>

        <ChevronDown
          className={cn(
            'w-3 h-3 text-[#171313] stroke-[3] transition-transform duration-200 hidden sm:block',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Popover / Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 sm:hidden"
            />

            {/* Menu Container: Dropdown on desktop, Bottom/Center card on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 z-50 w-auto sm:w-80 bg-white border-3 border-[#171313] rounded-3xl p-4 sm:p-5 shadow-pop-lg select-none"
            >
              {/* Close Button on Mobile */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 p-1 rounded-full text-[#171313]/60 hover:text-[#171313] hover:bg-[#FFD45A] border border-transparent hover:border-[#171313] sm:hidden cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* User Passport Header Card */}
              <div className="p-3 bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl relative mb-3.5 shadow-pop-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#6425F5] text-white flex items-center justify-center text-sm font-black border-2 border-[#171313] shadow-pop-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-[#171313] truncate font-serif">
                        {displayName}
                      </p>
                      <DoodleSparkle size={12} color="#F04432" />
                    </div>
                    {displayEmail && (
                      <p className="text-[11px] font-bold text-[#171313]/60 truncate">
                        {displayEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#171313]/10 flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#171313]/60 uppercase tracking-wider">
                    Passport Status
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-black border border-[#171313]',
                      user?.isGuest
                        ? 'bg-[#FFD45A] text-[#171313]'
                        : 'bg-emerald-400 text-[#171313]'
                    )}
                  >
                    {user?.isGuest ? '🟡 Guest Pass' : '✈️ Verified Explorer'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-[#171313] hover:bg-[#FFD45A]/40 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />
                  <span>Account & Privacy Settings</span>
                </Link>

                <Link
                  href="/statistics"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-[#171313] hover:bg-[#FFD45A]/40 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#326BEE] stroke-[2.5]" />
                  <span>Travel Statistics</span>
                </Link>

                <Link
                  href="/timeline"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-[#171313] hover:bg-[#FFD45A]/40 transition-colors"
                >
                  <Clock className="w-4 h-4 text-[#F04432] stroke-[2.5]" />
                  <span>Chronological Timeline</span>
                </Link>
              </div>

              {/* Guest Upgrade Prompt */}
              {user?.isGuest && (
                <div className="mt-2 pt-2 border-t-2 border-[#171313]/10">
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-black text-white bg-[#6425F5] hover:bg-[#521ecf] border-2 border-[#171313] shadow-pop-xs flex items-center justify-center gap-2 transition-all cursor-pointer mb-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Create Full Account to Sync</span>
                  </Link>
                </div>
              )}

              {/* Logout Button */}
              <div className="mt-2 pt-2 border-t-2 border-[#171313]/10">
                <button
                  type="button"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#F04432] hover:bg-[#d63b2b] border-2 border-[#171313] shadow-pop hover:scale-[1.01] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSigningOut ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing Out…</span>
                    </span>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 stroke-[2.5]" />
                      <span>{user?.isGuest ? 'Exit Guest Mode' : 'Sign Out of ATLAS'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
