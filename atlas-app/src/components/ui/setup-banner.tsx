'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Database, Globe, Key, Cloud } from 'lucide-react';
import { Badge } from './badge';

export function SetupBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check client-side configuration
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase');
  const hasCesium = !!process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN && !process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN.includes('your_cesium');

  const integrations = [
    {
      name: 'Supabase PostgreSQL & Auth',
      description: 'Persistent cloud storage, PostGIS spatial queries, user auth.',
      status: hasSupabase ? 'connected' : 'local_fallback',
      icon: Database,
      note: hasSupabase ? 'Active' : 'Using Local In-Memory & Demo Mode',
    },
    {
      name: '3D Earth Engine',
      description: 'CartoDB Dark Matter / OpenStreetMap tiles active. Cesium Ion optional.',
      status: 'active',
      icon: Globe,
      note: hasCesium ? 'Cesium Ion Enabled' : 'Dark Matter Tiles (Offline/Free Active)',
    },
    {
      name: 'AI Experience Companion (Orion)',
      description: 'Grounded activity recommendation engine and destination intelligence.',
      status: 'active',
      icon: Key,
      note: 'Verified Places & Knowledge Engine Ready',
    },
    {
      name: 'Google Drive Import',
      description: 'Import photos directly from Google Drive with EXIF GPS analysis.',
      status: 'optional',
      icon: Cloud,
      note: 'Manual Upload Always Active; Drive OAuth Optional',
    },
  ];

  return (
    <div className="border-b border-[#1c1c22] bg-[#0c0c0f]/90 backdrop-blur-sm px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[#f5f5f0] font-medium">ATLAS System Status</span>
          <span className="text-[#71717a] hidden sm:inline">•</span>
          <span className="text-[#a1a1aa] hidden sm:inline">
            3D Globe, Experience Journal, Timeline, & Orion AI ready
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#a1a1aa] hover:text-[#f5f5f0] flex items-center gap-1 font-mono text-[11px] transition-colors focus:outline-none"
        >
          <span>Environment Status</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-[#1c1c22] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pb-1">
          {integrations.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-[#121215] border border-[#27272a] rounded-lg p-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-[#f5f5f0]">
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.name}</span>
                    </div>
                    {item.status === 'connected' || item.status === 'active' ? (
                      <Badge variant="emerald" size="sm">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                      </Badge>
                    ) : item.status === 'local_fallback' ? (
                      <Badge variant="amber" size="sm">
                        Demo Mode
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-[#71717a] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-[#a1a1aa]">
                  {item.note}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
