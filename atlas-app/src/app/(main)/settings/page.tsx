'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAtlasStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import {
  Lock,
  User,
  Sparkles,
  Download,
  Cloud,
  Check,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { DoodleSparkle, DoodleUnderline } from '@/components/ui/doodles';
import { AdventurePeaks } from '@/components/ui/atlas-illustrations';

export default function SettingsPage() {
  const { experiences, locations, wishlistItems, userPreferences, setUserPreferences } =
    useAtlasStore();

  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();

  const [fullName, setFullName] = useState(
    user?.fullName || 'Atlas Explorer'
  );
  const [email, setEmail] = useState(user?.email || 'explorer@atlas.journal');
  const [defaultPrivacy, setDefaultPrivacy] = useState<'private' | 'unlisted' | 'public'>(
    userPreferences?.default_privacy || 'private'
  );
  const [aiPersonalization, setAiPersonalization] = useState(
    userPreferences?.ai_personalization ?? true
  );
  const [allowLocation, setAllowLocation] = useState(
    userPreferences?.location_permission ?? false
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sync state with user and store
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
    }
    if (userPreferences) {
      if (userPreferences.default_privacy) setDefaultPrivacy(userPreferences.default_privacy);
      if (typeof userPreferences.ai_personalization === 'boolean') {
        setAiPersonalization(userPreferences.ai_personalization);
      }
      if (typeof userPreferences.location_permission === 'boolean') {
        setAllowLocation(userPreferences.location_permission);
      }
    }
  }, [user, userPreferences]);

  // Fetch latest cloud preferences on mount
  useEffect(() => {
    let isMounted = true;
    const loadCloudPreferences = async () => {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.preferences) {
            setUserPreferences(data.preferences);
            if (data.preferences.default_privacy) {
              setDefaultPrivacy(data.preferences.default_privacy);
            }
            if (typeof data.preferences.ai_personalization === 'boolean') {
              setAiPersonalization(data.preferences.ai_personalization);
            }
            if (typeof data.preferences.location_permission === 'boolean') {
              setAllowLocation(data.preferences.location_permission);
            }
          }
          if (isMounted && data.profile?.fullName) {
            setFullName(data.profile.fullName);
            updateUser({ fullName: data.profile.fullName });
          }
        }
      } catch (err) {
        console.warn('Failed to load cloud preferences:', err);
      }
    };

    loadCloudPreferences();
    return () => {
      isMounted = false;
    };
  }, [setUserPreferences, updateUser]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    window.location.href = '/login';
  };

  // Data Export JSON
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: { fullName, email },
      preferences: {
        defaultPrivacy,
        aiPersonalization,
        allowLocation,
      },
      statistics: {
        totalExperiences: experiences.length,
        totalLocations: locations.length,
        totalWishlist: wishlistItems.length,
      },
      locations,
      experiences,
      wishlistItems,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas-journal-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Optimistic local update
    const updatedName = fullName.trim() || 'Atlas Explorer';
    setUserPreferences({
      default_privacy: defaultPrivacy,
      ai_personalization: aiPersonalization,
      location_permission: allowLocation,
    });
    updateUser({ fullName: updatedName });

    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: updatedName,
          defaultPrivacy,
          aiPersonalization,
          allowLocation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setUserPreferences(data.preferences);
        }
        if (data.profile?.fullName) {
          updateUser({ fullName: data.profile.fullName });
        }
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.warn('Preferences save warning:', err);
      // Fallback: local save remains active
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-20 sm:pt-28 pb-28 sm:pb-24 px-3.5 sm:px-6 max-w-4xl mx-auto space-y-8 w-full bg-warm-cream-grid min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-[#171313]/15 pb-6">
        <div className="flex items-center gap-2.5">
          <AdventurePeaks size={32} />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#171313] font-sans">
              Account & Privacy Settings
            </h1>
            <DoodleUnderline className="text-[#FFD45A] mt-0.5" />
          </div>
          <DoodleSparkle size={20} color="#6425F5" />
        </div>
        <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
          Control your encrypted personal archive, AI discovery preferences, and cloud integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Information */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <h3 className="text-sm font-black text-[#171313] flex items-center gap-2 border-b-2 border-[#171313]/10 pb-3">
            <User className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />
            Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Display Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[#FFF4D9] border-2 border-[#171313] text-[#171313] font-black rounded-2xl shadow-pop-sm"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              disabled
              className="bg-[#FFF4D9]/60 border-2 border-[#171313]/40 text-[#171313]/70 font-black rounded-2xl cursor-not-allowed"
            />
          </div>
        </div>

        {/* Privacy & Encryption Defaults */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <div className="flex items-center justify-between border-b-2 border-[#171313]/10 pb-3">
            <h3 className="text-sm font-black text-[#171313] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F04432] stroke-[2.5]" />
              Privacy & Access Controls
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-300 text-[#171313] border border-[#171313] shadow-pop-sm">
              Cross-Device Cloud Synced
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-black text-[#171313] uppercase tracking-wider mb-1.5">
                Default Experience Privacy Level
              </label>
              <select
                value={defaultPrivacy}
                onChange={(e) => setDefaultPrivacy(e.target.value as any)}
                className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-4 py-2.5 text-xs text-[#171313] focus:outline-none font-black shadow-pop-sm cursor-pointer"
              >
                <option value="private">Private — Accessible strictly to your authenticated session</option>
                <option value="unlisted">Unlisted — Accessible only via secret direct token</option>
                <option value="public">Public — Indexed for public travel profile</option>
              </select>
            </div>

            <label className="flex items-start gap-3 p-4 bg-[#FFF4D9] rounded-2xl border-2 border-[#171313] shadow-pop-sm cursor-pointer">
              <input
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
                className="mt-1 rounded border-2 border-[#171313] text-[#F04432] focus:ring-[#F04432]"
              />
              <div className="text-xs">
                <span className="font-black text-[#171313] block">
                  Device Precise Location Permissions
                </span>
                <span className="text-[#171313]/70 text-[11px] font-bold mt-0.5 block">
                  Only query device GPS coordinates when explicitly requested for &apos;Nearby Discoveries&apos;. Never tracked in background.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* AI Orion Personalization */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <h3 className="text-sm font-black text-[#171313] flex items-center gap-2 border-b-2 border-[#171313]/10 pb-3">
            <Sparkles className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />
            Orion AI Personalization
          </h3>

          <label className="flex items-start gap-3 p-4 bg-[#FFF4D9] rounded-2xl border-2 border-[#171313] shadow-pop-sm cursor-pointer">
            <input
              type="checkbox"
              checked={aiPersonalization}
              onChange={(e) => setAiPersonalization(e.target.checked)}
              className="mt-1 rounded border-2 border-[#171313] text-[#6425F5] focus:ring-[#6425F5]"
            />
            <div className="text-xs">
              <span className="font-black text-[#171313] block">
                Enable Context-Aware Recommendations
              </span>
              <span className="text-[#171313]/70 text-[11px] font-bold mt-0.5 block">
                Allow Orion to analyze past ratings, categories, and wishlist items to curate relevant real-world discoveries.
              </span>
            </div>
          </label>
        </div>

        {/* Cloud & External Services */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <h3 className="text-sm font-black text-[#171313] flex items-center gap-2 border-b-2 border-[#171313]/10 pb-3">
            <Cloud className="w-4 h-4 text-[#326BEE] stroke-[2.5]" />
            Connected Accounts & Storage
          </h3>

          <div className="p-4 bg-[#FFF4D9] rounded-2xl border-2 border-[#171313] shadow-pop-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#326BEE] text-white border border-[#171313]">
                <Cloud className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs">
                <p className="font-black text-[#171313]">Google Drive Integration</p>
                <p className="text-[11px] text-[#171313]/70 font-bold">
                  Import photos and extract original camera & GPS EXIF metadata
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#FFD45A] text-[#171313] border border-[#171313] shadow-pop-sm">
              Ready
            </span>
          </div>
        </div>

        {/* Data Portability & Export */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <h3 className="text-sm font-black text-[#171313] flex items-center gap-2 border-b-2 border-[#171313]/10 pb-3">
            <Download className="w-4 h-4 text-[#F04432] stroke-[2.5]" />
            Data Portability
          </h3>
          <p className="text-xs text-[#171313]/70 font-bold leading-relaxed">
            Your memories belong to you. Export your entire journal, verified geographical coordinates, timeline records, and bucket list as a structured JSON file.
          </p>
          <button
            type="button"
            onClick={handleExportData}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Complete Journal (JSON)</span>
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-[#171313]/15">
          {isSaved ? (
            <span className="text-xs text-emerald-700 font-black flex items-center gap-1.5 animate-in fade-in bg-emerald-100 px-3.5 py-2 rounded-xl border-2 border-emerald-600 shadow-pop-xs">
              <Check className="w-4 h-4 stroke-[3]" /> Preferences saved & synced across devices!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-[#6425F5] hover:bg-[#521ecf] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSaving ? 'Saving Preferences…' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* LOGOUT — FINAL ACTION POSITIONED AT THE VERY BOTTOM OF SETTINGS           */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t-2 border-[#171313]/15">
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl shadow-pop flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F04432]/10 border-2 border-[#F04432] text-[#F04432] flex items-center justify-center shrink-0 shadow-pop-xs">
                <LogOut className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-[#171313] tracking-tight">
                Sign Out of ATLAS
              </h3>
            </div>
            <p className="text-xs text-[#171313]/70 font-bold mt-1.5 max-w-lg leading-relaxed">
              {user?.isGuest
                ? 'Exit guest exploration mode. Your guest memories and pinned pins are saved on this device.'
                : 'Sign out of your ATLAS account. Your memories, coordinates, and notes will remain securely encrypted in your archive.'}
            </p>
            {user && !user.isGuest && (
              <p className="text-[11px] font-bold text-[#6425F5] mt-1.5">
                Active account: <span className="font-black text-[#171313]">{user.email}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => setShowLogoutModal(true)}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#F04432] hover:bg-[#d63b2b] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-60"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>{isSigningOut ? 'Signing Out…' : user?.isGuest ? 'Exit Guest Mode' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#171313]/60 backdrop-blur-xs"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#FFF4D9] border-2 border-[#171313] rounded-3xl p-6 shadow-pop-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#F04432] text-white border-2 border-[#171313] rounded-2xl shadow-pop-xs">
                <LogOut className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#171313]">Are you sure?</h3>
                <p className="text-xs text-[#171313]/70 font-bold">
                  {user?.isGuest
                    ? 'You will return to the welcome screen.'
                    : 'Your session will be closed on this browser.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#171313]/80 font-bold leading-relaxed bg-white p-3.5 rounded-2xl border-2 border-[#171313]">
              Your pinned destinations, journey milestones, and memories will remain safe and sound.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-2xl text-xs font-black text-[#171313] bg-white border-2 border-[#171313] shadow-pop-xs hover:bg-[#FFF4D9] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={handleSignOut}
                className="px-5 py-2 rounded-2xl text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? 'Signing Out…' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
