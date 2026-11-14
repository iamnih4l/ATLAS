'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Database, Globe, Key, Cloud } from 'lucide-react';
import { Badge } from './badge';

export function SetupBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check client-side configuration
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase');
  const hasCesium = !!process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN && !process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN.includes('your_cesium');

  const integrations = [
    {
      name: 'Supabase Database & Auth',
      description: 'Persistent cloud storage, PostGIS spatial queries, user auth.',
      status: hasSupabase ? 'connected' : 'local_fallback',
      icon: Database,
      note: hasSupabase ? 'Active' : 'Using Local Storage & Demo Mode',
    },
    {
      name: '3D Earth Engine',
      description: 'NASA Blue Marble daylight imagery & realistic dynamic clouds active.',
      status: 'active',
      icon: Globe,
      note: '☀️ 3D Day Mode Active',
    },
    {
      name: 'AI Adventure Buddy (Orion)',
      description: 'Grounded activity recommendation engine and destination intelligence.',
      status: 'active',
      icon: Key,
      note: 'Verified Places & Knowledge Ready',
    },
    {
      name: 'Photo & Media Import',
      description: 'Drag & drop photos with automated EXIF GPS location extraction.',
      status: 'active',
      icon: Cloud,
      note: 'EXIF GPS Extraction Ready',
    },
  ];

  return (
    <div className="border-b border-amber-200/60 bg-amber-50/70 backdrop-blur-sm px-4 py-1.5 text-xs text-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className="text-slate-800 font-bold">ATLAS Journal Ready</span>
          <span className="text-amber-300 hidden sm:inline">•</span>
          <span className="text-slate-600 hidden sm:inline font-medium">
            ☀️ 3D Daylight Earth • Memory Archive • Travel Timeline • Orion AI
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] font-semibold transition-colors focus:outline-none cursor-pointer"
        >
          <span>Environment Status</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pb-1">
          {integrations.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white border border-amber-200/80 rounded-xl p-2.5 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Icon className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    {item.status === 'connected' || item.status === 'active' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Demo Mode
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-medium text-orange-600">
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
