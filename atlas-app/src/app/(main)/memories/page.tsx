'use client';

import React, { useState, useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  Star,
  Globe2,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

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
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c1c22] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f0]">
            Experience Memories
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Your personal chronological archive of real-world adventures, venues and moments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / List View Toggle */}
          <div className="bg-[#121215] border border-[#27272a] rounded-lg p-1 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#27272a] text-emerald-400'
                  : 'text-[#71717a] hover:text-[#f5f5f0]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#27272a] text-emerald-400'
                  : 'text-[#71717a] hover:text-[#f5f5f0]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => setExperienceModalOpen(true)}
            variant="glow"
            size="md"
          >
            <Plus className="w-4 h-4" />
            <span>Log Memory</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121215] border border-[#27272a] p-3 rounded-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memories, descriptions, venues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#18181f] border border-[#2a2a32] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f5f5f0] placeholder-[#52525b] focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#18181f] border border-[#2a2a32] rounded-lg px-2.5 py-1.5 text-xs text-[#f5f5f0] focus:outline-none focus:border-emerald-500/60"
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
              className="bg-[#18181f] border border-[#2a2a32] rounded-lg px-2.5 py-1.5 text-xs text-[#f5f5f0] focus:outline-none focus:border-emerald-500/60"
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
            className="bg-[#18181f] border border-[#2a2a32] rounded-lg px-2.5 py-1.5 text-xs text-[#f5f5f0] focus:outline-none focus:border-emerald-500/60"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-[#71717a]">
        Showing {filteredExperiences.length} of {experiences.length} logged experiences
      </div>

      {/* Grid or List Display */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-16 bg-[#101014] border border-[#1e1e24] rounded-2xl p-8 space-y-3">
          <Globe2 className="w-10 h-10 text-[#3f3f46] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f5f5f0]">No experiences match your filter</h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            Try adjusting your search query, or record a new milestone memory right now.
          </p>
          <Button
            onClick={() => setExperienceModalOpen(true)}
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Log New Memory
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              onClick={() => handleEdit(exp)}
              className="bg-[#121215] border border-[#23232b] hover:border-emerald-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="aspect-[16/10] relative overflow-hidden bg-[#18181f]">
                  <img
                    src={exp.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {exp.category && (
                      <Badge variant="default" size="sm" className="bg-black/70 backdrop-blur-md">
                        {exp.category.icon} {exp.category.name}
                      </Badge>
                    )}
                  </div>
                  {exp.rating && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-400/30">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-400">{exp.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-[#f5f5f0] group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {exp.title}
                  </h3>

                  {exp.location && (
                    <p className="text-xs text-[#a1a1aa] flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{exp.location.name}</span>
                      <span className="text-[#52525b]">•</span>
                      <span>{exp.location.country}</span>
                    </p>
                  )}

                  {exp.description && (
                    <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 border-t border-[#1c1c22] bg-[#0e0e12] flex items-center justify-between text-[11px] text-[#71717a]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> {exp.date}
                </span>

                <Link
                  href="/globe"
                  onClick={(e) => handleFlyTo(e, exp)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <Globe2 className="w-3 h-3" /> Fly on Globe
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
              className="p-3.5 bg-[#121215] border border-[#23232b] hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#18181f] shrink-0">
                  <img
                    src={exp.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#f5f5f0] group-hover:text-emerald-300 transition-colors truncate">
                      {exp.title}
                    </h4>
                    {exp.category && (
                      <Badge variant="default" size="sm">
                        {exp.category.icon} {exp.category.name}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-[#a1a1aa] flex items-center gap-1.5 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{exp.location?.name}</span>
                    <span className="text-[#52525b]">•</span>
                    <span>{exp.location?.country}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs">
                {exp.rating && (
                  <StarRating value={exp.rating} readOnly size="sm" showNumber />
                )}
                <span className="text-[#71717a] hidden sm:inline">{exp.date}</span>
                <Link
                  href="/globe"
                  onClick={(e) => handleFlyTo(e, exp)}
                  className="p-2 rounded-lg bg-[#181820] text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  title="View on Globe"
                >
                  <Globe2 className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
