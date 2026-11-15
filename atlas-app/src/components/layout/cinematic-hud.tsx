'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Globe,
  BookOpen,
  Clock,
  Compass,
  BookmarkCheck,
  BarChart3,
  Settings,
  Search,
  Plus,
} from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { SpotlightSearch } from '@/components/layout/spotlight-search';
import { PixelCompass } from '@/components/ui/pixel-stickers';
import { DoodleSparkle } from '@/components/ui/doodles';

export function CinematicHUD() {
  const pathname = usePathname();
  const {
    experiences,
    wishlistItems,
    setExperienceModalOpen,
  } = useAtlasStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('atlas:open-search', handleOpenSearch);
    return () => window.removeEventListener('atlas:open-search', handleOpenSearch);
  }, []);

  const navItems = [
    {
      name: 'Globe',
      href: '/globe',
      icon: Globe,
      badge: null,
      activeColor: 'bg-[#FFD45A] text-[#171313]',
    },
    {
      name: 'Memories',
      href: '/memories',
      icon: BookOpen,
      badge: experiences.length > 0 ? experiences.length : null,
      activeColor: 'bg-[#F04432] text-white',
    },
    {
      name: 'Timeline',
      href: '/timeline',
      icon: Clock,
      badge: null,
      activeColor: 'bg-[#326BEE] text-white',
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Compass,
      badge: 'AI',
      activeColor: 'bg-[#6425F5] text-white',
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: BookmarkCheck,
      badge: wishlistItems.filter((w) => !w.is_completed).length || null,
      activeColor: 'bg-[#10B981] text-white',
    },
    {
      name: 'Stats',
      href: '/statistics',
      icon: BarChart3,
      badge: null,
      activeColor: 'bg-[#326BEE] text-white',
    },
  ];

  return (
    <>
      <nav
        aria-label="ATLAS Bento Pop HUD"
        className="fixed top-4 inset-x-0 mx-auto z-40 max-w-fit pointer-events-auto select-none px-2"
      >
        <div className="relative flex items-center gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/95 backdrop-blur-xl border-2 border-[#171313] shadow-pop transition-all">
          {/* Brand Emblem */}
          <Link
            href="/globe"
            className="flex items-center gap-2 pr-1.5 sm:pr-2.5 group cursor-pointer border-r-2 border-[#171313] mr-0.5 relative"
            title="ATLAS — Return to 3D Earth"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#6425F5] border-2 border-[#171313] flex items-center justify-center text-white shadow-pop-sm group-hover:scale-105 group-hover:rotate-12 transition-all">
                <PixelCompass size={18} />
              </div>
              <DoodleSparkle size={10} color="#FFD45A" className="absolute -top-1 -right-1" />
            </div>
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black tracking-tight text-[#171313] uppercase leading-none font-serif">
                  ATLAS
                </span>
                <span className="text-[10px] text-[#F04432] animate-bounce">★</span>
              </div>
              <span className="text-[8px] font-black text-[#6425F5] tracking-widest uppercase leading-none mt-0.5">
                JOURNAL
              </span>
            </div>
          </Link>

          {/* Navigation Items with Chunky Pop Tabs (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer',
                    isActive
                      ? cn(
                          item.activeColor,
                          'border-2 border-[#171313] shadow-pop-sm scale-105'
                        )
                      : 'text-[#171313]/80 hover:text-[#171313] hover:bg-[#FFF4D9] font-bold'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 stroke-[2.5]',
                      isActive ? 'stroke-[3]' : 'text-[#171313]/70'
                    )}
                  />
                  <span className="hidden sm:inline">{item.name}</span>

                  {/* Badge */}
                  {item.badge !== null && (
                    <span
                      className={cn(
                        'text-[9px] font-black px-1.5 py-0.2 rounded-full border border-[#171313] leading-tight',
                        item.badge === 'AI'
                          ? 'bg-[#FFD45A] text-[#171313]'
                          : 'bg-white text-[#171313]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="h-5 w-px bg-[#171313]/20 mx-0.5 hidden sm:block" />

          {/* Action Buttons: Spotlight Search & Quick Record */}
          <div className="flex items-center gap-1.5">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 rounded-full bg-[#FFF4D9] hover:bg-[#FFD45A] text-[#171313] border-2 border-[#171313] shadow-pop-sm hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 px-2.5"
              title="Search Places & Memories (⌘K)"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px] font-black hidden lg:inline">Search…</span>
              <kbd className="hidden lg:inline-flex text-[9px] font-mono px-1 py-0.2 bg-white rounded border border-[#171313]">
                ⌘K
              </kbd>
            </button>

            {/* Quick Log Experience (Desktop) */}
            <button
              onClick={() => setExperienceModalOpen(true)}
              className="p-1.5 rounded-full bg-[#FFD45A] hover:bg-[#FFC72C] text-[#171313] border-2 border-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer hidden sm:flex items-center gap-1 px-2.5"
              title="Log New Experience"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px] font-black">Record</span>
            </button>

            {/* Settings Link (Direct access on Desktop & Mobile) */}
            <Link
              href="/settings"
              className={cn(
                'p-1.5 rounded-full border-2 border-[#171313] shadow-pop-sm transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center',
                pathname === '/settings'
                  ? 'bg-[#171313] text-white'
                  : 'bg-white hover:bg-[#FFF4D9] text-[#171313]'
              )}
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Spotlight Command Palette Modal */}
      <SpotlightSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
