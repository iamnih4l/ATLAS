'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  BookOpen,
  Clock,
  Compass,
  BookmarkCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass as LogoIcon,
  Sparkles,
} from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';

export function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    setExperienceModalOpen,
    experiences,
    wishlistItems,
    adventures,
  } = useAtlasStore();

  const navItems = [
    {
      name: 'Globe',
      href: '/globe',
      icon: Globe,
      badge: null,
      color: 'text-sky-500',
    },
    {
      name: 'Memories',
      href: '/memories',
      icon: BookOpen,
      badge: experiences.length,
      color: 'text-orange-500',
    },
    {
      name: 'Timeline',
      href: '/timeline',
      icon: Clock,
      badge: null,
      color: 'text-amber-500',
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Compass,
      badge: 'AI',
      color: 'text-violet-500',
    },
    {
      name: 'Adventures',
      href: '/wishlist',
      icon: BookmarkCheck,
      badge: (adventures?.length || 0) + wishlistItems.filter((w) => !w.is_completed).length || null,
      color: 'text-rose-500',
    },
    {
      name: 'Statistics',
      href: '/statistics',
      icon: BarChart3,
      badge: null,
      color: 'text-emerald-500',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
      color: 'text-slate-500',
    },
  ];

  return (
    <aside
      className={cn(
        'relative h-full bg-white/95 border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 ease-in-out z-30 select-none shadow-sm',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Link href="/globe" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
              <LogoIcon className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                  ATLAS
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                  Life & Experience Journal
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-colors focus:outline-none cursor-pointer"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Action: Log Experience with 21st.dev Shimmer Button */}
        <div className="p-3">
          <ShimmerButton
            onClick={() => setExperienceModalOpen(true)}
            className="w-full justify-center text-xs font-bold py-2.5 px-3"
            borderRadius="12px"
            title="Log New Experience"
          >
            <Plus className="w-4 h-4 stroke-[2.5] mr-1.5" />
            {!isSidebarCollapsed && <span>Log Memory</span>}
          </ShimmerButton>
        </div>

        {/* Navigation Items */}
        <nav className="px-2.5 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-orange-50/80 text-orange-600 font-semibold shadow-xs border border-orange-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? item.color : 'text-slate-400 group-hover:text-slate-700'
                  )}
                />

                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!isSidebarCollapsed && item.badge !== null && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-orange-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-3 border-t border-slate-100">
        <div
          className={cn(
            'flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs',
            isSidebarCollapsed && 'justify-center p-2'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
            N
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-800 truncate">
                Nihal&apos;s Journal
              </span>
              <span className="text-[10px] text-orange-600 font-medium truncate flex items-center gap-1">
                <span>✨</span>
                <span>{experiences.length} adventures recorded</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
