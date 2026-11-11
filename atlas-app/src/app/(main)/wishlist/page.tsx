'use client';

import React, { useState, useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookmarkCheck,
  Plus,
  MapPin,
  DollarSign,
  Sparkles,
  Globe2,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const {
    wishlistItems,
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
    if (item.location) {
      setFlyToTarget({
        latitude: item.location.latitude,
        longitude: item.location.longitude,
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
            Geographical Bucket List
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Pin the adventures, landscapes, and venues you dream of experiencing next.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingWishlistItem(null);
            setWishlistModalOpen(true);
          }}
          variant="glow"
          size="md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Wishlist Item</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121215] border border-[#27272a] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                priorityFilter === p
                  ? 'bg-violet-600 text-white font-semibold glow-violet-subtle'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#18181f]'
              }`}
            >
              {p} Priority
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[#a1a1aa] cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-[#27272a] bg-[#18181f] text-emerald-500 focus:ring-emerald-500/30"
            />
            <span>Show Completed ({wishlistItems.filter((w) => w.is_completed).length})</span>
          </label>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#101014] border border-[#1e1e24] rounded-2xl p-8 space-y-3">
          <BookmarkCheck className="w-10 h-10 text-[#3f3f46] mx-auto" />
          <h3 className="text-sm font-semibold text-[#f5f5f0]">No wishlist items found</h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            Browse AI recommendations on the Discover tab or manually add future dreams here.
          </p>
          <Button
            onClick={() => {
              setEditingWishlistItem(null);
              setWishlistModalOpen(true);
            }}
            variant="primary"
            size="sm"
            className="mt-2"
          >
            Add New Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleEdit(item)}
              className={`border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                item.is_completed
                  ? 'bg-[#101311] border-emerald-900/30 opacity-70'
                  : 'bg-[#121215] border-[#23232b] hover:border-violet-500/40'
              }`}
            >
              <div>
                {/* Reference Image */}
                <div className="aspect-[16/10] relative overflow-hidden bg-[#18181f]">
                  <img
                    src={item.reference_image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge
                      variant={item.priority === 'high' ? 'rose' : item.priority === 'medium' ? 'violet' : 'outline'}
                      size="sm"
                      className="bg-black/70 backdrop-blur-md capitalize"
                    >
                      {item.priority} Priority
                    </Badge>
                  </div>
                  {item.is_completed && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 text-black px-2.5 py-0.5 rounded-full flex items-center gap-1 text-xs font-bold shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed!</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-[#f5f5f0] group-hover:text-violet-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {item.location && (
                    <p className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
                      <span>{item.location.name}</span>
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.estimated_budget && (
                    <p className="text-[11px] text-emerald-400/90 font-mono flex items-center gap-1 pt-1">
                      <DollarSign className="w-3 h-3" />
                      Estimated: ${item.estimated_budget.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-4 py-3 border-t border-[#1c1c22] bg-[#0e0e12] flex items-center justify-between gap-2">
                {item.location ? (
                  <Link
                    href="/globe"
                    onClick={(e) => handleFly(e, item)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                  >
                    <Globe2 className="w-3 h-3" /> Globe Pin
                  </Link>
                ) : (
                  <span className="text-[10px] text-[#52525b]">No coordinates</span>
                )}

                {!item.is_completed ? (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={(e) => handleConvert(e, item)}
                    className="text-xs py-1"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-950" />
                    <span>Done! Record It</span>
                  </Button>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Journal
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
