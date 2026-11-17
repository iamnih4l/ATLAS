'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAtlasStore } from '@/lib/store';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import {
  Globe2,
  Sparkles,
  Plus,
} from 'lucide-react';

const POP_COLORS = [
  'bg-[#FFD45A] hover:bg-[#FFD45A]/90 text-[#171313]',
  'bg-[#6425F5] hover:bg-[#6425F5]/90 text-white',
  'bg-[#F04432] hover:bg-[#F04432]/90 text-white',
  'bg-[#326BEE] hover:bg-[#326BEE]/90 text-white',
  'bg-emerald-400 hover:bg-emerald-500 text-[#171313]',
];

export function GlobeDock() {
  const router = useRouter();
  const { locations, setFlyToTarget, setSelectedLocation, setExperienceModalOpen } = useAtlasStore();

  const flyToLocation = (loc: any) => {
    setFlyToTarget({ latitude: loc.latitude, longitude: loc.longitude, altitude: 205 });
    setSelectedLocation(loc);
  };

  const resetView = () => {
    setFlyToTarget({ latitude: 20, longitude: 10, altitude: 290 });
    setSelectedLocation(null);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none flex max-w-[95vw] overflow-x-auto no-scrollbar">
      <Dock
        disableMagnification
        className="items-center border-2 border-[#171313] shadow-pop-lg bg-[#FFF4D9]/95 backdrop-blur-xl rounded-3xl p-1.5"
      >
        {/* Reset Global Orbit */}
        <DockItem
          onClick={resetView}
          className="aspect-square rounded-2xl bg-[#326BEE] hover:bg-[#326BEE]/90 text-white border-2 border-[#171313] shadow-pop-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <DockLabel className="border-2 border-[#171313] shadow-pop-sm bg-[#FFD45A] font-black text-[#171313]">
            Global Orbit View
          </DockLabel>
          <DockIcon>
            <Globe2 className="w-5 h-5 text-white stroke-[2.5]" />
          </DockIcon>
        </DockItem>

        {/* User's Actual Real Logged Locations (up to 5, zero mock locations) */}
        {locations.slice(0, 5).map((loc, idx) => (
          <DockItem
            key={loc.id}
            onClick={() => flyToLocation(loc)}
            className={`aspect-square rounded-2xl ${
              POP_COLORS[idx % POP_COLORS.length]
            } border-2 border-[#171313] shadow-pop-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer`}
          >
            <DockLabel className="border-2 border-[#171313] shadow-pop-sm bg-white font-black text-[#171313]">
              {loc.name}
            </DockLabel>
            <DockIcon>
              <span className="text-sm font-black uppercase">
                {loc.city ? loc.city.slice(0, 2) : '📍'}
              </span>
            </DockIcon>
          </DockItem>
        ))}

        {/* Ask Orion AI */}
        <DockItem
          onClick={() => router.push('/discover')}
          className="aspect-square rounded-2xl bg-[#6425F5] hover:bg-[#6425F5]/90 text-white border-2 border-[#171313] shadow-pop-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <DockLabel className="border-2 border-[#171313] shadow-pop-sm bg-[#FFD45A] font-black text-[#171313]">
            Ask Orion AI
          </DockLabel>
          <DockIcon>
            <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
          </DockIcon>
        </DockItem>

        {/* Record New Memory */}
        <DockItem
          onClick={() => setExperienceModalOpen(true)}
          className="aspect-square rounded-2xl bg-[#F04432] hover:bg-[#F04432]/90 text-white border-2 border-[#171313] shadow-pop-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <DockLabel className="border-2 border-[#171313] shadow-pop-sm bg-[#FFD45A] font-black text-[#171313]">
            + Log New Memory
          </DockLabel>
          <DockIcon>
            <Plus className="w-5 h-5 text-white stroke-[3]" />
          </DockIcon>
        </DockItem>
      </Dock>
    </div>
  );
}
