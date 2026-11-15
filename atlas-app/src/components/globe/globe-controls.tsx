'use client';

import React from 'react';
import { useAtlasStore } from '@/lib/store';
import { RotateCcw, Tag, Calendar, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    setSelectedLocation,
  } = useAtlasStore();

  // Extract distinct years from experiences
  const years = Array.from(
    new Set(experiences.map((e) => new Date(e.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Quick preset viewpoints
  const resetCamera = () => {
    setFlyToTarget({
      latitude: 20,
      longitude: 10,
      altitude: 290,
    });
  };

  return (
    <div className="absolute top-16 left-3 sm:top-20 sm:left-6 z-30 flex flex-col gap-2 pointer-events-auto select-none max-w-[calc(100vw-1.5rem)] sm:max-w-md">
      {/* Primary Filter Pill Strip */}
      <div className="p-1.5 bg-[#FFF4D9]/95 backdrop-blur-xl border-2 border-[#171313] rounded-full shadow-pop flex items-center gap-1.5">
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer',
            filterType === 'all'
              ? 'bg-[#171313] text-white shadow-pop-sm scale-105'
              : 'text-[#171313]/80 hover:text-[#171313] hover:bg-[#FFD45A]/50'
          )}
        >
          All
        </button>

        <button
          onClick={() => setFilterType('experienced')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border-2',
            filterType === 'experienced'
              ? 'bg-[#F04432] text-white border-[#171313] shadow-pop-sm scale-105'
              : 'border-transparent text-[#171313]/80 hover:text-[#171313] hover:bg-[#F04432]/20'
          )}
        >
          <span className="w-2 h-2 rounded-full bg-white border border-[#171313]" />
          Memories
        </button>

        <button
          onClick={() => setFilterType('wishlist')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border-2',
            filterType === 'wishlist'
              ? 'bg-[#FFD45A] text-[#171313] border-[#171313] shadow-pop-sm scale-105'
              : 'border-transparent text-[#171313]/80 hover:text-[#171313] hover:bg-[#FFD45A]/40'
          )}
        >
          <span className="w-2 h-2 rounded-full bg-[#171313] border border-white" />
          Wishlist
        </button>

        <div className="h-4 w-0.5 bg-[#171313]/20 mx-0.5" />

        {/* Reset Camera Button */}
        <button
          onClick={resetCamera}
          className="text-[#171313] hover:bg-[#FFD45A] p-1.5 rounded-full border-2 border-transparent hover:border-[#171313] transition-all cursor-pointer"
          title="Reset Earth View"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Secondary Capsules: Category & Year Filters */}
      <div className="flex items-center gap-2">
        {/* Category Pill Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="appearance-none bg-white border-2 border-[#171313] rounded-full pl-7 pr-7 py-1.5 text-xs text-[#171313] font-black shadow-pop-sm focus:outline-none transition-all cursor-pointer hover:bg-[#FFD45A]/30"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <Tag className="w-3.5 h-3.5 text-[#6425F5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          <span className="text-[10px] text-[#171313] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none font-black">
            ▼
          </span>
        </div>

        {/* Year Pill Dropdown (if multiple years exist) */}
        {years.length > 0 && (
          <div className="relative">
            <select
              value={selectedYear || ''}
              onChange={(e) =>
                setSelectedYear(e.target.value ? parseInt(e.target.value) : null)
              }
              className="appearance-none bg-white border-2 border-[#171313] rounded-full pl-7 pr-7 py-1.5 text-xs text-[#171313] font-black shadow-pop-sm focus:outline-none transition-all cursor-pointer hover:bg-[#FFD45A]/30"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-[#F04432] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            <span className="text-[10px] text-[#171313] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none font-black">
              ▼
            </span>
          </div>
        )}
      </div>

      {/* Floating On-Screen Navigation & Zoom Controls (Mobile-First >=44px touch targets) */}
      <div className="fixed right-3 sm:right-6 bottom-24 sm:bottom-6 z-30 flex flex-col items-center gap-2 pointer-events-auto select-none">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('atlas:globe-zoom', { detail: { delta: -45 } }))}
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-[#FFD45A] active:scale-95 border-2 border-[#171313] shadow-pop flex items-center justify-center text-[#171313] transition-all cursor-pointer"
          title="Zoom In (+)"
          aria-label="Zoom In to Earth"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('atlas:globe-zoom', { detail: { delta: 45 } }))}
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-[#FFD45A] active:scale-95 border-2 border-[#171313] shadow-pop flex items-center justify-center text-[#171313] transition-all cursor-pointer"
          title="Zoom Out (-)"
          aria-label="Zoom Out of Earth"
        >
          <Minus className="w-5 h-5 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('atlas:globe-reset'));
            setSelectedLocation(null);
          }}
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-2xl bg-[#FFD45A] hover:bg-[#ffcd38] active:scale-95 border-2 border-[#171313] shadow-pop flex items-center justify-center text-[#171313] transition-all cursor-pointer mt-1"
          title="Reset Orbit View"
          aria-label="Reset 3D Earth Orientation"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
