'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  BookOpen,
  Compass,
  BookmarkCheck,
  Plus,
} from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const {
    experiences,
    wishlistItems,
    adventures,
    setExperienceModalOpen,
    setEditingExperience,
  } = useAtlasStore();

  const handleQuickRecord = () => {
    setEditingExperience(null);
    setExperienceModalOpen(true);
  };

  const navItems = [
    {
      name: 'Globe',
      href: '/globe',
      icon: Globe,
      activeColor: 'bg-[#FFD45A] text-[#171313]',
    },
    {
      name: 'Memories',
      href: '/memories',
      icon: BookOpen,
      badge: experiences.length > 0 ? experiences.length : null,
      activeColor: 'bg-[#F04432] text-white',
    },
    // Center Pop Action is rendered separately
    {
      name: 'Discover',
      href: '/discover',
      icon: Compass,
      badge: 'AI',
      activeColor: 'bg-[#6425F5] text-white',
    },
    {
      name: 'Adventures',
      href: '/wishlist',
      icon: BookmarkCheck,
      badge:
        (adventures?.length || 0) + wishlistItems.filter((w) => !w.is_completed).length || null,
      activeColor: 'bg-[#10B981] text-white',
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-xl border-t-2 border-[#171313] shadow-pop-lg pb-[env(safe-area-inset-bottom,8px)] px-3 pt-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative h-14">
        {/* Item 1: Globe */}
        <MobileNavItem item={navItems[0]} currentPath={pathname} />

        {/* Item 2: Memories */}
        <MobileNavItem item={navItems[1]} currentPath={pathname} />

        {/* Center Prominent Record Button (+) */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            type="button"
            onClick={handleQuickRecord}
            className="w-12 h-12 rounded-full bg-[#FFD45A] hover:bg-[#ffcd38] border-2 border-[#171313] text-[#171313] shadow-pop flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            aria-label="Record New Travel Experience"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[9px] font-black text-[#171313] uppercase tracking-wider mt-0.5">
            Record
          </span>
        </div>

        {/* Item 3: Discover */}
        <MobileNavItem item={navItems[2]} currentPath={pathname} />

        {/* Item 4: Wishlist */}
        <MobileNavItem item={navItems[3]} currentPath={pathname} />
      </div>
    </nav>
  );
}

function MobileNavItem({
  item,
  currentPath,
}: {
  item: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string | null;
    activeColor: string;
  };
  currentPath: string;
}) {
  const isActive = currentPath === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-2xl transition-all cursor-pointer relative',
        isActive ? 'scale-105' : 'text-[#171313]/70 hover:text-[#171313]'
      )}
    >
      <div
        className={cn(
          'p-1.5 rounded-xl border-2 transition-all flex items-center justify-center',
          isActive
            ? cn(item.activeColor, 'border-[#171313] shadow-pop-xs')
            : 'border-transparent'
        )}
      >
        <Icon className={cn('w-4 h-4', isActive ? 'stroke-[3]' : 'stroke-[2.5]')} />
      </div>

      <span
        className={cn(
          'text-[10px] tracking-tight leading-none mt-0.5',
          isActive ? 'font-black text-[#171313]' : 'font-bold text-[#171313]/70'
        )}
      >
        {item.name}
      </span>

      {/* Badge */}
      {item.badge !== undefined && item.badge !== null && (
        <span
          className={cn(
            'absolute -top-1 right-2 text-[8px] font-black px-1 rounded-full border border-[#171313]',
            item.badge === 'AI' ? 'bg-[#FFD45A] text-[#171313]' : 'bg-[#F04432] text-white'
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
