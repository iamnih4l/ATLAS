import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location, Experience, WishlistItem, AIRecommendation, Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Adventure', slug: 'adventure', icon: '🏔️', is_default: true, user_id: null, created_at: '' },
  { id: '2', name: 'Nature', slug: 'nature', icon: '🌿', is_default: true, user_id: null, created_at: '' },
  { id: '3', name: 'Food & Dining', slug: 'food-dining', icon: '🍽️', is_default: true, user_id: null, created_at: '' },
  { id: '4', name: 'Travel', slug: 'travel', icon: '✈️', is_default: true, user_id: null, created_at: '' },
  { id: '5', name: 'Sports', slug: 'sports', icon: '⚽', is_default: true, user_id: null, created_at: '' },
  { id: '6', name: 'Entertainment', slug: 'entertainment', icon: '🎭', is_default: true, user_id: null, created_at: '' },
  { id: '7', name: 'Culture', slug: 'culture', icon: '🏛️', is_default: true, user_id: null, created_at: '' },
  { id: '8', name: 'Architecture', slug: 'architecture', icon: '🏗️', is_default: true, user_id: null, created_at: '' },
  { id: '9', name: 'Technology', slug: 'technology', icon: '💻', is_default: true, user_id: null, created_at: '' },
  { id: '10', name: 'Events', slug: 'events', icon: '🎉', is_default: true, user_id: null, created_at: '' },
  { id: '11', name: 'Education', slug: 'education', icon: '📚', is_default: true, user_id: null, created_at: '' },
  { id: '12', name: 'Wildlife', slug: 'wildlife', icon: '🦁', is_default: true, user_id: null, created_at: '' },
  { id: '13', name: 'Photography', slug: 'photography', icon: '📷', is_default: true, user_id: null, created_at: '' },
  { id: '14', name: 'Personal Milestones', slug: 'personal-milestones', icon: '⭐', is_default: true, user_id: null, created_at: '' },
  { id: '15', name: 'Other', slug: 'other', icon: '📌', is_default: true, user_id: null, created_at: '' },
];

export interface FlyToTarget {
  latitude: number;
  longitude: number;
  altitude?: number;
  pitch?: number;
}

interface AtlasState {
  // Navigation & UI
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Active Modals
  isExperienceModalOpen: boolean;
  setExperienceModalOpen: (open: boolean) => void;
  isWishlistModalOpen: boolean;
  setWishlistModalOpen: (open: boolean) => void;
  editingExperience: Experience | null;
  setEditingExperience: (exp: Experience | null) => void;
  editingWishlistItem: WishlistItem | null;
  setEditingWishlistItem: (item: WishlistItem | null) => void;
  convertingWishlistToExperience: WishlistItem | null;
  setConvertingWishlistToExperience: (item: WishlistItem | null) => void;
  pendingLocation: { latitude: number; longitude: number; name?: string; city?: string; country?: string; venue?: string } | null;
  setPendingLocation: (loc: { latitude: number; longitude: number; name?: string; city?: string; country?: string; venue?: string } | null) => void;

  // Globe Selected Location & Camera
  selectedLocation: Location | null;
  setSelectedLocation: (loc: Location | null) => void;
  flyToTarget: FlyToTarget | null;
  setFlyToTarget: (target: FlyToTarget | null) => void;

  // Filters
  filterType: 'all' | 'experienced' | 'wishlist';
  setFilterType: (type: 'all' | 'experienced' | 'wishlist') => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data Store (Persisted in LocalStorage for guest mode & offline, synced with Supabase when logged in)
  locations: Location[];
  experiences: Experience[];
  wishlistItems: WishlistItem[];
  categories: Category[];
  recommendations: AIRecommendation[];

  // Actions for data
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  setExperiences: (experiences: Experience[]) => void;
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;

  setWishlistItems: (items: WishlistItem[]) => void;
  addWishlistItem: (item: WishlistItem) => void;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;

  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;

  setRecommendations: (recs: AIRecommendation[]) => void;
  saveRecommendationToWishlist: (recOrId: string | AIRecommendation) => void;
}

