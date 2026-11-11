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
} from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    setExperienceModalOpen,
    experiences,
    wishlistItems,
  } = useAtlasStore();

  const navItems = [
    {
      name: 'Globe',
      href: '/globe',
      icon: Globe,
      badge: null,
    },
    {
      name: 'Memories',
      href: '/memories',
      icon: BookOpen,
      badge: experiences.length,
    },
    {
      name: 'Timeline',
      href: '/timeline',
      icon: Clock,
      badge: null,
    },
    {
      name: 'Discover',
      href: '/discover',
      icon: Compass,
      badge: 'AI',
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: BookmarkCheck,
      badge: wishlistItems.filter((w) => !w.is_completed).length,
    },
    {
      name: 'Statistics',
      href: '/statistics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        'relative h-full bg-[#0c0c0f] border-r border-[#1c1c22] flex flex-col justify-between transition-all duration-300 ease-in-out z-30 select-none',
        isSidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-[#1c1c22]">
          <Link href="/globe" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/60 transition-all shrink-0">
              <LogoIcon className="w-4 h-4 text-emerald-400" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-[#f5f5f0] uppercase">
                  ATLAS
                </span>
                <span className="text-[10px] text-[#71717a] tracking-tight">
                  Experience Journal
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="text-[#71717a] hover:text-[#f5f5f0] hover:bg-[#1a1a20] p-1.5 rounded-md transition-colors focus:outline-none"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Action: Log Experience */}
        <div className="p-3">
          <Button
            onClick={() => setExperienceModalOpen(true)}
            variant="glow"
            size={isSidebarCollapsed ? 'icon' : 'md'}
            className="w-full justify-center"
            title="Log New Experience"
          >
            <Plus className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Log Experience</span>}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#15151a]'
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-[#71717a] group-hover:text-[#f5f5f0]'
                  )}
                />

                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!isSidebarCollapsed && item.badge !== null && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-[#1e1e24] text-[#a1a1aa]'
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Left Active Glow Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_8px_#10b981]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-3 border-t border-[#1c1c22]">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-[#121215] border border-[#1e1e24]',
            isSidebarCollapsed && 'justify-center p-1.5'
          )}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xs font-bold text-black shrink-0">
            N
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-[#f5f5f0] truncate">
                Private Journal
              </span>
              <span className="text-[10px] text-emerald-400/80 truncate">
                ● Encrypted & Private
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
