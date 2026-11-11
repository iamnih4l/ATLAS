'use client';

import React from 'react';
import { useAtlasStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  Layers,
  Compass,
  Filter,
  Eye,
  CheckCircle2,
  BookmarkCheck,
  Search,
  Globe2,
} from 'lucide-react';

export function GlobeControls() {
  const {
    filterType,
    setFilterType,
    selectedCategory,
    setSelectedCategory,
    selectedYear,
    setSelectedYear,
    categories,
    experiences,
    setFlyToTarget,
  } = useAtlasStore();

  // Extract distinct years from experiences
  const years = Array.from(
    new Set(experiences.map((e) => new Date(e.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Quick preset viewpoints
  const quickJump = (target: { lat: number; lng: number; altitude: number }) => {
    setFlyToTarget({
      latitude: target.lat,
      longitude: target.lng,
      altitude: target.altitude,
    });
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm sm:max-w-md">
      {/* Top Filter Bar */}
      <div className="p-2 bg-[#0e0e12]/90 backdrop-blur-md border border-[#27272a] rounded-xl shadow-xl flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterType === 'all'
              ? 'bg-emerald-500 text-black font-semibold shadow-sm'
              : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#18181f]'
          }`}
        >
          All Markers
        </button>

        <button
          onClick={() => setFilterType('experienced')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            filterType === 'experienced'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
              : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#18181f]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 glow-emerald-subtle" />
          Experienced
        </button>

        <button
          onClick={() => setFilterType('wishlist')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            filterType === 'wishlist'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold'
              : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#18181f]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-violet-400 glow-violet-subtle" />
          Wishlist
        </button>

        <div className="h-4 w-px bg-[#27272a] mx-1" />

        {/* Reset Camera */}
        <button
          onClick={() => quickJump({ lat: 20, lng: 10, altitude: 20000000 })}
          className="text-[#71717a] hover:text-[#f5f5f0] hover:bg-[#1c1c24] p-1.5 rounded-lg transition-colors"
          title="Reset Global View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Secondary Dropdowns: Category & Year */}
      <div className="flex items-center gap-2">
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="bg-[#0e0e12]/90 backdrop-blur-md border border-[#27272a] rounded-lg px-2.5 py-1 text-[11px] text-[#f5f5f0] focus:outline-none focus:border-emerald-500/60"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        {years.length > 0 && (
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-[#0e0e12]/90 backdrop-blur-md border border-[#27272a] rounded-lg px-2.5 py-1 text-[11px] text-[#f5f5f0] focus:outline-none focus:border-emerald-500/60"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Quick Landmark Bookmarks */}
      <div className="hidden md:flex items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-medium mr-1">
          Quick Fly:
        </span>
        <button
          onClick={() => quickJump({ lat: 25.0931, lng: 55.1384, altitude: 50000 })}
          className="text-[10px] text-[#a1a1aa] hover:text-emerald-400 hover:bg-[#181820] px-2 py-0.5 rounded border border-[#27272a] transition-all"
        >
          Dubai
        </button>
        <button
          onClick={() => quickJump({ lat: 34.9671, lng: 135.7727, altitude: 60000 })}
          className="text-[10px] text-[#a1a1aa] hover:text-emerald-400 hover:bg-[#181820] px-2 py-0.5 rounded border border-[#27272a] transition-all"
        >
          Kyoto
        </button>
        <button
          onClick={() => quickJump({ lat: 43.0799, lng: -79.0747, altitude: 40000 })}
          className="text-[10px] text-[#a1a1aa] hover:text-emerald-400 hover:bg-[#181820] px-2 py-0.5 rounded border border-[#27272a] transition-all"
        >
          Niagara
        </button>
        <button
          onClick={() => quickJump({ lat: 48.8584, lng: 2.2945, altitude: 50000 })}
          className="text-[10px] text-[#a1a1aa] hover:text-emerald-400 hover:bg-[#181820] px-2 py-0.5 rounded border border-[#27272a] transition-all"
        >
          Paris
        </button>
      </div>
    </div>
  );
}
