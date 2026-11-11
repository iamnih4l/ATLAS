'use client';

import React from 'react';
import { Search, Sparkles, Plus, MapPin } from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    setExperienceModalOpen,
    experiences,
    locations,
  } = useAtlasStore();

  return (
    <header className="h-14 border-b border-[#1c1c22] bg-[#0c0c0f]/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-20">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search places, memories, countries, or activities…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121215] border border-[#27272a] rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-[#f5f5f0] placeholder-[#52525b] focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Quick Summary Pill & Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Stats Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-full bg-[#141418] border border-[#27272a] text-[11px] text-[#a1a1aa]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-[#f5f5f0]">{experiences.length}</span>
            <span>Memories</span>
          </div>
          <span className="text-[#3f3f46]">•</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold text-[#f5f5f0]">{locations.length}</span>
            <span>Locations</span>
          </div>
        </div>

        {/* AI Orion Trigger */}
        <Link href="/discover">
          <Button
            variant="secondary"
            size="sm"
            className="border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ask Orion AI</span>
          </Button>
        </Link>

        {/* New Experience CTA */}
        <Button
          onClick={() => setExperienceModalOpen(true)}
          variant="primary"
          size="sm"
          className="font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Memory</span>
        </Button>
      </div>
    </header>
  );
}
