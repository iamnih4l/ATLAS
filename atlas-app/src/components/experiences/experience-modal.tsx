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
} from 'lucide-react';

export function ExperienceModal() {
  const {
    isExperienceModalOpen,
    setExperienceModalOpen,
    editingExperience,
    setEditingExperience,
    convertingWishlistToExperience,
    setConvertingWishlistToExperience,
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
    } else {
      resetForm();
    }
  }, [editingExperience, convertingWishlistToExperience, isExperienceModalOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setRating(5.0);
    setCategoryId('1');
    setPrivacy('private');
    setNotes('');
    setTags([]);
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EXIF GPS Suggestion Banner */}
          {exifSuggestion && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5 text-xs text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-300">
                    GPS Coordinates Detected in Photo!
                  </p>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Found location: <span className="font-medium text-white">{exifSuggestion.name}</span>
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
                placeholder="e.g. Tandem Skydive over the Palm"
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
          <div className="p-4 bg-[#0e0e12] border border-[#27272a] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Real-World Location *
              </label>
              {latitude !== null && longitude !== null && (
                <Badge variant="emerald" size="sm">
                  Verified Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Badge>
              )}
            </div>

            {/* Location Search Bar */}
            <div className="relative">
              <Input
                placeholder="Search real venue or landmark (e.g. Skydive Dubai, Niagara Falls, Eiffel Tower)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                leftIcon={<Search className="w-4 h-4 text-emerald-400" />}
              />

              {/* Autocomplete Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#141418] border border-[#2a2a32] rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto">
                  {searchResults.map((place) => (
                    <div
                      key={place.place_id}
                      onClick={() => selectPlace(place)}
                      className="p-2.5 hover:bg-[#1f1f26] cursor-pointer border-b border-[#1c1c22] last:border-none transition-colors"
                    >
                      <p className="text-xs font-medium text-[#f5f5f0] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        {place.name}
                      </p>
                      <p className="text-[11px] text-[#71717a] mt-0.5 truncate pl-4.5">
                        {place.display_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Pill */}
            {locationName ? (
              <div className="p-3 bg-[#16161b] rounded-lg border border-[#23232b] flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#f5f5f0]">{locationName}</p>
                  <p className="text-[11px] text-[#71717a]">
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
                  className="text-[#71717a] hover:text-rose-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#52525b] italic">
                No location chosen yet. Type in search bar above to geocode exact coordinates.
              </p>
            )}
          </div>

          {/* Section: Category & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#121215] border border-[#27272a] rounded-lg px-3.5 py-2 text-sm text-[#f5f5f0] focus:outline-none focus:border-emerald-500/70"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
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

          {/* Section: Description */}
          <Textarea
            label="Personal Description & Story"
            placeholder="Tell the story of this memory. How did it feel? What did you see? Who were you with?"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Section: Photos & Media Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Photographs & Media
              </label>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsDriveModalOpen(true)}
              >
                <Cloud className="w-3 h-3 text-emerald-400" />
                Import from Drive
              </Button>
            </div>

            {/* Photo Preview or Dropzone */}
            {coverImageUrl ? (
              <div className="relative rounded-xl overflow-hidden aspect-video max-h-48 border border-[#27272a] group">
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
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
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#27272a] hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#0e0e12]"
              >
                <Upload className="w-6 h-6 text-[#71717a] mx-auto mb-2" />
                <p className="text-xs text-[#f5f5f0] font-medium">
                  Upload a photograph or drag and drop
                </p>
                <p className="text-[11px] text-[#71717a] mt-1">
                  Supports JPG, PNG, WebP, HEIC • Auto-extracts GPS & Date EXIF
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
              <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5" /> Tags
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
                      className="ml-1 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="w-full bg-[#121215] border border-[#27272a] rounded-lg px-3.5 py-2 text-sm text-[#f5f5f0] focus:outline-none focus:border-emerald-500/70"
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
