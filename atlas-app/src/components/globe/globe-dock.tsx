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

export function GlobeDock() {
  const router = useRouter();
  const { setFlyToTarget, setSelectedLocation, setExperienceModalOpen } = useAtlasStore();

  const resetView = () => {
    setFlyToTarget({ latitude: 20, longitude: 10, altitude: 290 });
    setSelectedLocation(null);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none flex max-w-[95vw]">
      <Dock
        disableMagnification
        className="items-center border-2 border-[#171313] shadow-pop-lg bg-[#FFF4D9]/95 backdrop-blur-xl rounded-3xl p-1.5"
      >
        {/* 1. Reset Global Orbit */}
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

        {/* 2. Ask Orion AI */}
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

        {/* 3. Record New Memory */}
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
