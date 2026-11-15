'use client';

import React, { useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { StarRating } from '@/components/ui/star-rating';
import {
  MapPin,
  Globe2,
  Clock,
  Plus,
  Sparkles,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { DoodleSparkle, DoodleUnderline, DoodleFlightLoop } from '@/components/ui/doodles';
import { PixelCampfire, PixelPlane } from '@/components/ui/pixel-stickers';
import { PlayfulCompass, VerifiedStamp, TicketBadge } from '@/components/ui/atlas-illustrations';
import { cn } from '@/lib/utils';

export default function TimelinePage() {
  const {
    experiences,
    setExperienceModalOpen,
    setEditingExperience,
    setFlyToTarget,
  } = useAtlasStore();

  // Group experiences by Year
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
    <div className="flex-1 overflow-y-auto pt-20 sm:pt-28 pb-28 sm:pb-24 px-3.5 sm:px-6 max-w-5xl mx-auto space-y-8 w-full bg-warm-cream-grid min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#171313]/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5 relative">
            <PixelCampfire size={28} />
            <div className="relative">
              <h1 className="text-3xl font-black tracking-tight text-[#171313] font-sans">
                Life Journey Timeline
              </h1>
              <DoodleUnderline className="text-[#FFD45A] mt-0.5" />
            </div>
            <DoodleSparkle size={20} color="#6425F5" />
          </div>
          <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
            Retrace your life&apos;s adventures across years, countries, and unforgettable milestones.
          </p>
        </div>

        <button
          onClick={() => setExperienceModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Memory</span>
        </button>
      </div>

      {timelineGroups.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-[#171313] rounded-3xl p-8 space-y-3 shadow-pop-lg max-w-xl mx-auto my-8 relative overflow-hidden">
          <div className="absolute top-2 left-6 z-10 flex items-center gap-1.5 px-3 py-0.5 rounded-t-lg bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black text-[#171313] uppercase tracking-widest shadow-pop-sm">
            📁 EXPEDITION LOG
          </div>
          <div className="w-16 h-16 rounded-3xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center mx-auto shadow-pop">
            <PixelCampfire size={36} />
          </div>
          <h3 className="text-base font-black text-[#171313]">Your Timeline Begins Here</h3>
          <p className="text-xs text-[#171313]/70 font-bold max-w-sm mx-auto leading-relaxed">
            Every memory you log adds a golden milestone to your chronological life journey across the world.
          </p>
          <button
            onClick={() => setExperienceModalOpen(true)}
            className="mt-3 px-6 py-3 rounded-full text-xs font-black text-white bg-[#6425F5] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add First Timeline Milestone</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-12 space-y-12 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-1 before:border-l-4 before:border-dashed before:border-[#171313]/40">
          {timelineGroups.map(({ year, items }) => (
            <div key={year} className="space-y-6 relative">
              {/* Year Marker Badge */}
              <div className="flex items-center gap-3">
                <div className="absolute -left-6 sm:-left-12 w-9 h-9 rounded-2xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center text-xs font-black text-[#171313] shadow-pop-sm">
                  ★
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#6425F5] text-white border-2 border-[#171313] shadow-pop-sm">
                  <span className="text-lg font-black tracking-tight">{year}</span>
                  <span className="text-xs font-black bg-[#FFD45A] text-[#171313] px-2 py-0.5 rounded-full border border-[#171313]">
                    {items.length} {items.length === 1 ? 'adventure' : 'adventures'}
                  </span>
                </div>
              </div>

              {/* Items for this year */}
              <div className="grid grid-cols-1 gap-5">
                {items.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleEdit(exp)}
                    className="p-5 bg-white border-2 border-[#171313] hover:border-[#6425F5] rounded-3xl cursor-pointer transition-all duration-200 group flex flex-col md:flex-row gap-5 justify-between shadow-pop hover:shadow-pop-lg hover:-translate-y-1"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex flex-col sm:flex-row gap-5 min-w-0">
                      {exp.cover_image_url && (
                        <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-[#171313] border-2 border-[#171313] shrink-0 shadow-pop-sm relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={exp.cover_image_url}
                            alt={exp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            {exp.category && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFD45A] text-[#171313] border border-[#171313] shadow-pop-sm">
                                {exp.category.icon} {exp.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white bg-[#F04432] px-2.5 py-0.5 rounded-full border border-[#171313]">
                            {new Date(exp.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {exp.rating && (
                            <StarRating value={exp.rating} readOnly size="sm" showNumber />
                          )}
                        </div>

                        <h3 className="text-base font-black text-[#171313] group-hover:text-[#6425F5] transition-colors">
                          {exp.title}
                        </h3>

                        {exp.location && (
                          <p className="text-xs text-[#171313]/70 font-black flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                            <span>{exp.location.name}</span>
                            <span className="text-[#171313]/30">•</span>
                            <span>{exp.location.country}</span>
                          </p>
                        )}

                        {exp.description && (
                          <p className="text-xs text-[#171313]/80 font-medium line-clamp-2 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Globe Fly-To CTA */}
                    <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 pt-3 md:pt-0 border-t-2 md:border-t-0 border-[#171313]/10">
                      <Link
                        href="/globe"
                        onClick={(e) => handleFly(e, exp)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#171313] font-black px-3.5 py-1.5 rounded-xl bg-[#FFD45A] border-2 border-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Fly on Earth</span>
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
