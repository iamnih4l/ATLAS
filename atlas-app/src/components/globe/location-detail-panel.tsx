'use client';

import React from 'react';
import { useAtlasStore } from '@/lib/store';
import { StarRating } from '@/components/ui/star-rating';
import {
  X,
  MapPin,
  Calendar,
  Plus,
  BookmarkCheck,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { WashiTape, PassportStamp } from '@/components/ui/doodles';
import { PixelCamera } from '@/components/ui/pixel-stickers';

export function LocationDetailPanel() {
  const {
    selectedLocation,
    setSelectedLocation,
    experiences,
    wishlistItems,
    setEditingExperience,
    setEditingWishlistItem,
  } = useAtlasStore();

  if (!selectedLocation) return null;

  const locationExperiences = experiences.filter(
    (exp) => exp.location_id === selectedLocation.id
  );

  const locationWishlist = wishlistItems.filter(
    (w) =>
      (w.location_id === selectedLocation.id || w.location?.id === selectedLocation.id) &&
      !w.is_completed
  );

  const primaryPhoto = locationExperiences.find(
    (e) => e.cover_image_url || e.media?.[0]?.file_url
  );
  const heroImage =
    primaryPhoto?.cover_image_url ||
    primaryPhoto?.media?.[0]?.file_url ||
    locationWishlist[0]?.reference_image_url ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

  const handleOpenExperience = (exp: any) => {
    setEditingExperience(exp);
    useAtlasStore.setState({ isExperienceModalOpen: true });
  };

  const handleOpenWishlist = (item: any) => {
    setEditingWishlistItem(item);
    useAtlasStore.setState({ isWishlistModalOpen: true });
  };

  const handleAddExperienceHere = () => {
    setEditingExperience(null);
    useAtlasStore.setState({
      convertingWishlistToExperience: null,
      isExperienceModalOpen: true,
    });
  };

  return (
    <aside
      aria-label="Tactile Folder Location Panel"
      className="fixed top-20 right-6 bottom-24 w-[380px] max-w-[calc(100vw-3rem)] z-40 flex flex-col pointer-events-auto select-none animate-in fade-in slide-in-from-right-4 duration-300"
    >
      {/* Mellow / Saved Style File Folder Top Tab */}
      <div className="flex items-end justify-between px-2">
        <div className="px-4 py-1.5 bg-[#FFD45A] border-2 border-[#171313] border-b-0 rounded-t-2xl font-black text-xs text-[#171313] inline-flex items-center gap-1.5 shadow-pop-sm">
          <FolderOpen className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="truncate max-w-[200px]">{selectedLocation.name}</span>
        </div>
        <button
          onClick={() => setSelectedLocation(null)}
          className="p-1.5 rounded-full bg-white border-2 border-[#171313] shadow-pop-sm hover:bg-[#FFF4D9] transition-all cursor-pointer mb-1 active:translate-x-0.5 active:translate-y-0.5"
          title="Close Folder"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5] text-[#171313]" />
        </button>
      </div>

      {/* Main Folder Envelope Body */}
      <div className="flex-1 bg-[#FFF4D9] border-2 border-[#171313] shadow-pop-lg rounded-3xl rounded-tl-none flex flex-col overflow-hidden">
        {/* Hero Visual Polaroid Frame (if photo exists) */}
        {heroImage ? (
          <div className="p-3 pb-0">
            <div className="relative h-44 w-full bg-[#171313] rounded-2xl overflow-hidden border-2 border-[#171313] shadow-pop-sm">
              {/* Washi Tape Strip */}
              <WashiTape className="absolute -top-1 left-6 z-20" rotate="-3deg" color="bg-[#FFD45A]" />

              {/* Rubber Passport Stamp */}
              <div className="absolute top-2 right-4 pointer-events-none z-20">
                <PassportStamp
                  label="VERIFIED"
                  sublabel="ATLAS"
                  rotate="-8deg"
                  className="scale-75 origin-top-right bg-white/95 border-2 border-[#F04432] text-[#F04432] shadow-pop-sm"
                />
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={selectedLocation.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171313]/90 via-[#171313]/25 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F04432] text-white border border-[#171313] mb-1 shadow-xs">
                  <MapPin className="w-2.5 h-2.5" /> Landmark
                </span>
                <h2 className="text-base font-black text-white leading-tight drop-shadow-sm truncate font-serif">
                  {selectedLocation.name}
                </h2>
                <p className="text-xs text-white/90 truncate mt-0.5 font-bold">
                  {[selectedLocation.venue, selectedLocation.city, selectedLocation.country]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Minimalist Header with Washi Tape */
          <div className="relative p-4 border-b-2 border-[#171313] bg-[#FFD45A]/30">
            <WashiTape className="absolute -top-1 left-8 z-10" rotate="2deg" color="bg-[#FFD45A]" />
            <div className="pr-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F04432] text-white border-2 border-[#171313] mb-1.5 shadow-pop-sm">
                <MapPin className="w-3 h-3 text-white stroke-[2.5]" /> Geographic Pin
              </div>
              <h2 className="text-base font-black text-[#171313] leading-snug font-serif">
                {selectedLocation.name}
              </h2>
              <p className="text-xs text-[#171313]/70 mt-0.5 font-bold">
                {[selectedLocation.venue, selectedLocation.city, selectedLocation.country]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
          </div>
        )}

        {/* Lat / Long Coordinate Pill Strip */}
        <div className="px-4 py-2 bg-white border-b-2 border-[#171313] flex items-center justify-between text-[11px] font-mono text-[#171313] font-bold">
          <span>
            {selectedLocation.latitude.toFixed(4)}° N, {selectedLocation.longitude.toFixed(4)}° E
          </span>
          <span className="text-[10px] font-sans font-black text-white bg-[#6425F5] border border-[#171313] px-2 py-0.5 rounded-full shadow-2xs">
            {locationExperiences.length} {locationExperiences.length === 1 ? 'memory' : 'memories'}
          </span>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Completed Experiences List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <PixelCamera size={18} />
                Memories Logged
              </span>
            </div>

            {locationExperiences.length === 0 ? (
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-600 font-bold">
                  No memories logged here yet!
                </p>
                <button
                  onClick={handleAddExperienceHere}
                  className="mt-2 text-xs font-black text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Log First Memory Here
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {locationExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleOpenExperience(exp)}
                    className="relative p-3.5 bg-white rounded-2xl border-2 border-slate-900 shadow-pop-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {exp.title}
                      </h3>
                      {exp.rating && <StarRating value={exp.rating} readOnly size="sm" />}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold mt-1">
                      <Calendar className="w-3 h-3 text-orange-500 stroke-[2.5]" />
                      <span>{exp.date}</span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-700 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                        {exp.description}
                      </p>
                    )}

                    {/* Photos Preview Row */}
                    {exp.media && exp.media.length > 0 && (
                      <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                        {exp.media.slice(0, 3).map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border-2 border-slate-900 shadow-2xs"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.file_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end mt-2 pt-1.5 border-t border-slate-100 text-[11px] font-black text-orange-600 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Memory Journal</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Ideas at this Location */}
          {locationWishlist.length > 0 && (
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                Bucket List at This Location ({locationWishlist.length})
              </span>
              <div className="space-y-2">
                {locationWishlist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenWishlist(item)}
                    className="p-3 bg-amber-100/70 hover:bg-amber-100 rounded-2xl border-2 border-slate-900 shadow-pop-sm transition-all cursor-pointer group"
                  >
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-800">
                      {item.title}
                    </h4>
                    {item.notes && (
                      <p className="text-xs text-slate-700 font-medium mt-1 line-clamp-2">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Button */}
        <div className="p-3 bg-white border-t-2 border-[#171313] flex items-center">
          <button
            onClick={handleAddExperienceHere}
            className="w-full py-2.5 px-4 rounded-full bg-[#FFD45A] hover:bg-[#FFC72C] text-[#171313] font-black text-xs border-2 border-[#171313] shadow-pop-sm hover:scale-[1.02] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Memory to this Folder</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
