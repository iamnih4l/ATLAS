'use client';

import React, { useState, useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { StarRating } from '@/components/ui/star-rating';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  MapPin,
  Calendar,
  Star,
  Globe2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WashiTape, PassportStamp, DoodleSparkle, DoodleArrow, DoodleUnderline } from '@/components/ui/doodles';
import { PixelCamera, PixelBalloon, PixelPlane } from '@/components/ui/pixel-stickers';
import { JoyBlob, StarSpike, WanderBlob } from '@/components/ui/mascot-doodles';
import { VerifiedStamp, TicketBadge } from '@/components/ui/atlas-illustrations';

export default function MemoriesPage() {
  const {
    experiences,
    categories,
    setExperienceModalOpen,
    setEditingExperience,
    setFlyToTarget,
  } = useAtlasStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'rating_desc'>('date_desc');

  // Extract distinct countries
  const countries = useMemo(() => {
    const list = experiences
      .map((e) => e.location?.country)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set(list)).sort();
  }, [experiences]);

  // Filtered & Sorted list
  const filteredExperiences = useMemo(() => {
    return experiences
      .filter((exp) => {
        if (selectedCategory !== 'all' && exp.category_id !== selectedCategory) return false;
        if (selectedCountry !== 'all' && exp.location?.country !== selectedCountry) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = exp.title.toLowerCase().includes(q);
          const matchDesc = exp.description?.toLowerCase().includes(q);
          const matchLoc = exp.location?.name.toLowerCase().includes(q);
          const matchCountry = exp.location?.country.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc && !matchCountry) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'rating_desc') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });
  }, [experiences, selectedCategory, selectedCountry, search, sortBy]);

  const handleEdit = (exp: any) => {
    setEditingExperience(exp);
    setExperienceModalOpen(true);
  };

  const handleFlyTo = (e: React.MouseEvent, exp: any) => {
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
    <div className="flex-1 overflow-y-auto pt-24 sm:pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-6 w-full bg-warm-cream-grid min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#171313]/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5 relative">
            <PixelCamera size={28} className="animate-bounce" />
            <div className="relative">
              <h1 className="text-3xl font-black tracking-tight text-[#171313] font-sans">
                Memory Scrapbook
              </h1>
              <DoodleUnderline className="text-[#FFD45A] mt-0.5" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFD45A] text-[#171313] border-2 border-[#171313] shadow-pop-sm">
              {experiences.length} logged ✦
            </span>
            <DoodleSparkle size={20} color="#6425F5" />
          </div>
          <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
            Your personal living journal of adventures, breathtaking spots, delicious meals, and moments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / List View Toggle */}
          <div className="bg-white border-2 border-[#171313] rounded-2xl p-1 flex items-center shadow-pop-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-xl transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#FFD45A] text-[#171313] font-black border border-[#171313] shadow-pop-sm'
                  : 'text-[#171313]/50 hover:text-[#171313]'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-xl transition-all cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[#FFD45A] text-[#171313] font-black border border-[#171313] shadow-pop-sm'
                  : 'text-[#171313]/50 hover:text-[#171313]'
              )}
              title="List View"
            >
              <List className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={() => setExperienceModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record New Memory</span>
          </button>
        </div>
      </div>

      {/* Physical Folder Shelf inspired by Saved Folders & Child Edu Mellow */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-[#171313] flex items-center gap-1.5">
            <span>📁</span>
            <span>Memory File Folders (Click to Filter)</span>
          </span>
          <span className="text-[11px] font-black text-[#171313]/60">
            {categories.length} folders
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* All Folder */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'relative text-left p-3 pt-5 rounded-2xl border-2 border-[#171313] transition-all cursor-pointer bg-[#FFD45A]',
              selectedCategory === 'all'
                ? 'shadow-pop -translate-y-1 scale-[1.02] ring-2 ring-[#171313]'
                : 'shadow-pop-sm hover:-translate-y-0.5'
            )}
          >
            {/* Cut-out Folder Tab */}
            <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-t-lg bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black uppercase tracking-wider text-[#171313]">
              📁 ALL
            </div>
            <div className="text-xs font-black text-[#171313] mt-0.5">🌟 All Memories</div>
            <div className="text-[11px] font-bold text-[#171313]/80 mt-1">
              {experiences.length} {experiences.length === 1 ? 'item' : 'items'}
            </div>
          </button>

          {/* Top 5 Categories as Colorful Folders matching reference palette */}
          {categories.slice(0, 5).map((cat, i) => {
            const count = experiences.filter((e) => e.category_id === cat.id).length;
            const folderColors = [
              'bg-[#6425F5] text-white',
              'bg-[#326BEE] text-white',
              'bg-[#F04432] text-white',
              'bg-emerald-400 text-[#171313]',
              'bg-[#FFD45A] text-[#171313]',
            ];
            const tabColors = [
              'bg-[#6425F5] text-white',
              'bg-[#326BEE] text-white',
              'bg-[#F04432] text-white',
              'bg-emerald-400 text-[#171313]',
              'bg-[#FFD45A] text-[#171313]',
            ];
            const colorClass = folderColors[i % folderColors.length];
            const tabColorClass = tabColors[i % tabColors.length];
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={cn(
                  'relative text-left p-3 pt-5 rounded-2xl border-2 border-[#171313] transition-all cursor-pointer',
                  colorClass,
                  isSelected
                    ? 'shadow-pop -translate-y-1 scale-[1.02] ring-2 ring-[#171313] font-black'
                    : 'shadow-pop-sm hover:-translate-y-0.5'
                )}
              >
                {/* Cut-out Folder Tab */}
                <div
                  className={cn(
                    'absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-t-lg border-2 border-[#171313] border-b-0 text-[10px] font-black uppercase tracking-wider truncate max-w-[90px]',
                    tabColorClass
                  )}
                >
                  📁 {cat.slug}
                </div>
                <div className="text-xs font-black mt-0.5 truncate flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <div className="text-[11px] font-bold opacity-80 mt-1">
                  {count} {count === 1 ? 'item' : 'items'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar with Bento-Pop Styling */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-[#171313] p-3 rounded-2xl shadow-pop">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#6425F5] stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories, stories, venues, cities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-xl pl-10 pr-3.5 py-1.5 text-xs text-[#171313] placeholder-[#171313]/50 focus:outline-none focus:bg-white font-black shadow-pop-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border-2 border-[#171313] rounded-xl px-3 py-1.5 text-xs text-[#171313] font-black focus:outline-none shadow-pop-sm cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Country Filter */}
          {countries.length > 0 && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-white border-2 border-[#171313] rounded-xl px-3 py-1.5 text-xs text-[#171313] font-black focus:outline-none shadow-pop-sm cursor-pointer"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border-2 border-[#171313] rounded-xl px-3 py-1.5 text-xs text-[#171313] font-black focus:outline-none shadow-pop-sm cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-[#171313]/70 font-black px-1">
        Showing {filteredExperiences.length} of {experiences.length} logged memories
      </div>

      {/* Grid or List Display */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-14 bg-white border-2 border-[#171313] rounded-3xl p-8 space-y-4 shadow-pop-lg max-w-xl mx-auto my-8 relative overflow-hidden">
          {/* Top Folder Tab */}
          <div className="absolute top-2 left-6 z-10 flex items-center gap-1.5 px-3.5 py-0.5 rounded-t-lg bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black text-[#171313] uppercase tracking-widest shadow-pop-sm">
            📁 EMPTY JOURNAL
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <StarSpike size={42} />
            <div className="w-16 h-16 rounded-3xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center shadow-pop">
              <PixelCamera size={36} />
            </div>
            <JoyBlob size={46} />
          </div>

          <h3 className="text-lg font-black text-[#171313]">
            {experiences.length === 0 ? 'Your Scrapbook is Pristine & Ready' : 'No memories match your filter'}
          </h3>
          <p className="text-xs text-[#171313]/70 font-bold max-w-sm mx-auto leading-relaxed">
            {experiences.length === 0
              ? 'Start pinning the incredible places you have visited, upload your travel photos, and record your stories.'
              : 'Try clearing your category or search filter to see all your logged moments.'}
          </p>
          <button
            onClick={() => setExperienceModalOpen(true)}
            className="mt-3 px-6 py-3 rounded-full text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Your First Memory</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp, idx) => (
            <div
              key={exp.id}
              onClick={() => handleEdit(exp)}
              className={cn(
                'relative bg-white border-2 border-[#171313] rounded-3xl p-3.5 pb-4 cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-pop hover:shadow-pop-lg hover:-translate-y-1',
                idx % 2 === 0 ? '-rotate-[0.75deg] hover:rotate-0' : 'rotate-[0.75deg] hover:rotate-0'
              )}
            >
              {/* Scrapbook Washi Tape Strip */}
              <WashiTape
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20"
                rotate={idx % 2 === 0 ? '-2deg' : '2deg'}
                color={
                  idx % 3 === 0
                    ? 'bg-[#FFD45A]/90'
                    : idx % 3 === 1
                    ? 'bg-[#F04432]/90'
                    : 'bg-[#326BEE]/90'
                }
              />

              <div>
                {/* Polaroid Photo Frame */}
                <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-[#171313] border-2 border-[#171313] shadow-pop-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {exp.category && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FFD45A] text-[#171313] shadow-pop-sm border border-[#171313]">
                        {exp.category.icon} {exp.category.name}
                      </span>
                    )}
                  </div>
                  {exp.rating && (
                    <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full flex items-center gap-1 border-2 border-[#171313] shadow-pop-sm">
                      <Star className="w-3.5 h-3.5 text-[#FFD45A] fill-[#FFD45A]" />
                      <span className="text-xs font-black text-[#171313]">{exp.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Stamp detail */}
                  <div className="absolute bottom-2 right-2 pointer-events-none opacity-90 group-hover:rotate-6 transition-transform">
                    <VerifiedStamp label="VISITED" sublabel="ATLAS" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-1.5">
                  <h3 className="text-sm font-black text-[#171313] group-hover:text-[#6425F5] transition-colors line-clamp-1">
                    {exp.title}
                  </h3>

                  {exp.location && (
                    <p className="text-xs text-[#171313]/70 font-black flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                      <span>{exp.location.name}</span>
                      <span className="text-[#171313]/30">•</span>
                      <span>{exp.location.country}</span>
                    </p>
                  )}

                  {exp.description && (
                    <p className="text-xs text-[#171313]/80 font-medium line-clamp-2 leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-3 pt-3 mt-1 border-t-2 border-[#171313]/10 flex items-center justify-between text-[11px] text-[#171313]/70 font-black">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6425F5] stroke-[2.5]" /> {exp.date}
                </span>

                <Link
                  href="/globe"
                  onClick={(e) => handleFlyTo(e, exp)}
                  className="px-3 py-1 rounded-full bg-[#FFD45A] border-2 border-[#171313] text-[#171313] font-black hover:bg-[#FFD45A]/80 shadow-pop-sm flex items-center gap-1 transition-all"
                >
                  <Globe2 className="w-3 h-3 stroke-[2.5]" /> Fly on Earth
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              onClick={() => handleEdit(exp)}
              className="p-3 bg-white border-2 border-[#171313] hover:border-[#6425F5] rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group shadow-pop-sm hover:shadow-pop"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-[#171313] border-2 border-[#171313] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#171313] group-hover:text-[#6425F5] transition-colors truncate">
                      {exp.title}
                    </h4>
                    {exp.category && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFD45A] text-[#171313] border border-[#171313]">
                        {exp.category.icon} {exp.category.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#171313]/70 font-bold flex items-center gap-1.5 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-[#F04432] shrink-0 stroke-[2.5]" />
                    <span>{exp.location?.name}</span>
                    <span className="text-[#171313]/30">•</span>
                    <span>{exp.location?.country}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs">
                {exp.rating && (
                  <StarRating value={exp.rating} readOnly size="sm" showNumber />
                )}
                <span className="text-[#171313]/60 hidden sm:inline font-bold">{exp.date}</span>
                <Link
                  href="/globe"
                  onClick={(e) => handleFlyTo(e, exp)}
                  className="p-2 rounded-xl bg-[#FFD45A] text-[#171313] border-2 border-[#171313] shadow-pop-sm hover:scale-105 transition-transform"
                  title="View on Earth"
                >
                  <Globe2 className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