export const useAtlasStore = create<AtlasState>()(
  persist(
    (set, get) => ({
      isSidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      isExperienceModalOpen: false,
      setExperienceModalOpen: (open) => set({ isExperienceModalOpen: open }),
      isWishlistModalOpen: false,
      setWishlistModalOpen: (open) => set({ isWishlistModalOpen: open }),
      editingExperience: null,
      setEditingExperience: (exp) => set({ editingExperience: exp }),
      editingWishlistItem: null,
      setEditingWishlistItem: (item) => set({ editingWishlistItem: item }),
      convertingWishlistToExperience: null,
      setConvertingWishlistToExperience: (item) => set({ convertingWishlistToExperience: item }),
      pendingLocation: null,
      setPendingLocation: (loc) => set({ pendingLocation: loc }),

      selectedLocation: null,
      setSelectedLocation: (loc) => set({ selectedLocation: loc }),
      flyToTarget: null,
      setFlyToTarget: (target) => set({ flyToTarget: target }),

      filterType: 'all',
      setFilterType: (type) => set({ filterType: type }),
      selectedCategory: null,
      setSelectedCategory: (catId) => set({ selectedCategory: catId }),
      selectedYear: null,
      setSelectedYear: (year) => set({ selectedYear: year }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      locations: [],
      experiences: [],
      wishlistItems: [],
      categories: DEFAULT_CATEGORIES,
      recommendations: [],

      setLocations: (locations) => set({ locations }),
      addLocation: (location) => {
        const existing = get().locations.find(
          (l) =>
            (l.place_id && l.place_id === location.place_id) ||
            (Math.abs(l.latitude - location.latitude) < 0.0001 && Math.abs(l.longitude - location.longitude) < 0.0001)
        );
        if (!existing) {
          set((state) => ({ locations: [...state.locations, location] }));
        }
      },

      setExperiences: (experiences) => set({ experiences }),
      addExperience: (experience) => {
        if (experience.location) {
          get().addLocation(experience.location);
        }
        set((state) => ({ experiences: [experience, ...state.experiences] }));
      },
      updateExperience: (id, updates) => {
        set((state) => ({
          experiences: state.experiences.map((exp) =>
            exp.id === id ? { ...exp, ...updates, updated_at: new Date().toISOString() } : exp
          ),
        }));
      },
      deleteExperience: (id) => {
        set((state) => ({
          experiences: state.experiences.filter((exp) => exp.id !== id),
        }));
      },

      setWishlistItems: (items) => set({ wishlistItems: items }),
      addWishlistItem: (item) => {
        if (item.location) {
          get().addLocation(item.location);
        }
        set((state) => ({ wishlistItems: [item, ...state.wishlistItems] }));
      },
      updateWishlistItem: (id, updates) => {
        set((state) => ({
          wishlistItems: state.wishlistItems.map((item) =>
            item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
          ),
        }));
      },
      deleteWishlistItem: (id) => {
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((item) => item.id !== id),
        }));
      },

      setCategories: (categories) => set({ categories }),
      addCategory: (category) => {
        set((state) => ({ categories: [...state.categories, category] }));
      },

      setRecommendations: (recommendations) => set({ recommendations }),
      saveRecommendationToWishlist: (recOrId) => {
        let rec: AIRecommendation | undefined;
        if (typeof recOrId === 'string') {
          rec = get().recommendations.find((r) => r.id === recOrId);
        } else {
          rec = recOrId;
        }
        if (!rec) return;

        let locId: string | null = null;
        let targetLoc: Location | undefined = undefined;

        if (rec.latitude && rec.longitude) {
          const existingLoc = get().locations.find(
            (l) => Math.abs(l.latitude - rec.latitude!) < 0.001 && Math.abs(l.longitude - rec.longitude!) < 0.001
          );
          if (existingLoc) {
            locId = existingLoc.id;
            targetLoc = existingLoc;
          } else {
            const newLoc: Location = {
              id: `loc-${Date.now()}`,
              name: rec.location_name,
              city: null,
              country: '',
              venue: null,
              latitude: rec.latitude,
              longitude: rec.longitude,
              place_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            get().addLocation(newLoc);
            locId = newLoc.id;
            targetLoc = newLoc;
          }
        }

        const newWishlist: WishlistItem = {
          id: `wish-${Date.now()}`,
          user_id: 'guest-user',
          title: rec.title,
          location_id: locId,
          description: `${rec.description}\n\nWhy recommended: ${rec.reason}`,
          category_id: '1',
          priority: 'high',
          estimated_budget: null,
          notes: rec.reason,
          source: 'AI Companion Recommendation',
          reference_image_url: rec.image_url,
          is_completed: false,
          completed_experience_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          location: targetLoc,
        };

        get().addWishlistItem(newWishlist);

        if (targetLoc) {
          get().setFlyToTarget({
            latitude: targetLoc.latitude,
            longitude: targetLoc.longitude,
            altitude: 400000,
          });
        }

        set((state) => ({
          recommendations: state.recommendations.map((r) =>
            r.id === rec!.id ? { ...r, is_saved: true } : r
          ),
        }));
      },
    }),
    {
      name: 'atlas_user_cache_v1',
      partialize: (state) => ({
        locations: state.locations,
        experiences: state.experiences,
        wishlistItems: state.wishlistItems,
        categories: state.categories,
      }),
    }
  )
);
