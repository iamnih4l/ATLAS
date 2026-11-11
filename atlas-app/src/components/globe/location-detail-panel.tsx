'use client';

import React from 'react';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  BookOpen,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export function LocationDetailPanel() {
  const {
    selectedLocation,
    setSelectedLocation,
    experiences,
    wishlistItems,
    setEditingExperience,
    setEditingWishlistItem,
    setExperienceModalOpen,
  } = useAtlasStore();

  if (!selectedLocation) return null;

  const locationExperiences = experiences.filter(
    (exp) => exp.location_id === selectedLocation.id
  );

  const locationWishlist = wishlistItems.filter(
    (w) => w.location_id === selectedLocation.id && !w.is_completed
  );

  const handleOpenExperience = (exp: any) => {
    setEditingExperience(exp);
    setExperienceModalOpen(true);
  };

  const handleOpenWishlist = (item: any) => {
    setEditingWishlistItem(item);
  };

  const handleAddExperienceHere = () => {
    setEditingExperience(null);
    useAtlasStore.setState({
      convertingWishlistToExperience: null,
      isExperienceModalOpen: true,
    });
  };

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-[#0e0e12]/95 backdrop-blur-xl border border-[#27272a] rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#1c1c22] flex items-start justify-between">
        <div className="pr-2">
          <Badge variant="emerald" size="sm" className="mb-1.5">
            <MapPin className="w-3 h-3" /> Real Geographical Coordinates
          </Badge>
          <h2 className="text-base font-bold text-[#f5f5f0] leading-snug">
            {selectedLocation.name}
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            {[selectedLocation.venue, selectedLocation.city, selectedLocation.country]
              .filter(Boolean)
              .join(' • ')}
          </p>
          <p className="text-[10px] font-mono text-[#71717a] mt-1">
            {selectedLocation.latitude.toFixed(4)}° N, {selectedLocation.longitude.toFixed(4)}° E
          </p>
        </div>
        <button
          onClick={() => setSelectedLocation(null)}
          className="text-[#71717a] hover:text-[#f5f5f0] p-1.5 rounded-lg hover:bg-[#1a1a20] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Completed Experiences List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Recorded Memories ({locationExperiences.length})
            </span>
          </div>

          {locationExperiences.length === 0 ? (
            <p className="text-xs text-[#71717a] italic p-3 bg-[#141418] rounded-xl border border-[#1e1e24]">
              No memories recorded at this exact spot yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {locationExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => handleOpenExperience(exp)}
                  className="p-3 bg-[#141418] hover:bg-[#1c1c22] border border-[#23232b] hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all group"
                >
                  {exp.cover_image_url && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 bg-[#1c1c22]">
                      <img
                        src={exp.cover_image_url}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#f5f5f0] group-hover:text-emerald-300 transition-colors">
                      {exp.title}
                    </h4>
                    {exp.rating && (
                      <StarRating value={exp.rating} readOnly size="sm" showNumber />
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-[11px] text-[#a1a1aa] line-clamp-2 mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e1e24] text-[10px] text-[#71717a]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {exp.date}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View Journal <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wishlist Items at this location */}
        {locationWishlist.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-violet-400" />
                Wishlist Activities ({locationWishlist.length})
              </span>
            </div>

            <div className="space-y-2">
              {locationWishlist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenWishlist(item)}
                  className="p-3 bg-[#15121e] hover:bg-[#1d192c] border border-violet-500/20 hover:border-violet-500/50 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#f5f5f0] group-hover:text-violet-300">
                      {item.title}
                    </h4>
                    <Badge variant="violet" size="sm">
                      {item.priority}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-[#a1a1aa] mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-[#1c1c22] bg-[#0c0c0f]">
        <Button
          onClick={handleAddExperienceHere}
          variant="glow"
          size="sm"
          className="w-full justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Another Experience Here</span>
        </Button>
      </div>
    </div>
  );
}
