'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SetupBanner } from '@/components/ui/setup-banner';
import { ExperienceModal } from '@/components/experiences/experience-modal';
import { WishlistModal } from '@/components/wishlist/wishlist-modal';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-[#f5f5f0]">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Setup Banner (Status indicators for external services) */}
        <SetupBanner />

        {/* Top Header */}
        <Header />

        {/* Active Page View */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>

      {/* Global Experience Creation & Edit Modal */}
      <ExperienceModal />

      {/* Global Wishlist Modal */}
      <WishlistModal />
    </div>
  );
}
