'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GlobeControls } from '@/components/globe/globe-controls';
import { LocationDetailPanel } from '@/components/globe/location-detail-panel';
import { LoadingSpinner } from '@/components/ui/loading';

// Dynamically import InteractiveGlobe with SSR disabled
const InteractiveGlobe = dynamic(
  () => import('@/components/globe/interactive-globe'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#09090b] text-[#a1a1aa] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-mono tracking-widest uppercase text-emerald-400">
          Initializing 3D Earth Engine…
        </p>
      </div>
    ),
  }
);

export default function GlobePage() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#09090b]">
      {/* 3D Earth Globe Canvas */}
      <InteractiveGlobe />

      {/* Floating Controls & Filters */}
      <GlobeControls />

      {/* Contextual Location Side Drawer */}
      <LocationDetailPanel />
    </div>
  );
}
