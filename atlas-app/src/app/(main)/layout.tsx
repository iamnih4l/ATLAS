'use client';

import React, { useEffect } from 'react';
import { CinematicHUD } from '@/components/layout/cinematic-hud';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { PixelCompanion } from '@/components/ui/pixel-companion';
import { ExperienceModal } from '@/components/experiences/experience-modal';
import { WishlistModal } from '@/components/wishlist/wishlist-modal';
import { useAuth } from '@/hooks/use-auth';
import { useDataSync } from '@/hooks/use-data-sync';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initAuth } = useAuth();
  useDataSync();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FFF4D9] text-[#171313] font-sans">
      {/* Cinematic Floating Island HUD Navigation (Desktop/Tablet & Mobile Top Bar) */}
      <CinematicHUD />

      {/* Main Viewport (Edge-to-Edge 100vw x 100vh) */}
      <main className="w-full h-full overflow-hidden relative flex flex-col">
        {children}
      </main>

      {/* Dedicated Touch-First Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Interactive Pixel Character Travel Buddy (Pip) */}
      <PixelCompanion />

      {/* Global Modals */}
      <ExperienceModal />
      <WishlistModal />
    </div>
  );
}
