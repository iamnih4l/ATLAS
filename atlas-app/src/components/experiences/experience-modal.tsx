'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { searchPlaces, GeocodingResult } from '@/lib/geocoding';
import { extractExifFromPhoto, PhotoLocationSuggestion } from '@/lib/exif-extractor';
import { GoogleDriveModal } from './google-drive-modal';
import { cn } from '@/lib/utils';
import { Experience, Location } from '@/types';
import {
  MapPin,
  Search,
  Upload,
  Camera,
  Calendar,
  Lock,
  Tag as TagIcon,
  Sparkles,
  Trash2,
  X,
  AlertCircle,
  Cloud,
  Check,
  Smile,
} from 'lucide-react';
import { TRAVEL_MOODS, JoyBlob, StarSpike, WanderBlob, ChillCloud, SunDoodle } from '@/components/ui/mascot-doodles';
import { WashiTape, PassportStamp } from '@/components/ui/doodles';

export function ExperienceModal() {
  const {
    isExperienceModalOpen,
    setExperienceModalOpen,
    editingExperience,
    setEditingExperience,
    convertingWishlistToExperience,
    setConvertingWishlistToExperience,
    pendingLocation,
    setPendingLocation,
    addExperience,
    updateExperience,
    deleteExperience,
    locations,
    addLocation,
    categories,
    setFlyToTarget,
  } = useAtlasStore();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState<number | null>(5.0);
  const [categoryId, setCategoryId] = useState('1');
  const [privacy, setPrivacy] = useState<'private' | 'unlisted' | 'public'>('private');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('joy');

  // Location Fields
  const [locationName, setLocationName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [venue, setVenue] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);

  // Place Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // EXIF Suggestion Prompt State
  const [exifSuggestion, setExifSuggestion] = useState<PhotoLocationSuggestion | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form
  useEffect(() => {
    if (editingExperience) {
      setTitle(editingExperience.title);
      setDescription(editingExperience.description || '');
      setDate(editingExperience.date);
      setRating(editingExperience.rating);
      setCategoryId(editingExperience.category_id || '1');
      setPrivacy(editingExperience.privacy);
      setNotes(editingExperience.notes || '');
      setCoverImageUrl(editingExperience.cover_image_url || '');

      const loc = editingExperience.location || locations.find((l) => l.id === editingExperience.location_id);
      if (loc) {
        setLocationName(loc.name);
        setCity(loc.city || '');
        setCountry(loc.country);
        setVenue(loc.venue || '');
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        setPlaceId(loc.place_id);
      }
    } else if (convertingWishlistToExperience) {
      // Converting from wishlist to actual experience!
      setTitle(convertingWishlistToExperience.title);
      setDescription(convertingWishlistToExperience.description || '');
      setDate(new Date().toISOString().split('T')[0]);
      setRating(5.0);
      setCategoryId(convertingWishlistToExperience.category_id || '1');
      setNotes(convertingWishlistToExperience.notes || '');
      setCoverImageUrl(convertingWishlistToExperience.reference_image_url || '');

      const loc = convertingWishlistToExperience.location || locations.find((l) => l.id === convertingWishlistToExperience.location_id);
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
      // Pre-filled from clicking directly on 3D Earth!
      setLocationName(pendingLocation.name || 'Selected Point on Earth');
      setCity(pendingLocation.city || '');
      setCountry(pendingLocation.country || '');
      setVenue(pendingLocation.venue || '');
      setLatitude(pendingLocation.latitude);
      setLongitude(pendingLocation.longitude);
      setTitle(pendingLocation.name ? `Trip to ${pendingLocation.name}` : '');
      setDate(new Date().toISOString().split('T')[0]);
      setRating(5.0);
      setCategoryId('1');
    } else {
      resetForm();
    }
  }, [editingExperience, convertingWishlistToExperience, pendingLocation, isExperienceModalOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setRating(5.0);
    setCategoryId('1');
    setPrivacy('private');
    setNotes('');
    setTags([]);
    setSelectedMood('joy');
    setCoverImageUrl('');
    setLocationName('');
    setCity('');
    setCountry('');
    setVenue('');
    setLatitude(null);
    setLongitude(null);
    setPlaceId(null);
    setSearchQuery('');
    setSearchResults([]);
    setExifSuggestion(null);
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setExperienceModalOpen(false);
    setEditingExperience(null);
    setConvertingWishlistToExperience(null);
    setPendingLocation(null);
    resetForm();
  };

  // Place search with debouncing
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
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

  // Handle Photo Upload with EXIF extraction
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);

    // Create local preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverImageUrl(previewUrl);

    // Extract EXIF & GPS
    const { exif, suggestion } = await extractExifFromPhoto(file);

    if (suggestion) {
      setExifSuggestion(suggestion);
    } else if (exif.dateTime) {
      setDate(exif.dateTime);
    }

    setIsProcessingPhoto(false);
  };

  const applyExifSuggestion = () => {
    if (!exifSuggestion) return;
    setLocationName(exifSuggestion.name);
    setCity(exifSuggestion.city);
    setCountry(exifSuggestion.country);
    setVenue(exifSuggestion.venue);
    setLatitude(exifSuggestion.latitude);
    setLongitude(exifSuggestion.longitude);
    if (exifSuggestion.date) {
      setDate(exifSuggestion.date);
    }
    setExifSuggestion(null);
  };

  // Add Tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Save Experience
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an experience title.');
      return;
    }

    if (!locationName.trim() || latitude === null || longitude === null) {
      alert('Please search and select a real-world location.');
      return;
    }

    // Step 1: Ensure location entity exists in database without duplicating
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

    const selectedCategory = categories.find((c) => c.id === categoryId);

    // Step 2: Create or update experience referencing this location
    if (editingExperience) {
      updateExperience(editingExperience.id, {
        title,
        description,
        date,
        rating,
        category_id: categoryId,
        privacy,
        notes,
        cover_image_url: coverImageUrl || editingExperience.cover_image_url,
        location_id: targetLocation.id,
        location: targetLocation,
        category: selectedCategory,
      });
    } else {
      const newExperience: Experience = {
        id: `exp-${Date.now()}`,
        user_id: 'demo-user',
        location_id: targetLocation.id,
        title,
        description,
        date,
        rating,
        category_id: categoryId,
        privacy,
        notes,
        cover_image_url: coverImageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        location: targetLocation,
        category: selectedCategory,
      };

      addExperience(newExperience);

      // If this came from a wishlist item, mark that item completed!
      if (convertingWishlistToExperience) {
        useAtlasStore.getState().updateWishlistItem(convertingWishlistToExperience.id, {
          is_completed: true,
          completed_experience_id: newExperience.id,
        });
      }

      // Fly to new location on globe
      setFlyToTarget({
        latitude: targetLocation.latitude,
        longitude: targetLocation.longitude,
        altitude: 400000,
      });
    }

    handleClose();
  };

  const handleDelete = () => {
    if (editingExperience) {
      deleteExperience(editingExperience.id);
      handleClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isExperienceModalOpen}
        onClose={handleClose}
        title={editingExperience ? 'Edit Experience' : convertingWishlistToExperience ? 'Convert Wishlist to Experience' : 'Log New Experience'}
        description="Preserve your real-world journey with verified coordinates, photographs and notes."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Indicator Pills inspired by PLANETON O */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-black">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-pop-sm inline-flex items-center gap-1.5 shrink-0">
              <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-[10px]">1</span>
              <span>Coordinates</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-slate-800 border-2 border-slate-900 shadow-pop-sm inline-flex items-center gap-1.5 shrink-0">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">2</span>
              <span>Memory Story</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-slate-800 border-2 border-slate-900 shadow-pop-sm inline-flex items-center gap-1.5 shrink-0">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">3</span>
              <span>Vibe & Mascot</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-slate-800 border-2 border-slate-900 shadow-pop-sm inline-flex items-center gap-1.5 shrink-0">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">4</span>
              <span>Polaroid</span>
            </span>
          </div>

          {/* EXIF GPS Suggestion Banner */}
          {exifSuggestion && (
            <div className="p-3.5 bg-amber-100 border-2 border-slate-900 rounded-2xl space-y-2 shadow-pop-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5 text-xs text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600 stroke-[2.5] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-black text-slate-900">
                    GPS Coordinates Detected in Photo!
                  </p>
                  <p className="text-[11px] text-amber-900 mt-0.5 font-bold">
                    Found location: <span className="underline decoration-2">{exifSuggestion.name}</span>
                    {exifSuggestion.date && ` • Taken: ${exifSuggestion.date}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={applyExifSuggestion}
                >
                  Confirm & Apply Location
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setExifSuggestion(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Section: Title & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Input
                label="Experience Title *"
                placeholder="e.g. Sunrise Hot Air Ballooning in Cappadocia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="date"
                label="Date *"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                required
              />
            </div>
          </div>

          {/* Section: Location Selection with Real Geocoding */}
          <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl space-y-3 shadow-pop-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
                Real-World Location *
              </label>
              {latitude !== null && longitude !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-slate-900 shadow-2xs">
                  GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              )}
            </div>

            {/* Location Search Bar */}
            <div className="relative">
              <Input
                placeholder="Search real venue or landmark (e.g. Skydive Dubai, Kyoto Fushimi Inari, Taj Mahal)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                leftIcon={<Search className="w-4 h-4 text-amber-500 stroke-[2.5]" />}
              />

              {/* Autocomplete Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-slate-900 rounded-2xl shadow-pop-lg z-30 max-h-56 overflow-y-auto">
                  {searchResults.map((place) => (
                    <div
                      key={place.place_id}
                      onClick={() => selectPlace(place)}
                      className="p-3 hover:bg-amber-100/60 cursor-pointer border-b border-slate-200 last:border-none transition-colors"
                    >
                      <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.5]" />
                        {place.name}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate pl-5 font-medium">
                        {place.display_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Pill */}
            {locationName ? (
              <div className="p-3 bg-amber-50 rounded-xl border-2 border-slate-900 flex items-center justify-between text-xs shadow-pop-sm">
                <div>
                  <p className="font-black text-slate-900">{locationName}</p>
                  <p className="text-[11px] text-slate-600 font-bold">
                    {[venue, city, country].filter(Boolean).join(' • ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocationName('');
                    setLatitude(null);
                    setLongitude(null);
                  }}
                  className="text-slate-900 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic font-medium">
                No location chosen yet. Type above to verify real geographical coordinates.
              </p>
            )}
          </div>

          {/* Section: Category & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border-2 border-slate-900 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none shadow-pop-sm font-bold cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Personal Rating (0.5 – 5.0)
              </label>
              <div className="pt-1">
                <StarRating
                  value={rating}
                  onChange={(r) => setRating(r)}
                  size="lg"
                  showNumber
                />
              </div>
            </div>
          </div>

          {/* Interactive Mood & Vibe Selector inspired by Suntera */}
          <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl space-y-2.5 shadow-pop-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                What Was The Mood / Vibe? (Inspired by Suntera)
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TRAVEL_MOODS.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={cn(
                      'p-2.5 rounded-2xl border-2 border-slate-900 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                      isSelected
                        ? `${m.color} ${m.textColor} shadow-pop scale-105 font-black`
                        : 'bg-white text-slate-700 hover:bg-slate-50 font-bold shadow-2xs'
                    )}
                  >
                    {m.mascot}
                    <span className="text-[11px] mt-0.5">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Description */}
          <Textarea
            label="Personal Description & Travel Story"
            placeholder="Tell the story of this memory. How did it feel? What did you smell, taste, or see? Who was there with you?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Section: Photos & Media Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                Photographs & Polaroid Media
              </label>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsDriveModalOpen(true)}
              >
                <Cloud className="w-3 h-3 text-emerald-600" />
                Import from Drive
              </Button>
            </div>

            {/* Photo Preview with Polaroid Washi Tape Frame */}
            {coverImageUrl ? (
              <div className="relative p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-pop-sm group max-w-sm mx-auto">
                {/* Washi Tape Strip */}
                <WashiTape className="absolute -top-3 left-1/2 -translate-x-1/2 z-20" rotate="-2deg" color="bg-amber-300/90" />
                <div className="relative rounded-xl overflow-hidden aspect-video border-2 border-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => setCoverImageUrl('')}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <p className="text-center text-[10px] font-black text-slate-500 mt-2 font-serif uppercase tracking-widest">
                  ★ TRAVEL SNAPSHOT ★
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-900 hover:bg-amber-50/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white shadow-pop-sm"
              >
                <Upload className="w-6 h-6 text-amber-500 mx-auto mb-2 stroke-[2.5]" />
                <p className="text-xs text-slate-900 font-black">
                  Upload a travel photo or drag and drop
                </p>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  Auto-extracts GPS Coordinates & Date from EXIF headers
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Section: Tags & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" /> Tags
              </label>
              <Input
                placeholder="Press Enter to add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <Badge key={t} variant="default" size="sm">
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ml-1 hover:text-rose-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" /> Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="w-full bg-white border-2 border-slate-900 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none shadow-pop-sm font-bold cursor-pointer"
              >
                <option value="private">Private (Encrypted for you alone)</option>
                <option value="unlisted">Unlisted (Accessible by secret link)</option>
                <option value="public">Public (Shared with community)</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <Textarea
            label="Optional Private Notes"
            placeholder="Equipment used, budget spent, ticket details, weather conditions…"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs space-y-2">
              <p className="font-semibold text-rose-300">
                Are you sure you want to permanently delete this memory?
              </p>
              <p className="text-[11px] text-rose-200/70">
                This will remove the journal entry and detached media. The geographical location will remain preserved in your atlas if other memories reference it.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                >
                  Confirm Delete
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1c1c22]">
            {editingExperience ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Experience
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingExperience ? 'Save Changes' : 'Record Memory'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Google Drive Import Submodal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSelectPhoto={(url, name) => {
          setCoverImageUrl(url);
          if (!title) setTitle(name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
        }}
      />
    </>
  );
}

