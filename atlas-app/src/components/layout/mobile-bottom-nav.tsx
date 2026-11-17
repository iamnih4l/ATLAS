'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  BookOpen,
  BarChart3,
  Menu,
  X,
  Plus,
  Sparkles,
  BookmarkCheck,
  Clock,
  Compass,
  Settings,
  RefreshCw,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { triggerAtlasSync } from '@/hooks/use-data-sync';
import { isDreamingItem } from '@/lib/wishlist-utils';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const { user } = useAuth();

  const {
    experiences,
    wishlistItems,
    adventures,
    setExperienceModalOpen,
    setWishlistModalOpen,
    setEditingExperience,
    setEditingWishlistItem,
  } = useAtlasStore();

  const handleQuickRecord = () => {
    setEditingExperience(null);
    setExperienceModalOpen(true);
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      const ok = await triggerAtlasSync(true);
      setSyncFeedback(ok ? 'All devices synced!' : 'Sign in to sync');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback('Sync failed');
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Count dreaming bucket list items
  const dreamCount = wishlistItems.filter(isDreamingItem).length;
  const plannedCount =
    (adventures?.length || 0) +
    wishlistItems.filter((w) => !w.is_completed && !isDreamingItem(w)).length;

  const mainNavItems = [
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
    // Center (+) rendered separately
    {
      name: 'Stats',
      href: '/statistics',
      icon: BarChart3,
      activeColor: 'bg-[#10B981] text-white',
    },
  ];

  const moreMenuItems = [
    {
      name: 'Dream List',
      href: '/wishlist?tab=bucket_list',
      icon: Sparkles,
      badge: dreamCount > 0 ? `${dreamCount} Dream` : null,
      badgeColor: 'bg-[#6425F5] text-white',
      description: 'Aspirations & Bucket list destinations',
      color: 'text-[#6425F5]',
    },
    {
      name: 'Adventures',
      href: '/wishlist?tab=adventures',
      icon: BookmarkCheck,
      badge: plannedCount > 0 ? `${plannedCount}` : null,
      badgeColor: 'bg-[#10B981] text-white',
      description: 'Planned itineraries & upcoming journeys',
      color: 'text-[#10B981]',
    },
    {
      name: 'Timeline',
      href: '/timeline',
      icon: Clock,
      badge: null,
      description: 'Chronological travel memories log',
      color: 'text-amber-500',
    },
    {
      name: 'Ask Orion AI',
      href: '/discover',
      icon: Compass,
      badge: 'AI',
      badgeColor: 'bg-[#FFD45A] text-[#171313]',
      description: 'AI travel companion & destination intelligence',
      color: 'text-violet-500',
    },
    {
      name: 'Settings & Cloud',
      href: '/settings',
      icon: Settings,
      badge: null,
      description: 'Account preferences, export & backups',
      color: 'text-slate-500',
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-xl border-t-2 border-[#171313] shadow-pop-lg pb-[env(safe-area-inset-bottom,8px)] px-3 pt-1.5"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative h-14">
          {/* Item 1: Globe */}
          <MobileNavItem item={mainNavItems[0]} currentPath={pathname} />

          {/* Item 2: Memories */}
          <MobileNavItem item={mainNavItems[1]} currentPath={pathname} />

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

          {/* Item 3: Statistics */}
          <MobileNavItem item={mainNavItems[2]} currentPath={pathname} />

          {/* Item 4: More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-2xl transition-all cursor-pointer relative',
              isMoreOpen ? 'scale-105' : 'text-[#171313]/70 hover:text-[#171313]'
            )}
            aria-label="Open More ATLAS Sections"
          >
            <div
              className={cn(
                'p-1.5 rounded-xl border-2 transition-all flex items-center justify-center',
                isMoreOpen
                  ? 'bg-[#6425F5] text-white border-[#171313] shadow-pop-xs'
                  : 'border-transparent text-[#171313]'
              )}
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] tracking-tight leading-none mt-0.5 font-bold text-[#171313]/70">
              More
            </span>
            {dreamCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-[#6425F5] border border-[#171313]" />
            )}
          </button>
        </div>
      </nav>

      {/* Slide-Up Mobile Navigation Sheet / Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#171313]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto bg-[#FFF4D9] border-t-4 border-[#171313] rounded-t-3xl shadow-pop-lg p-5 pb-10 flex flex-col gap-4 animate-in slide-in-from-bottom duration-250">
            {/* Top Drag Pill */}
            <div className="w-12 h-1.5 bg-[#171313]/30 rounded-full mx-auto" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#171313]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧭</span>
                <div>
                  <h3 className="text-base font-black text-[#171313] tracking-tight">
                    ATLAS Navigation
                  </h3>
                  <p className="text-[11px] font-bold text-[#171313]/70">
                    Full feature access across all devices
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-white border-2 border-[#171313] text-[#171313] shadow-pop-xs flex items-center justify-center hover:bg-[#FFD45A] transition-all cursor-pointer"
                aria-label="Close Navigation Drawer"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Quick Record Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  setEditingExperience(null);
                  setExperienceModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#F04432] text-white border-2 border-[#171313] shadow-pop-sm font-black text-xs hover:bg-[#d83524] active:scale-98 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 stroke-[2.5]" />
                <span>+ Log Memory</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  setEditingWishlistItem(null);
                  setWishlistModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#FFD45A] text-[#171313] border-2 border-[#171313] shadow-pop-sm font-black text-xs hover:bg-[#ffcd38] active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>+ Dream / Wishlist</span>
              </button>
            </div>

            {/* Menu Sections Grid */}
            <div className="flex flex-col gap-2">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href.split('?')[0]);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl border-2 border-[#171313] shadow-pop-xs bg-white hover:bg-[#FFD45A]/20 transition-all cursor-pointer group',
                      isActive ? 'bg-[#FFD45A]/30 border-[#171313]' : ''
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl border-2 border-[#171313] flex items-center justify-center shadow-pop-2xs shrink-0',
                          item.color,
                          'bg-white group-hover:scale-105 transition-transform'
                        )}
                      >
                        <Icon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#171313]">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                'text-[9px] font-black px-1.5 py-0.2 rounded-full border border-[#171313]',
                                item.badgeColor || 'bg-[#171313] text-white'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-[#171313]/70">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#171313]/60 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Cross-Device Synchronisation Status Card */}
            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#171313] shadow-pop-xs flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-[#171313]" />
                  <span className="text-xs font-black text-[#171313]">
                    {user && !user.isGuest ? 'Cloud Account Linked' : 'Local Device Mode'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isManualSyncing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF4D9] hover:bg-[#FFD45A] border-2 border-[#171313] text-[11px] font-black text-[#171313] shadow-pop-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={cn('w-3 h-3 stroke-[2.5]', isManualSyncing && 'animate-spin')}
                  />
                  <span>{isManualSyncing ? 'Syncing…' : 'Sync Now'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-[#171313]/70">
                <span>
                  {user?.email || 'Logged in locally — sign in to sync with laptop'}
                </span>
                {syncFeedback && (
                  <span className="flex items-center gap-1 text-emerald-600 font-black">
                    <CheckCircle2 className="w-3 h-3" />
                    {syncFeedback}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
