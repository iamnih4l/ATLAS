'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtlasStore } from '@/lib/store';
import {
  BookmarkCheck,
  Plus,
  MapPin,
  DollarSign,
  Globe2,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Compass,
  Route,
  Sparkles,
  Calendar,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WashiTape, DoodleSparkle, DoodleUnderline } from '@/components/ui/doodles';
import { PixelBalloon, PixelPlane } from '@/components/ui/pixel-stickers';
import { ChillCloud, StarSpike } from '@/components/ui/mascot-doodles';
import { VerifiedStamp, TicketBadge } from '@/components/ui/atlas-illustrations';
import { Adventure, AdventureStatus, AdventureDestination } from '@/types';
import { Modal } from '@/components/ui/modal';
import { isDreamingItem } from '@/lib/wishlist-utils';

function WishlistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab =
    tabParam === 'adventures'
      ? 'adventures'
      : tabParam === 'all_wishlist'
      ? 'all_wishlist'
      : 'bucket_list';
  const highlightedAdvId = searchParams.get('id');

  const {
    wishlistItems,
    locations,
    adventures,
    setAdventures,
    deleteAdventure,
    updateAdventure,
    updateAdventureDestination,
    setSelectedAdventure,
    setWishlistModalOpen,
    setEditingWishlistItem,
    setConvertingWishlistToExperience,
    setExperienceModalOpen,
    deleteWishlistItem,
    setFlyToTarget,
  } = useAtlasStore();

  const [activeTab, setActiveTab] = useState<'bucket_list' | 'adventures' | 'all_wishlist'>(initialTab);
  const [adventureStatusFilter, setAdventureStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<'all' | 'dreaming' | 'planned' | 'visited'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedAdvIds, setExpandedAdvIds] = useState<Set<string>>(new Set());

  // Manual Add Adventure Modal State
  const [isNewAdventureModalOpen, setIsNewAdventureModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<AdventureStatus>('planned');
  const [newBudget, setNewBudget] = useState('');
  const [newStopsText, setNewStopsText] = useState('');

  // Fetch adventures from server in background on mount
  useEffect(() => {
    let isCancelled = false;
    async function fetchServerAdventures() {
      try {
        const res = await fetch('/api/adventures');
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.adventures && data.adventures.length > 0) {
            setAdventures(data.adventures);
          }
        }
      } catch (err) {
        console.warn('Adventures fetch fallback to local store:', err);
      }
    }
    fetchServerAdventures();
    return () => {
      isCancelled = true;
    };
  }, [setAdventures]);

  // If arriving with a highlighted adventure id, expand it
  useEffect(() => {
    if (highlightedAdvId) {
      setExpandedAdvIds((prev) => new Set(prev).add(highlightedAdvId));
    }
  }, [highlightedAdvId]);

  // Filtered Adventures
  const filteredAdventures = useMemo(() => {
    return adventures.filter((adv) => {
      if (adventureStatusFilter !== 'all' && adv.status !== adventureStatusFilter) return false;
      return true;
    });
  }, [adventures, adventureStatusFilter]);

  // Dream List Pins: Strictly Dreaming entries (Derived automatically, never visited)
  const dreamListItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      if (!isDreamingItem(item)) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      return true;
    });
  }, [wishlistItems, priorityFilter]);

  // All Wishlist Pins: Complete overview with status & priority filters
  const allWishlistFilteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      if (wishlistStatusFilter !== 'all') {
        const itemStat = item.status || (item.is_completed ? 'visited' : 'dreaming');
        if (itemStat !== wishlistStatusFilter) return false;
      }
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      return true;
    });
  }, [wishlistItems, wishlistStatusFilter, priorityFilter]);

  // Legacy compatibility accessor
  const filteredItems = activeTab === 'bucket_list' ? dreamListItems : allWishlistFilteredItems;

  const toggleExpandAdventure = (id: string) => {
    setExpandedAdvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFlyAdventure = (adv: Adventure) => {
    setSelectedAdventure(adv);
    const firstStop = adv.destinations?.[0];
    if (firstStop && firstStop.latitude !== undefined && firstStop.longitude !== undefined) {
      setFlyToTarget({
        latitude: firstStop.latitude,
        longitude: firstStop.longitude,
        altitude: 350000,
      });
    }
    router.push('/globe');
  };

  const handleToggleStopCompleted = async (
    advId: string,
    dest: AdventureDestination
  ) => {
    const updatedStatus = !dest.is_completed;
    updateAdventureDestination(advId, dest.id, { is_completed: updatedStatus });

    try {
      await fetch('/api/adventures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: advId,
          updates: { updated_at: new Date().toISOString() },
        }),
      });
    } catch (err) {
      console.warn('Failed to sync destination status update:', err);
    }
  };

  const handleStatusChange = async (advId: string, newStat: AdventureStatus) => {
    updateAdventure(advId, { status: newStat });
    try {
      await fetch('/api/adventures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: advId,
          updates: { status: newStat },
        }),
      });
    } catch (err) {
      console.warn('Failed to sync status change:', err);
    }
  };

  const handleDeleteAdv = async (adv: Adventure) => {
    if (confirm(`Remove adventure "${adv.title}" and its itinerary?`)) {
      deleteAdventure(adv.id);
      try {
        await fetch(`/api/adventures?id=${adv.id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to delete on server:', err);
      }
    }
  };

  const handleCreateManualAdventure = () => {
    if (!newTitle.trim()) return;

    const advId = `adv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const stopLines = newStopsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const destinations: AdventureDestination[] = stopLines.map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const name = parts[0] || `Stop ${idx + 1}`;
      const city = parts[1] || null;
      const country = parts[2] || 'Earth';

      return {
        id: `dest-${Date.now()}-${idx}`,
        adventure_id: advId,
        name,
        city,
        country,
        latitude: 0,
        longitude: 0,
        order_index: idx,
        day_number: idx + 1,
        activities: ['Sightseeing', 'Exploration'],
        is_completed: false,
      };
    });

    const newAdv: Adventure = {
      id: advId,
      user_id: 'active-user',
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      status: newStatus,
      estimated_budget: newBudget ? Number(newBudget) : null,
      currency: 'USD',
      notes: 'Custom planned itinerary',
      cover_image_url:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      is_bucket_list: newStatus === 'dreaming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      destinations,
    };

    useAtlasStore.getState().addAdventure(newAdv);
    setIsNewAdventureModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewStopsText('');
    setNewBudget('');

    fetch('/api/adventures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adventure: newAdv, destinations }),
    }).catch((err) => console.warn('Save adventure error:', err));
  };

  const handleEdit = (item: any) => {
    setEditingWishlistItem(item);
    setWishlistModalOpen(true);
  };

  const handleConvert = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setConvertingWishlistToExperience(item);
    setExperienceModalOpen(true);
  };

  const handleFlyWishlist = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const loc = item.location || locations.find((l) => l.id === item.location_id);
    if (loc && loc.latitude !== undefined && loc.longitude !== undefined) {
      setFlyToTarget({
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: 400000,
      });
      router.push('/globe');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-20 sm:pt-28 pb-28 sm:pb-24 px-3.5 sm:px-6 max-w-7xl mx-auto space-y-6 w-full bg-warm-cream-grid min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#171313]/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5 relative">
            <PixelBalloon size={28} />
            <div className="relative">
              <h1 className="text-3xl font-black tracking-tight text-[#171313] font-sans">
                Adventures & Bucket List
              </h1>
              <DoodleUnderline className="text-[#FFD45A] mt-0.5" />
            </div>
            <DoodleSparkle size={20} color="#6425F5" />
          </div>
          <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
            Organize multi-stop expedition itineraries and pinned dream destinations with real-world 3D globe visualization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/discover"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-[#6425F5] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Plan with Orion AI</span>
          </Link>

          {activeTab === 'adventures' ? (
            <button
              onClick={() => setIsNewAdventureModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Adventure</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingWishlistItem(null);
                setWishlistModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{activeTab === 'bucket_list' ? 'Add Dream Pin' : 'Add Wishlist Pin'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 border-b-2 border-[#171313] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bucket_list')}
          className={cn(
            'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313] flex items-center gap-2 whitespace-nowrap',
            activeTab === 'bucket_list'
              ? 'bg-[#F04432] text-white shadow-pop scale-105'
              : 'bg-white text-[#171313]/70 hover:bg-[#F04432]/10 shadow-pop-sm'
          )}
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>✦ Dream List ({wishlistItems.filter(isDreamingItem).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('adventures')}
          className={cn(
            'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313] flex items-center gap-2 whitespace-nowrap',
            activeTab === 'adventures'
              ? 'bg-[#6425F5] text-white shadow-pop scale-105'
              : 'bg-white text-[#171313]/70 hover:bg-[#6425F5]/10 shadow-pop-sm'
          )}
        >
          <Route className="w-4 h-4 stroke-[2.5]" />
          <span>Planned Adventures ({adventures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_wishlist')}
          className={cn(
            'px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313] flex items-center gap-2 whitespace-nowrap',
            activeTab === 'all_wishlist'
              ? 'bg-[#10B981] text-white shadow-pop scale-105'
              : 'bg-white text-[#171313]/70 hover:bg-[#10B981]/10 shadow-pop-sm'
          )}
        >
          <BookmarkCheck className="w-4 h-4 stroke-[2.5]" />
          <span>All Wishlist ({wishlistItems.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ADVENTURES TAB CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'adventures' && (
        <div className="space-y-6">
          {/* Status Filter Sub-Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-[#171313] p-3 rounded-2xl shadow-pop">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All Adventures' },
                { key: 'planned', label: '🏔️ Planned' },
                { key: 'dreaming', label: '✦ Dreaming' },
                { key: 'upcoming', label: '✈️ Upcoming' },
                { key: 'in_progress', label: '🧭 In Progress' },
                { key: 'completed', label: '✓ Completed' },
              ].map((filter) => {
                const isSelected = adventureStatusFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setAdventureStatusFilter(filter.key)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer border-2 border-[#171313]',
                      isSelected
                        ? 'bg-[#FFD45A] text-[#171313] shadow-pop-sm scale-105'
                        : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/20'
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adventures List */}
          {filteredAdventures.length === 0 ? (
            <div className="text-center py-14 bg-white border-2 border-[#171313] rounded-3xl p-8 space-y-4 shadow-pop-lg max-w-xl mx-auto my-8 relative overflow-hidden">
              <div className="flex items-center justify-center gap-3 pt-4">
                <ChillCloud size={46} />
                <div className="w-16 h-16 rounded-3xl bg-[#6425F5] border-2 border-[#171313] flex items-center justify-center shadow-pop text-white">
                  <Route size={32} />
                </div>
                <StarSpike size={42} />
              </div>

              <h3 className="text-lg font-black text-[#171313]">No Adventures Found</h3>
              <p className="text-xs text-[#171313]/70 font-bold max-w-sm mx-auto leading-relaxed">
                Connect your dreams into sequenced itineraries! Ask Orion AI to generate a multi-stop route or create your own custom adventure.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/discover"
                  className="px-5 py-2.5 rounded-full text-xs font-black text-white bg-[#6425F5] border-2 border-[#171313] shadow-pop hover:scale-105 transition-all inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Plan with Orion AI</span>
                </Link>

                <button
                  onClick={() => setIsNewAdventureModalOpen(true)}
                  className="px-5 py-2.5 rounded-full text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop hover:scale-105 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Custom</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAdventures.map((adv) => {
                const isExpanded = expandedAdvIds.has(adv.id);
                const stops = adv.destinations || [];
                const completedStopsCount = stops.filter((s) => s.is_completed).length;

                return (
                  <div
                    key={adv.id}
                    className="bg-white border-2 border-[#171313] rounded-3xl p-5 shadow-pop hover:shadow-pop-lg transition-all flex flex-col justify-between space-y-4 relative"
                  >
                    {/* Washi Tape Accent */}
                    <WashiTape
                      className="absolute -top-2.5 left-10 z-20"
                      rotate="-2deg"
                      color={
                        adv.status === 'completed'
                          ? 'bg-[#F04432]'
                          : adv.status === 'dreaming'
                          ? 'bg-[#FFD45A]'
                          : 'bg-[#6425F5]'
                      }
                    />

                    {/* Top Row: Status, Budget, & Quick Dropdown */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2 pt-1">
                        <select
                          value={adv.status}
                          onChange={(e) => handleStatusChange(adv.id, e.target.value as AdventureStatus)}
                          className={cn(
                            'text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-[#171313] shadow-pop-xs focus:outline-none cursor-pointer',
                            adv.status === 'completed'
                              ? 'bg-[#F04432] text-white'
                              : adv.status === 'dreaming'
                              ? 'bg-[#FFD45A] text-[#171313]'
                              : 'bg-[#6425F5] text-white'
                          )}
                        >
                          <option value="planned">🏔️ Planned</option>
                          <option value="upcoming">✈️ Upcoming</option>
                          <option value="in_progress">🧭 In Progress</option>
                          <option value="dreaming">✦ Dreaming</option>
                          <option value="completed">✓ Completed</option>
                        </select>

                        {adv.estimated_budget && (
                          <span className="text-[11px] font-mono font-black text-[#171313] bg-[#FFF4D9] px-2.5 py-0.5 rounded-lg border border-[#171313]">
                            Budget: ~{adv.estimated_budget} {adv.currency || 'USD'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-[#171313] line-clamp-1">
                        {adv.title}
                      </h3>

                      {adv.description && (
                        <p className="text-xs text-[#171313]/70 font-bold mt-1 line-clamp-2">
                          {adv.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar of Completed Stops */}
                    {stops.length > 0 && (
                      <div className="p-3 bg-[#FFF4D9] rounded-2xl border border-[#171313] space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-[#171313]">
                          <span className="flex items-center gap-1.5">
                            <Route className="w-3.5 h-3.5 text-[#6425F5]" />
                            Itinerary Stops ({stops.length})
                          </span>
                          <span className="text-[11px] text-[#6425F5] font-mono">
                            {completedStopsCount}/{stops.length} Milestones
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-2.5 bg-white border border-[#171313] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{
                              width: `${(completedStopsCount / stops.length) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Stops preview / accordion toggle */}
                        <button
                          onClick={() => toggleExpandAdventure(adv.id)}
                          className="w-full pt-1 text-[11px] font-black text-[#6425F5] hover:text-[#521ec9] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Itinerary Details' : 'View Full Itinerary'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Expanded Stops Timeline */}
                        {isExpanded && (
                          <div className="pt-2 space-y-2 border-t border-[#171313]/10">
                            {stops.map((stop, sIdx) => (
                              <div
                                key={stop.id}
                                className={cn(
                                  'p-2 rounded-xl border text-xs flex items-start justify-between gap-2 transition-all',
                                  stop.is_completed
                                    ? 'bg-emerald-50 border-emerald-500'
                                    : 'bg-white border-[#171313]'
                                )}
                              >
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-[#6425F5] text-white text-[9px] font-black inline-flex items-center justify-center">
                                      {sIdx + 1}
                                    </span>
                                    <span
                                      className={cn(
                                        'font-black',
                                        stop.is_completed && 'line-through text-slate-500'
                                      )}
                                    >
                                      {stop.name}
                                    </span>
                                  </div>

                                  <p className="text-[10px] text-[#171313]/70 font-bold ml-5">
                                    {[stop.city, stop.country].filter(Boolean).join(', ')}
                                    {stop.day_number ? ` • Day ${stop.day_number}` : ''}
                                  </p>

                                  {stop.activities && stop.activities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 ml-5 mt-1">
                                      {stop.activities.map((act, aIdx) => (
                                        <span
                                          key={aIdx}
                                          className="text-[9px] font-bold bg-[#FFF4D9] border border-[#171313]/40 px-1.5 py-0.5 rounded text-[#171313]"
                                        >
                                          {act}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleToggleStopCompleted(adv.id, stop)}
                                  className={cn(
                                    'px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shrink-0',
                                    stop.is_completed
                                      ? 'bg-emerald-500 text-white border-emerald-600'
                                      : 'bg-white text-[#171313] border-[#171313] hover:bg-[#FFD45A]'
                                  )}
                                >
                                  {stop.is_completed ? '✓ Done' : 'Mark Done'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="pt-2 border-t-2 border-[#171313]/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFlyAdventure(adv)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#6425F5] hover:bg-[#521ec9] text-white border-2 border-[#171313] shadow-pop-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>View on 3D Globe</span>
                        </button>

                        <Link
                          href={`/discover?adventure=${adv.id}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#FFD45A] hover:bg-[#ffc72c] text-[#171313] border-2 border-[#171313] shadow-pop-xs transition-all flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Plan with Orion</span>
                        </Link>
                      </div>

                      <button
                        onClick={() => handleDeleteAdv(adv)}
                        className="p-1.5 rounded-xl text-[#171313]/50 hover:text-[#F04432] hover:bg-[#F04432]/10 transition-colors cursor-pointer"
                        title="Delete Adventure"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BUCKET LIST / DREAM LIST TAB CONTENT (DERIVED FROM WISHLIST DREAMING PINS) */}
      {/* ========================================================================= */}
      {activeTab === 'bucket_list' && (
        <div className="space-y-6">
          {/* Automatic Dream List Banner & Priority Filters */}
          <div className="bg-[#FFF4D9] border-2 border-[#171313] p-4 rounded-3xl shadow-pop flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6425F5] text-white border-2 border-[#171313] flex items-center justify-center shrink-0 shadow-pop-sm">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#171313]">Automated Dream List</h2>
                <p className="text-xs text-[#171313]/70 font-bold">
                  All wishlist pins marked or tagged with <strong>Dreaming</strong> automatically appear here. When marked as Visited, they graduate to your Memories!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => {
                const isSelected = priorityFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer border-2 border-[#171313]',
                      isSelected
                        ? p === 'high'
                          ? 'bg-[#F04432] text-white shadow-pop-sm scale-105'
                          : p === 'low'
                          ? 'bg-[#326BEE] text-white shadow-pop-sm scale-105'
                          : 'bg-[#FFD45A] text-[#171313] shadow-pop-sm scale-105'
                        : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/20'
                    )}
                  >
                    {p === 'all' ? 'All Dreams' : `${p} Priority`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dream Items Grid */}
          {dreamListItems.length === 0 ? (
            <div className="text-center py-14 bg-white border-2 border-[#171313] rounded-3xl p-8 space-y-4 shadow-pop-lg max-w-xl mx-auto my-8 relative overflow-hidden">
              <div className="flex items-center justify-center gap-3 pt-4">
                <ChillCloud size={46} />
                <div className="w-16 h-16 rounded-3xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center shadow-pop">
                  <PixelBalloon size={36} />
                </div>
                <StarSpike size={42} />
              </div>

              <h3 className="text-lg font-black text-[#171313]">No Dream List Pins Yet</h3>
              <p className="text-xs text-[#171313]/70 font-bold max-w-sm mx-auto leading-relaxed">
                Add a destination and choose <strong>✦ Dreaming</strong>, or mark an existing wishlist pin as Dreaming. It will instantly show up in this view!
              </p>
              <button
                onClick={() => {
                  setEditingWishlistItem(null);
                  setWishlistModalOpen(true);
                }}
                className="mt-3 px-6 py-3 rounded-full text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Dream Pin</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dreamListItems.map((item, idx) => {
                const isHigh = item.priority === 'high';
                const isLow = item.priority === 'low';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    className={cn(
                      'relative bg-white border-2 border-[#171313] rounded-3xl p-4 pb-4 cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-pop hover:shadow-pop-lg hover:-translate-y-1',
                      idx % 2 === 0 ? '-rotate-[0.75deg] hover:rotate-0' : 'rotate-[0.75deg] hover:rotate-0'
                    )}
                  >
                    <WashiTape
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20"
                      rotate={idx % 2 === 0 ? '-2deg' : '2deg'}
                      color={isHigh ? 'bg-[#F04432]/90' : isLow ? 'bg-[#326BEE]/90' : 'bg-[#FFD45A]/90'}
                    />
                    <div>
                      {/* Reference Image */}
                      <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-[#171313] border-2 border-[#171313] shadow-pop-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            item.reference_image_url ||
                            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#6425F5] text-white border border-[#171313] shadow-pop-sm flex items-center gap-1">
                            ✦ Dreaming
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-[#171313] shadow-pop-sm',
                              isHigh
                                ? 'bg-[#F04432] text-white'
                                : isLow
                                ? 'bg-[#326BEE] text-white'
                                : 'bg-[#FFD45A] text-[#171313]'
                            )}
                          >
                            {item.priority} Priority
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2 pt-3 space-y-1.5">
                        <h3 className="text-sm font-black text-[#171313] group-hover:text-[#6425F5] transition-colors line-clamp-1">
                          {item.title}
                        </h3>

                        {item.location && (
                          <p className="text-xs text-[#171313]/70 font-black flex items-center gap-1.5 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                            <span>{item.location.name}</span>
                            <span className="text-[#171313]/30">•</span>
                            <span>{item.location.country}</span>
                          </p>
                        )}

                        {item.estimated_budget && (
                          <p className="text-xs text-[#171313]/80 font-bold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span>Est. Budget: {item.estimated_budget}</span>
                          </p>
                        )}

                        {item.description && (
                          <p className="text-xs text-[#171313]/80 font-medium line-clamp-2 leading-relaxed pt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-2 pt-3 mt-1 border-t-2 border-[#171313]/10 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleFlyWishlist(e, item)}
                        className="text-xs text-[#171313] hover:text-[#6425F5] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" /> Fly on Earth
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleConvert(e, item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1 cursor-pointer transition-transform"
                          title="Convert to Experienced Memory"
                        >
                          <span>Done! Record It</span>
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${item.title}" from your wishlist?`)) {
                              deleteWishlistItem(item.id);
                              fetch(`/api/wishlist?id=${item.id}`, { method: 'DELETE' }).catch((err) =>
                                console.warn('Failed to delete on server:', err)
                              );
                            }
                          }}
                          className="p-1.5 rounded-xl text-[#171313]/50 hover:text-[#F04432] hover:bg-[#F04432]/10 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALL WISHLIST PINS TAB CONTENT (FULL ARCHIVE WITH STATUS FILTERS) */}
      {/* ========================================================================= */}
      {activeTab === 'all_wishlist' && (
        <div className="space-y-6">
          {/* Status & Priority Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-[#171313] p-3.5 rounded-2xl shadow-pop">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all', label: `All Pins (${wishlistItems.length})` },
                { key: 'dreaming', label: `✦ Dreaming (${wishlistItems.filter(isDreamingItem).length})` },
                { key: 'planned', label: `🏔️ Planned (${wishlistItems.filter((w) => w.status === 'planned').length})` },
                { key: 'visited', label: `✅ Visited (${wishlistItems.filter((w) => w.is_completed || w.status === 'visited').length})` },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setWishlistStatusFilter(s.key as any)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313]',
                    wishlistStatusFilter === s.key
                      ? 'bg-[#10B981] text-white shadow-pop-sm scale-105'
                      : 'bg-white text-[#171313]/70 hover:bg-[#10B981]/15'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => {
                const isSelected = priorityFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={cn(
                      'px-3 py-1 rounded-xl text-[11px] font-black capitalize transition-all cursor-pointer border-2 border-[#171313]',
                      isSelected
                        ? 'bg-[#FFD45A] text-[#171313] shadow-pop-sm scale-105'
                        : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/20'
                    )}
                  >
                    {p === 'all' ? 'All Priority' : `${p}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          {allWishlistFilteredItems.length === 0 ? (
            <div className="text-center py-14 bg-white border-2 border-[#171313] rounded-3xl p-8 space-y-4 shadow-pop-lg max-w-xl mx-auto my-8 relative overflow-hidden">
              <h3 className="text-lg font-black text-[#171313]">No Wishlist Pins Found</h3>
              <p className="text-xs text-[#171313]/70 font-bold max-w-sm mx-auto leading-relaxed">
                No items match your active filters. Try resetting the status or priority filters.
              </p>
              <button
                onClick={() => {
                  setWishlistStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="mt-3 px-6 py-2.5 rounded-full text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allWishlistFilteredItems.map((item, idx) => {
                const isHigh = item.priority === 'high';
                const isLow = item.priority === 'low';
                const isCompleted = item.is_completed || item.status === 'visited';
                const isDreaming = isDreamingItem(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    className={cn(
                      'relative bg-white border-2 border-[#171313] rounded-3xl p-4 pb-4 cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-pop hover:shadow-pop-lg hover:-translate-y-1',
                      idx % 2 === 0 ? '-rotate-[0.75deg] hover:rotate-0' : 'rotate-[0.75deg] hover:rotate-0',
                      isCompleted ? 'bg-emerald-50/60' : 'bg-white'
                    )}
                  >
                    <WashiTape
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20"
                      rotate={idx % 2 === 0 ? '-2deg' : '2deg'}
                      color={isHigh ? 'bg-[#F04432]/90' : isLow ? 'bg-[#326BEE]/90' : 'bg-[#FFD45A]/90'}
                    />
                    <div>
                      {/* Reference Image */}
                      <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-[#171313] border-2 border-[#171313] shadow-pop-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            item.reference_image_url ||
                            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-[#171313] shadow-pop-sm flex items-center gap-1',
                              isCompleted
                                ? 'bg-emerald-400 text-[#171313]'
                                : isDreaming
                                ? 'bg-[#6425F5] text-white'
                                : 'bg-[#326BEE] text-white'
                            )}
                          >
                            {isCompleted ? '✅ Visited' : isDreaming ? '✦ Dreaming' : '🏔️ Planned'}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-[#171313] shadow-pop-sm',
                              isHigh
                                ? 'bg-[#F04432] text-white'
                                : isLow
                                ? 'bg-[#326BEE] text-white'
                                : 'bg-[#FFD45A] text-[#171313]'
                            )}
                          >
                            {item.priority} Priority
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="absolute top-3 right-3 bg-emerald-400 text-[#171313] px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border-2 border-[#171313] shadow-pop-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Experienced!
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-2 pt-3 space-y-1.5">
                        <h3 className="text-sm font-black text-[#171313] group-hover:text-[#6425F5] transition-colors line-clamp-1">
                          {item.title}
                        </h3>

                        {item.location && (
                          <p className="text-xs text-[#171313]/70 font-black flex items-center gap-1.5 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                            <span>{item.location.name}</span>
                            <span className="text-[#171313]/30">•</span>
                            <span>{item.location.country}</span>
                          </p>
                        )}

                        {item.estimated_budget && (
                          <p className="text-xs text-[#171313]/80 font-bold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span>Est. Budget: {item.estimated_budget}</span>
                          </p>
                        )}

                        {item.description && (
                          <p className="text-xs text-[#171313]/80 font-medium line-clamp-2 leading-relaxed pt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-2 pt-3 mt-1 border-t-2 border-[#171313]/10 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleFlyWishlist(e, item)}
                        className="text-xs text-[#171313] hover:text-[#6425F5] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" /> Fly on Earth
                      </button>

                      <div className="flex items-center gap-1.5">
                        {!isCompleted && (
                          <button
                            onClick={(e) => handleConvert(e, item)}
                            className="px-3 py-1.5 rounded-xl text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1 cursor-pointer transition-transform"
                            title="Convert to Experienced Memory"
                          >
                            <span>Done! Record It</span>
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove "${item.title}" from your wishlist?`)) {
                              deleteWishlistItem(item.id);
                              fetch(`/api/wishlist?id=${item.id}`, { method: 'DELETE' }).catch((err) =>
                                console.warn('Failed to delete on server:', err)
                              );
                            }
                          }}
                          className="p-1.5 rounded-xl text-[#171313]/50 hover:text-[#F04432] hover:bg-[#F04432]/10 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Manual New Adventure Modal */}
      {isNewAdventureModalOpen && (
        <Modal
          isOpen={isNewAdventureModalOpen}
          onClose={() => setIsNewAdventureModalOpen(false)}
          title="Create New Adventure"
        >
          <div className="space-y-4 p-2 text-[#171313]">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Adventure Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 7-Day Swiss Alpine Route"
                className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-4 py-2.5 text-xs font-black focus:outline-none focus:bg-white shadow-pop-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Description / Concept
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What is the vision or highlight of this journey?"
                rows={2}
                className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-4 py-2 text-xs font-medium focus:outline-none focus:bg-white shadow-pop-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AdventureStatus)}
                  className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-3 py-2 text-xs font-black focus:outline-none shadow-pop-sm cursor-pointer"
                >
                  <option value="planned">Planned Expedition</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="dreaming">Dreaming / Wishlist</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed Memory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Estimated Budget ($)
                </label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="e.g. 2400"
                  className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-4 py-2 text-xs font-black focus:outline-none focus:bg-white shadow-pop-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Itinerary Stops (One per line: &ldquo;Place, City, Country&rdquo;)
              </label>
              <textarea
                value={newStopsText}
                onChange={(e) => setNewStopsText(e.target.value)}
                placeholder={'Zurich, Zurich, Switzerland\nLucerne, Lucerne, Switzerland\nInterlaken, Interlaken, Switzerland\nZermatt, Zermatt, Switzerland'}
                rows={4}
                className="w-full bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-4 py-2 text-xs font-mono font-medium focus:outline-none focus:bg-white shadow-pop-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-[#171313]/15">
              <button
                type="button"
                onClick={() => setIsNewAdventureModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-black text-[#171313]/70 hover:bg-[#171313]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateManualAdventure}
                className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#6425F5] border-2 border-[#171313] shadow-pop hover:scale-105 transition-all cursor-pointer"
              >
                Save Adventure
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-warm-cream-grid">
          <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl shadow-pop flex items-center gap-3">
            <Route className="w-6 h-6 text-[#6425F5] stroke-[2.5]" />
            <span className="text-xs font-black text-[#171313]">
              Loading Adventures & Itineraries…
            </span>
          </div>
        </div>
      }
    >
      <WishlistContent />
    </Suspense>
  );
}
