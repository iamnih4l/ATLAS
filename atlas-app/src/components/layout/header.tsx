'use client';

import React from 'react';
import { Search, Sparkles, Plus, MapPin } from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { ShimmerButton } from '@/components/ui/shimmer-button';
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
    <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-20 shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search places, memories, countries, or adventures…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50/90 border border-slate-200/90 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all font-medium"
        />
      </div>

      {/* Quick Summary Pill & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Stats Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-orange-50/70 border border-orange-200/60 text-xs text-slate-700 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="font-bold text-orange-600">{experiences.length}</span>
            <span className="text-slate-600">Memories</span>
          </div>
          <span className="text-orange-200">•</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-bold text-slate-800">{locations.length}</span>
            <span className="text-slate-600">Places</span>
          </div>
        </div>

        {/* AI Orion Trigger */}
        <Link href="/discover">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/80 hover:bg-violet-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="hidden sm:inline">Ask Orion AI</span>
          </button>
        </Link>

        {/* New Experience CTA with 21st.dev Shimmer Button */}
        <ShimmerButton
          onClick={() => setExperienceModalOpen(true)}
          className="text-xs font-bold py-1.5 px-3.5"
          borderRadius="9999px"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] mr-1" />
          <span className="hidden sm:inline">Add Memory</span>
        </ShimmerButton>
      </div>
    </header>
  );
}
