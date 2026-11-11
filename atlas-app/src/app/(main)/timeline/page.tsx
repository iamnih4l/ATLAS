'use client';

import React, { useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import {
  Calendar,
  MapPin,
  Globe2,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function TimelinePage() {
  const {
    experiences,
    setExperienceModalOpen,
    setEditingExperience,
    setFlyToTarget,
  } = useAtlasStore();

  // Group experiences by Year, then Month
  const timelineGroups = useMemo(() => {
    // Sort chronological descending
    const sorted = [...experiences].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: { [year: string]: typeof sorted } = {};
    sorted.forEach((exp) => {
      const year = new Date(exp.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(exp);
    });

    return Object.entries(groups).map(([year, items]) => ({
      year,
      items,
    }));
  }, [experiences]);

  const handleEdit = (exp: any) => {
    setEditingExperience(exp);
    setExperienceModalOpen(true);
  };

  const handleFly = (e: React.MouseEvent, exp: any) => {
    e.stopPropagation();
    if (exp.location) {
      setFlyToTarget({
        latitude: exp.location.latitude,
        longitude: exp.location.longitude,
        altitude: 200,
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c1c22] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f0]">
            Chronological Timeline
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Retrace your life's journeys across time, countries and unforgettable milestones.
          </p>
        </div>

        <Button
          onClick={() => setExperienceModalOpen(true)}
          variant="glow"
          size="md"
        >
          <Plus className="w-4 h-4" />
          <span>Record Memory</span>
        </Button>
      </div>

      {timelineGroups.length === 0 ? (
        <div className="text-center py-16 bg-[#101014] border border-[#1e1e24] rounded-2xl p-8 space-y-3">
          <Clock className="w-10 h-10 text-[#3f3f46] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f5f5f0]">Your timeline is waiting for its first story</h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            Log an experience from this year or past travels to start drawing your timeline.
          </p>
          <Button
            onClick={() => setExperienceModalOpen(true)}
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Add First Memory
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-12 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-500/40 before:to-[#27272a]">
          {timelineGroups.map(({ year, items }) => (
            <div key={year} className="space-y-6 relative">
              {/* Year Marker Badge */}
              <div className="flex items-center gap-3">
                <div className="absolute -left-6 sm:-left-10 w-7 h-7 rounded-full bg-[#09090b] border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400 glow-emerald-subtle">
                  ●
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#14141a] border border-[#27272a]">
                  <span className="text-base font-bold text-[#f5f5f0]">{year}</span>
                  <span className="text-xs text-[#71717a]">
                    • {items.length} {items.length === 1 ? 'memory' : 'memories'}
                  </span>
                </div>
              </div>

              {/* Items for this year */}
              <div className="grid grid-cols-1 gap-4">
                {items.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleEdit(exp)}
                    className="p-4 bg-[#121215] border border-[#23232b] hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col md:flex-row gap-4 justify-between"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex flex-col sm:flex-row gap-4 min-w-0">
                      {exp.cover_image_url && (
                        <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-[#18181f] shrink-0">
                          <img
                            src={exp.cover_image_url}
                            alt={exp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                            {new Date(exp.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          {exp.category && (
                            <Badge variant="default" size="sm">
                              {exp.category.icon} {exp.category.name}
                            </Badge>
                          )}
                          {exp.rating && (
                            <StarRating value={exp.rating} readOnly size="sm" showNumber />
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#f5f5f0] group-hover:text-emerald-300 transition-colors">
                          {exp.title}
                        </h3>

                        {exp.location && (
                          <p className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{exp.location.name}</span>
                            <span className="text-[#52525b]">•</span>
                            <span className="text-[#71717a]">{exp.location.country}</span>
                          </p>
                        )}

                        {exp.description && (
                          <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Globe Fly-To CTA */}
                    <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1c1c22]">
                      <Link
                        href="/globe"
                        onClick={(e) => handleFly(e, exp)}
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-3 py-1.5 rounded-lg bg-[#181820] border border-[#27272a] hover:border-emerald-500/40 transition-all"
                      >
                        <Globe2 className="w-3.5 h-3.5" />
                        <span>Fly on Globe</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
