'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  BookOpen,
  BookmarkCheck,
  X,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useAtlasStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  const {
    experiences,
    locations,
    wishlistItems,
    categories,
    setSelectedLocation,
    setFlyToTarget,
    setEditingExperience,
    setExperienceModalOpen,
  } = useAtlasStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open spotlight search
          window.dispatchEvent(new CustomEvent('atlas:open-search'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  // Search experiences
  const matchingExperiences = normalized
    ? experiences.filter((e) =>
        e.title.toLowerCase().includes(normalized) ||
        e.description?.toLowerCase().includes(normalized) ||
        e.tags?.some((t) => t.name.toLowerCase().includes(normalized))
      )
    : [];

  // Search locations
  const matchingLocations = normalized
    ? locations.filter((loc) =>
        loc.name.toLowerCase().includes(normalized) ||
        loc.city?.toLowerCase().includes(normalized) ||
        loc.country?.toLowerCase().includes(normalized) ||
        loc.venue?.toLowerCase().includes(normalized)
      )
    : locations.slice(0, 4); // Quick suggestions when empty

  // Search wishlist
  const matchingWishlist = normalized
    ? wishlistItems.filter((w) =>
        w.title.toLowerCase().includes(normalized) ||
        w.notes?.toLowerCase().includes(normalized)
      )
    : [];

  const handleSelectLocation = (loc: any) => {
    setSelectedLocation(loc);
    setFlyToTarget({
      latitude: loc.latitude,
      longitude: loc.longitude,
      altitude: 180,
    });
    onClose();
    router.push('/globe');
  };

  const handleSelectExperience = (exp: any) => {
    const loc = locations.find((l) => l.id === exp.location_id);
    if (loc) {
      setSelectedLocation(loc);
      setFlyToTarget({
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: 180,
      });
    }
    setEditingExperience(exp);
    setExperienceModalOpen(true);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-28">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#FFF4D9] border-2 border-[#171313] rounded-3xl shadow-pop-lg overflow-hidden z-10"
        >
          {/* Top Folder Tab */}
          <div className="absolute top-2 left-6 z-20 flex items-center gap-1.5 px-3.5 py-1 rounded-t-xl bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[11px] font-black text-[#171313] uppercase tracking-wider shadow-pop-sm">
            <span>🧭</span>
            <span>ATLAS QUICK DISPATCH</span>
          </div>

          {/* Top Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 pt-10 border-b-2 border-[#171313] bg-white">
            <Search className="w-5 h-5 text-[#6425F5] stroke-[3] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, memories, bucket list, or tags… (Esc to close)"
              className="w-full bg-transparent text-sm sm:text-base text-[#171313] placeholder-[#171313]/40 focus:outline-none font-black"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-[#171313]/60 hover:text-[#171313] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-[#171313] bg-[#FFD45A] rounded-md border-2 border-[#171313] shadow-pop-sm font-bold">
              ESC
            </kbd>
          </div>

          {/* Search Results / Suggestions */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 bg-warm-cream-grid">
            {/* When query is empty and user has logged locations */}
            {!normalized && matchingLocations.length > 0 && (
              <div>
                <p className="text-[11px] font-black text-[#171313]/70 uppercase tracking-wider px-2 mb-2">
                  Your Logged Places
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-[#FFD45A]/40 border-2 border-[#171313] shadow-pop-sm hover:shadow-pop transition-all text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#326BEE] text-white border border-[#171313] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MapPin className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#171313] truncate">
                          {loc.name}
                        </div>
                        <div className="text-[11px] text-[#171313]/70 font-semibold truncate">
                          {[loc.city, loc.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#171313] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* When query is empty and user has zero logged locations */}
            {!normalized && locations.length === 0 && (
              <div className="py-8 text-center text-[#171313]/70">
                <MapPin className="w-8 h-8 text-[#F04432] mx-auto mb-2 stroke-[2.5]" />
                <p className="text-xs font-black text-[#171313]">Your Atlas is ready for adventure</p>
                <p className="text-[11px] text-[#171313]/70 font-semibold mt-1 max-w-sm mx-auto">
                  Type any real-world place, city, or venue name to search and record your first memory!
                </p>
              </div>
            )}

            {/* Matching Memories */}
            {matchingExperiences.length > 0 && (
              <div>
                <p className="text-[11px] font-black text-[#F04432] uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                  Memories ({matchingExperiences.length})
                </p>
                <div className="space-y-1.5">
                  {matchingExperiences.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => handleSelectExperience(exp)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white hover:bg-[#F04432]/10 border-2 border-[#171313] shadow-pop-sm hover:shadow-pop transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#F04432] text-white border border-[#171313] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#171313] truncate">
                          {exp.title}
                        </div>
                        <div className="text-[11px] text-[#171313]/70 font-semibold truncate">
                          {exp.date} • {exp.rating ? `${exp.rating} ★` : 'Recorded'}
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-white bg-[#F04432] px-2.5 py-0.5 rounded-full border border-[#171313]">
                        View
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Locations */}
            {normalized && matchingLocations.length > 0 && (
              <div>
                <p className="text-[11px] font-black text-[#326BEE] uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#326BEE] stroke-[2.5]" />
                  Locations ({matchingLocations.length})
                </p>
                <div className="space-y-1.5">
                  {matchingLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white hover:bg-[#326BEE]/10 border-2 border-[#171313] shadow-pop-sm hover:shadow-pop transition-all text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#326BEE] text-white border border-[#171313] flex items-center justify-center shrink-0">
                        <Compass className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#171313] truncate">
                          {loc.name}
                        </div>
                        <div className="text-[11px] text-[#171313]/70 font-semibold truncate">
                          {[loc.venue, loc.city, loc.country].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-white bg-[#326BEE] px-2.5 py-0.5 rounded-full border border-[#171313] flex items-center gap-1">
                        Fly on Earth <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Wishlist */}
            {matchingWishlist.length > 0 && (
              <div>
                <p className="text-[11px] font-black text-[#6425F5] uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  Wishlist ({matchingWishlist.length})
                </p>
                <div className="space-y-1.5">
                  {matchingWishlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white border-2 border-[#171313] shadow-pop-sm text-left"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-xs font-black text-[#171313] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#171313]/70 font-semibold truncate">
                          Priority: {item.priority ? item.priority.toUpperCase() : 'MEDIUM'} • Dream Spot
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-[#171313] bg-[#FFD45A] px-2.5 py-0.5 rounded-full border border-[#171313]">
                        Wishlist
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {normalized &&
              matchingExperiences.length === 0 &&
              matchingLocations.length === 0 &&
              matchingWishlist.length === 0 && (
                <div className="py-10 text-center text-[#171313]/60">
                  <p className="text-xs font-black">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[11px] mt-1 text-[#171313]/70 font-semibold">
                    Try searching for cities, coordinates, countries, or journal keywords.
                  </p>
                </div>
              )}
          </div>

          {/* Bottom Footer Tip */}
          <div className="px-5 py-2.5 bg-white border-t-2 border-[#171313] flex items-center justify-between text-[11px] text-[#171313]/70 font-bold">
            <span>Press <kbd className="font-mono bg-[#FFD45A] px-1.5 py-0.5 rounded border border-[#171313] text-[#171313] shadow-pop-sm">↵</kbd> to jump</span>
            <span className="font-black text-[#6425F5]">✦ ATLAS SPATIAL SEARCH</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
