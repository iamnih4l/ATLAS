'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WashiTape, DoodleSparkle, DoodleUnderline } from '@/components/ui/doodles';
import { PixelBalloon, PixelPlane } from '@/components/ui/pixel-stickers';
import { ChillCloud, StarSpike } from '@/components/ui/mascot-doodles';
import { VerifiedStamp, TicketBadge } from '@/components/ui/atlas-illustrations';

export default function WishlistPage() {
  const {
    wishlistItems,
    locations,
    setWishlistModalOpen,
    setEditingWishlistItem,
    setConvertingWishlistToExperience,
    setExperienceModalOpen,
    deleteWishlistItem,
    setFlyToTarget,
  } = useAtlasStore();

  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      if (!showCompleted && item.is_completed) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      return true;
    });
  }, [wishlistItems, priorityFilter, showCompleted]);

  const handleEdit = (item: any) => {
    setEditingWishlistItem(item);
    setWishlistModalOpen(true);
  };

  const handleConvert = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setConvertingWishlistToExperience(item);
    setExperienceModalOpen(true);
  };

  const handleFly = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const loc = item.location || locations.find((l) => l.id === item.location_id);
    if (loc && loc.latitude !== undefined && loc.longitude !== undefined) {
      setFlyToTarget({
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: 400000,
      });
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
                Geographical Bucket List
              </h1>
              <DoodleUnderline className="text-[#FFD45A] mt-0.5" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFD45A] text-[#171313] border-2 border-[#171313] shadow-pop-sm">
              {wishlistItems.filter((w) => !w.is_completed).length} dreams pinned ✦
            </span>
            <DoodleSparkle size={20} color="#F04432" />
          </div>
          <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
            Pin the adventures, landscapes, and hidden venues you dream of experiencing next.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWishlistItem(null);
            setWishlistModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Dream Location</span>
        </button>
      </div>

      {/* Filter Bar with Bento-Pop Styling */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-[#171313] p-3.5 rounded-2xl shadow-pop">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => {
            const isSelected = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer border-2 border-[#171313]',
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

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-black text-[#171313] cursor-pointer bg-[#FFF4D9] px-3 py-1.5 rounded-xl border-2 border-[#171313] shadow-pop-sm">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-2 border-[#171313] text-[#F04432] focus:ring-[#F04432]"
            />
            <span>Show Completed ({wishlistItems.filter((w) => w.is_completed).length})</span>
          </label>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-14 bg-white border-2 border-[#171313] rounded-3xl p-8 space-y-4 shadow-pop-lg max-w-xl mx-auto my-8 relative overflow-hidden">
          {/* Top Folder Tab */}
          <div className="absolute top-2 left-6 z-10 flex items-center gap-1.5 px-3 py-0.5 rounded-t-lg bg-[#FFD45A] border-2 border-[#171313] border-b-0 text-[10px] font-black text-[#171313] uppercase tracking-widest shadow-pop-sm">
            📁 BUCKET LIST FOLDER
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <ChillCloud size={46} />
            <div className="w-16 h-16 rounded-3xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center shadow-pop">
              <PixelBalloon size={36} />
            </div>
            <StarSpike size={42} />
          </div>

          <h3 className="text-lg font-black text-[#171313]">Your Bucket List is Ready</h3>
          <p className="text-xs text-[#171313]/70 font-bold max-w-sm mx-auto leading-relaxed">
            Dreaming of exploring somewhere special? Pin future adventures and hidden spots to your geographical wishlist!
          </p>
          <button
            onClick={() => {
              setEditingWishlistItem(null);
              setWishlistModalOpen(true);
            }}
            className="mt-3 px-6 py-3 rounded-full text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add First Dream Location</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => {
            const isHigh = item.priority === 'high';
            const isLow = item.priority === 'low';

            return (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                className={cn(
                  'relative bg-white border-2 border-[#171313] rounded-3xl p-4 pb-4 cursor-pointer transition-all duration-300 group flex flex-col justify-between shadow-pop hover:shadow-pop-lg hover:-translate-y-1',
                  idx % 2 === 0 ? '-rotate-[0.75deg] hover:rotate-0' : 'rotate-[0.75deg] hover:rotate-0',
                  item.is_completed ? 'bg-emerald-50/60' : 'bg-white'
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
                      src={item.reference_image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-[#171313] shadow-pop-sm',
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
                    {item.is_completed && (
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
                  <Link
                    href="/globe"
                    onClick={(e) => handleFly(e, item)}
                    className="text-xs text-[#171313] hover:text-[#6425F5] font-black flex items-center gap-1"
                  >
                    <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" /> Fly on Earth
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {!item.is_completed && (
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
  );
}
