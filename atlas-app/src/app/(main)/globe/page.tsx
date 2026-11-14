'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GlobeControls } from '@/components/globe/globe-controls';
import { LocationDetailPanel } from '@/components/globe/location-detail-panel';
import { GlobeDock } from '@/components/globe/globe-dock';
import { LoadingSpinner } from '@/components/ui/loading';

// Dynamically import InteractiveGlobe with SSR disabled
const InteractiveGlobe = dynamic(
  () => import('@/components/globe/interactive-globe'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdf4dc] text-slate-500 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wider uppercase text-orange-600">
          ☀️ Initializing 3D Daylight Earth…
        </p>
      </div>
    ),
  }
);

export default function GlobePage() {
  return (
    <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden bg-[#fdf4dc]">
      {/* 3D Earth Globe Canvas in Daylight */}
      <InteractiveGlobe />

      {/* Floating Controls & Filters */}
      <GlobeControls />

      {/* 21st.dev Magnification Dock Toolbar */}
      <GlobeDock />

      {/* Contextual Location Side Drawer */}
      <LocationDetailPanel />
    </div>
  );
}
