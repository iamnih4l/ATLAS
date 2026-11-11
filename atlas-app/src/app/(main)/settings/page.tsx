'use client';

import React, { useState } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  User,
  Sparkles,
  Download,
  Trash2,
  Cloud,
  Check,
  AlertTriangle,
  MapPin,
  Key,
} from 'lucide-react';

export default function SettingsPage() {
  const { experiences, locations, wishlistItems } = useAtlasStore();

  const [fullName, setFullName] = useState('Atlas Explorer');
  const [email, setEmail] = useState('explorer@atlas.journal');
  const [defaultPrivacy, setDefaultPrivacy] = useState<'private' | 'unlisted' | 'public'>('private');
  const [aiPersonalization, setAiPersonalization] = useState(true);
  const [allowLocation, setAllowLocation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Data Export JSON
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: { fullName, email },
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#1c1c22] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f0]">
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-[#a1a1aa] mt-1">
          Control your encrypted personal archive, AI discovery preferences, and cloud integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Information */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Privacy & Encryption Defaults */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Privacy & Access Controls
            </h3>
            <Badge variant="emerald" size="sm">
              Private By Default
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Default Experience Privacy Level
              </label>
              <select
                value={defaultPrivacy}
                onChange={(e) => setDefaultPrivacy(e.target.value as any)}
                className="w-full bg-[#18181f] border border-[#27272a] rounded-lg px-3.5 py-2 text-sm text-[#f5f5f0] focus:outline-none focus:border-emerald-500/70"
              >
                <option value="private">Private — Accessible strictly to your authenticated session</option>
                <option value="unlisted">Unlisted — Accessible only via secret direct token</option>
                <option value="public">Public — Indexed for public travel profile</option>
              </select>
            </div>

            <label className="flex items-start gap-3 p-3 bg-[#16161c] rounded-xl border border-[#23232b] cursor-pointer">
              <input
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
                className="mt-1 rounded border-[#27272a] bg-[#18181f] text-emerald-500 focus:ring-emerald-500/30"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#f5f5f0] block">
                  Device Precise Location Permissions
                </span>
                <span className="text-[#71717a] text-[11px] mt-0.5 block">
                  Only query device GPS coordinates when explicitly requested for 'Nearby Discoveries'. Never tracked in background.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* AI Orion Personalization */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Orion AI Personalization
          </h3>

          <label className="flex items-start gap-3 p-3 bg-[#16161c] rounded-xl border border-[#23232b] cursor-pointer">
            <input
              type="checkbox"
              checked={aiPersonalization}
              onChange={(e) => setAiPersonalization(e.target.checked)}
              className="mt-1 rounded border-[#27272a] bg-[#18181f] text-emerald-500 focus:ring-emerald-500/30"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#f5f5f0] block">
                Enable Context-Aware Recommendations
              </span>
              <span className="text-[#71717a] text-[11px] mt-0.5 block">
                Allow Orion to analyze past ratings, categories, and wishlist items to curate relevant real-world discoveries.
              </span>
            </div>
          </label>
        </div>

        {/* Cloud & External Services */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            Connected Accounts & Storage
          </h3>

          <div className="p-3 bg-[#16161c] rounded-xl border border-[#23232b] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-emerald-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-[#f5f5f0]">Google Drive Integration</p>
                <p className="text-[11px] text-[#71717a]">
                  Import photos and extract original camera & GPS EXIF metadata
                </p>
              </div>
            </div>
            <Badge variant="outline" size="sm">
              Ready
            </Badge>
          </div>
        </div>

        {/* Data Portability & Export */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Data Portability
          </h3>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Your data belongs to you. Export your entire journal, verified geographical coordinates, timeline records, and bucket list as a structured JSON file.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleExportData}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete Journal (JSON)</span>
          </Button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1c1c22]">
          {isSaved ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> Settings updated successfully
            </span>
          ) : (
            <span />
          )}

          <Button type="submit" variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
