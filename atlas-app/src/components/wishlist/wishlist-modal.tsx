'use client';

import React, { useState, useEffect } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { searchPlaces, GeocodingResult } from '@/lib/geocoding';
import { WishlistItem, Location } from '@/types';
import {
  BookmarkCheck,
  MapPin,
  Search,
  DollarSign,
  AlertCircle,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function WishlistModal() {
  const {
    isWishlistModalOpen,
    setWishlistModalOpen,
    editingWishlistItem,
    setEditingWishlistItem,
    setConvertingWishlistToExperience,
    pendingLocation,
    setPendingLocation,
    setExperienceModalOpen,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    locations,
    addLocation,
    categories,
    setFlyToTarget,
  } = useAtlasStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  // Location fields
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [venue, setVenue] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (editingWishlistItem) {
      setTitle(editingWishlistItem.title);
      setDescription(editingWishlistItem.description || '');
      setCategoryId(editingWishlistItem.category_id || '1');
      setPriority(editingWishlistItem.priority);
      setEstimatedBudget(editingWishlistItem.estimated_budget ? String(editingWishlistItem.estimated_budget) : '');
      setNotes(editingWishlistItem.notes || '');
      setSource(editingWishlistItem.source || '');
      setReferenceImageUrl(editingWishlistItem.reference_image_url || '');

      const loc = editingWishlistItem.location || locations.find((l) => l.id === editingWishlistItem.location_id);
      if (loc) {
        setLocationName(loc.name);
        setCity(loc.city || '');
        setCountry(loc.country);
        setVenue(loc.venue || '');
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        setPlaceId(loc.place_id);
      }
    } else if (pendingLocation) {
      setLocationName(pendingLocation.name || 'Selected Point on Earth');
      setCity(pendingLocation.city || '');
      setCountry(pendingLocation.country || '');
      setVenue(pendingLocation.venue || '');
      setLatitude(pendingLocation.latitude);
      setLongitude(pendingLocation.longitude);
      setTitle(pendingLocation.name ? `Visit ${pendingLocation.name}` : '');
      setPriority('medium');
    } else {
      resetForm();
    }
  }, [editingWishlistItem, pendingLocation, isWishlistModalOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('1');
    setPriority('medium');
    setEstimatedBudget('');
    setNotes('');
    setSource('');
    setReferenceImageUrl('');
    setLocationName('');
    setCity('');
    setCountry('');
    setVenue('');
    setLatitude(null);
    setLongitude(null);
    setPlaceId(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClose = () => {
    setWishlistModalOpen(false);
    setEditingWishlistItem(null);
    setPendingLocation(null);
    resetForm();
  };

  // Place search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectPlace = (place: GeocodingResult) => {
    setLocationName(place.name);
    setCity(place.city);
    setCountry(place.country);
    setVenue(place.venue || place.name);
    setLatitude(place.latitude);
    setLongitude(place.longitude);
    setPlaceId(place.place_id);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a wishlist title.');
      return;
    }

    let locId: string | null = null;
    let resolvedLocation: Location | undefined = undefined;

    if (locationName && latitude !== null && longitude !== null) {
      let targetLocation = locations.find(
        (l) =>
          (placeId && l.place_id === placeId) ||
          (Math.abs(l.latitude - latitude) < 0.0001 && Math.abs(l.longitude - longitude) < 0.0001)
      );

      if (!targetLocation) {
        targetLocation = {
          id: `loc-${Date.now()}`,
          name: locationName,
          city: city || null,
          country: country || 'Unknown',
          venue: venue || null,
          latitude,
          longitude,
          place_id: placeId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        addLocation(targetLocation);
      }
      locId = targetLocation.id;
      resolvedLocation = targetLocation;
    }

    const budgetNum = estimatedBudget ? parseFloat(estimatedBudget) : null;
    const cat = categories.find((c) => c.id === categoryId);
    const loc = resolvedLocation || (locId ? locations.find((l) => l.id === locId) : undefined);

    if (editingWishlistItem) {
      updateWishlistItem(editingWishlistItem.id, {
        title,
        description,
        category_id: categoryId,
        priority,
        estimated_budget: budgetNum,
        notes,
        source,
        reference_image_url: referenceImageUrl,
        location_id: locId,
        location: loc,
        category: cat,
      });
    } else {
      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        user_id: 'guest-user',
        title,
        location_id: locId,
        description,
        category_id: categoryId,
        priority,
        estimated_budget: budgetNum,
        notes,
        source: source || 'Personal Bucket List',
        reference_image_url: referenceImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        is_completed: false,
        completed_experience_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        location: loc,
        category: cat,
      };
      addWishlistItem(newItem);

      if (loc) {
        setFlyToTarget({
          latitude: loc.latitude,
          longitude: loc.longitude,
          altitude: 400000,
        });
      }
    }

    handleClose();
  };

  const handleConvertToExperience = () => {
    if (!editingWishlistItem) return;
    setConvertingWishlistToExperience(editingWishlistItem);
    handleClose();
    setExperienceModalOpen(true);
  };

  const handleDelete = () => {
    if (editingWishlistItem) {
      deleteWishlistItem(editingWishlistItem.id);
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isWishlistModalOpen}
      onClose={handleClose}
      title={editingWishlistItem ? 'Edit Bucket List Item' : 'Add to Geographical Wishlist'}
      description="Save a dream destination or future activity to explore on the globe."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Activity or Destination *"
          placeholder="e.g. Scuba Diving the Great Barrier Reef"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Priority & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-black text-[#171313] uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-white border-2 border-[#171313] rounded-2xl px-3.5 py-2 text-sm text-[#171313] focus:outline-none shadow-pop-sm font-black cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-[#171313] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white border-2 border-[#171313] rounded-2xl px-3.5 py-2 text-sm text-[#171313] focus:outline-none shadow-pop-sm font-black cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              type="number"
              label="Estimated Budget (USD)"
              placeholder="e.g. 800"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              leftIcon={<DollarSign className="w-3.5 h-3.5 text-[#171313]" />}
            />
          </div>
        </div>

        {/* Location Selection */}
        <div className="p-4 bg-white border-2 border-[#171313] rounded-3xl space-y-3 shadow-pop-sm">
          <label className="text-xs font-black text-[#171313] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F04432] stroke-[2.5]" />
            Target Coordinates on Globe (Optional)
          </label>

          <div className="relative">
            <Input
              placeholder="Search target place or country…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              leftIcon={<Search className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />}
            />

            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-[#171313] rounded-2xl shadow-pop-lg z-30 max-h-48 overflow-y-auto">
                {searchResults.map((place) => (
                  <div
                    key={place.place_id}
                    onClick={() => selectPlace(place)}
                    className="p-3 hover:bg-[#FFD45A]/30 cursor-pointer border-b-2 border-[#171313]/10 last:border-none transition-colors"
                  >
                    <p className="text-xs font-black text-[#171313] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                      {place.name}
                    </p>
                    <p className="text-[11px] text-[#171313]/70 mt-0.5 truncate pl-4.5 font-bold">
                      {place.display_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {locationName && (
            <div className="p-3 bg-[#FFF4D9] rounded-2xl border-2 border-[#171313] flex items-center justify-between text-xs shadow-pop-sm">
              <span className="font-black text-[#171313] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F04432] stroke-[2.5]" />
                {locationName} {city && `(${city}, ${country})`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLocationName('');
                  setLatitude(null);
                  setLongitude(null);
                }}
                className="text-[#171313] hover:text-[#F04432] p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        <Textarea
          label="Why you want to do this"
          placeholder="What makes this special? Inspiration notes, ideal season to visit…"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Reference Image URL"
          placeholder="https://images.unsplash.com/…"
          value={referenceImageUrl}
          onChange={(e) => setReferenceImageUrl(e.target.value)}
        />

        <div className="flex items-center justify-between pt-3 border-t border-[#1c1c22]">
          {editingWishlistItem ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="glow"
                size="sm"
                onClick={handleConvertToExperience}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
                <span>Mark as Experienced!</span>
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingWishlistItem ? 'Update Wishlist' : 'Save to Wishlist'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

