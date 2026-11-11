import { create } from 'zustand';
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

  // Globe Selected Location
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

  // Data Store (in-memory cache synced with Supabase / local persistence)
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
  saveRecommendationToWishlist: (recId: string) => void;
}

// Initial sample data so user immediately sees a working atlas even before cloud sync
const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Skydive Dubai — Palm Dropzone',
    city: 'Dubai',
    country: 'United Arab Emirates',
    venue: 'Palm Jumeirah',
    latitude: 25.0931,
    longitude: 55.1384,
    place_id: 'ChIJjQk1z3VpXz4R3GqD7Tq819k',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 'loc-2',
    name: 'Niagara Falls (Horseshoe Falls)',
    city: 'Niagara Falls',
    country: 'Canada',
    venue: 'Table Rock Welcome Centre',
    latitude: 43.0799,
    longitude: -79.0747,
    place_id: 'ChIJV4S1d6rO04kRzGZ_0W5gX7E',
    created_at: '2024-06-20T14:30:00Z',
    updated_at: '2024-06-20T14:30:00Z',
  },
  {
    id: 'loc-3',
    name: 'Fushimi Inari Taisha',
    city: 'Kyoto',
    country: 'Japan',
    venue: 'Mount Inari',
    latitude: 34.9671,
    longitude: 135.7727,
    place_id: 'ChIJC3qP0wYIAWAR70i1V9pC37Q',
    created_at: '2024-11-04T10:15:00Z',
    updated_at: '2024-11-04T10:15:00Z',
  },
  {
    id: 'loc-4',
    name: 'Eiffel Tower Summit',
    city: 'Paris',
    country: 'France',
    venue: 'Champ de Mars',
    latitude: 48.8584,
    longitude: 2.2945,
    place_id: 'ChIJLU7jZClu5kcR4PcOOO6p3VQ',
    created_at: '2023-09-12T18:00:00Z',
    updated_at: '2023-09-12T18:00:00Z',
  },
  {
    id: 'loc-5',
    name: 'Bioluminescent Mosquito Bay',
    city: 'Vieques',
    country: 'Puerto Rico',
    venue: 'Puerto Mosquito',
    latitude: 18.1027,
    longitude: -65.4485,
    place_id: 'ChIJz2x_s9wHA4wRM0Q5r3vV4bA',
    created_at: '2024-03-18T21:00:00Z',
    updated_at: '2024-03-18T21:00:00Z',
  },
  {
    id: 'loc-6',
    name: 'Machu Picchu Historic Sanctuary',
    city: 'Cusco Region',
    country: 'Peru',
    venue: 'Inca Citadel',
    latitude: -13.1631,
    longitude: -72.5450,
    place_id: 'ChIJw0sR7ySgbZERd0o9E39QnFw',
    created_at: '2024-08-10T08:00:00Z',
    updated_at: '2024-08-10T08:00:00Z',
  }
];

const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    user_id: 'demo-user',
    location_id: 'loc-1',
    title: 'Tandem Jump over the Palm',
    description: 'Breathtaking 13,000ft freefall overlooking the Palm Jumeirah and the Arabian Gulf. Heart in mouth for the first 60 seconds, then pure serene bliss under the canopy.',
    date: '2025-01-15',
    rating: 5.0,
    category_id: '1', // Adventure
    privacy: 'private',
    notes: 'Wind speed was 12 knots. Jumped with instructor Mike from South Africa.',
    cover_image_url: 'https://images.unsplash.com/photo-1521673845961-d646f903c743?auto=format&fit=crop&w=1200&q=80',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:00:00Z',
    location: INITIAL_LOCATIONS[0],
    category: DEFAULT_CATEGORIES[0],
  },
  {
    id: 'exp-2',
    user_id: 'demo-user',
    location_id: 'loc-2',
    title: 'Mist and Roar: Voyage to the Falls',
    description: 'Boarded the catamaran right into the basin of Horseshoe Falls. The roar vibrates in your chest. Poncho did little against the cloud of mist, but the raw power was unforgettable.',
    date: '2024-06-20',
    rating: 4.5,
    category_id: '2', // Nature
    privacy: 'private',
    notes: 'Took the morning boat at 10 AM before peak tourist crowds.',
    cover_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    created_at: '2024-06-20T14:30:00Z',
    updated_at: '2024-06-20T14:30:00Z',
    location: INITIAL_LOCATIONS[1],
    category: DEFAULT_CATEGORIES[1],
  },
  {
    id: 'exp-3',
    user_id: 'demo-user',
    location_id: 'loc-3',
    title: 'Early Morning Torii Gates Hike',
    description: 'Started the ascent at 5:30 AM in silence before the crowds arrived. Thousands of vermillion torii gates winding through ancient cedar forest. Cold mountain air and distant temple bells.',
    date: '2024-11-04',
    rating: 5.0,
    category_id: '7', // Culture
    privacy: 'private',
    notes: 'Reached the summit viewpoint just as morning sunlight hit the Kyoto basin.',
    cover_image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    created_at: '2024-11-04T10:15:00Z',
    updated_at: '2024-11-04T10:15:00Z',
    location: INITIAL_LOCATIONS[2],
    category: DEFAULT_CATEGORIES[6],
  },
  {
    id: 'exp-4',
    user_id: 'demo-user',
    location_id: 'loc-4',
    title: 'Twilight Champagne on the Summit',
    description: 'Ascended to the highest accessible platform at twilight. Watching the City of Light turn on its golden illumination beneath us was a lifetime milestone.',
    date: '2023-09-12',
    rating: 4.8,
    category_id: '8', // Architecture
    privacy: 'private',
    notes: 'Booked summit tickets 3 months in advance.',
    cover_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    created_at: '2023-09-12T18:00:00Z',
    updated_at: '2023-09-12T18:00:00Z',
    location: INITIAL_LOCATIONS[3],
    category: DEFAULT_CATEGORIES[7],
  },
  {
    id: 'exp-5',
    user_id: 'demo-user',
    location_id: 'loc-2', // Second experience at the same location (Niagara)
    title: 'Journey Behind the Falls & Night Illumination',
    description: 'Descended 125 feet through bedrock to portals opening right behind the falling sheet of water. Later in the evening, witnessed the falls illuminated in deep violet and emerald laser projections.',
    date: '2024-06-21',
    rating: 4.7,
    category_id: '2', // Nature
    privacy: 'private',
    notes: 'Second visit to Niagara location - exploring cave tunnel behind the water sheet.',
    cover_image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    created_at: '2024-06-21T21:00:00Z',
    updated_at: '2024-06-21T21:00:00Z',
    location: INITIAL_LOCATIONS[1],
    category: DEFAULT_CATEGORIES[1],
  }
];

const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: 'wish-1',
    user_id: 'demo-user',
    title: 'Midnight Kayaking in Glowing Bioluminescence',
    location_id: 'loc-5',
    description: 'Clear bottom kayak tour through Puerto Mosquito on a moonless night. Millions of dinoflagellates lighting up electric blue with each paddle stroke.',
    category_id: '1',
    priority: 'high',
    estimated_budget: 150,
    notes: 'Must book during new moon phase for maximum brightness.',
    source: 'AI Companion Recommendation',
    reference_image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    is_completed: false,
    completed_experience_id: null,
    created_at: '2025-01-20T12:00:00Z',
    updated_at: '2025-01-20T12:00:00Z',
    location: INITIAL_LOCATIONS[4],
    category: DEFAULT_CATEGORIES[0],
  },
  {
    id: 'wish-2',
    user_id: 'demo-user',
    title: 'Sunrise Incan Trail to Sun Gate (Inti Punku)',
    location_id: 'loc-6',
    description: 'Hike the classic 4-day Inca trail arriving at the Sun Gate right at dawn for first view of the stone citadel emerging from the cloud forest.',
    category_id: '4',
    priority: 'high',
    estimated_budget: 1200,
    notes: 'Inca trail permits sell out 6 months ahead. Need altitude acclimatization in Cusco first.',
    source: 'Personal bucket list',
    reference_image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    is_completed: false,
    completed_experience_id: null,
    created_at: '2025-02-01T15:00:00Z',
    updated_at: '2025-02-01T15:00:00Z',
    location: INITIAL_LOCATIONS[5],
    category: DEFAULT_CATEGORIES[3],
  }
];

export const useAtlasStore = create<AtlasState>((set, get) => ({
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

  locations: INITIAL_LOCATIONS,
  experiences: INITIAL_EXPERIENCES,
  wishlistItems: INITIAL_WISHLIST,
  categories: DEFAULT_CATEGORIES,
  recommendations: [],

  setLocations: (locations) => set({ locations }),
  addLocation: (location) => {
    // Avoid duplicate location if same coordinates / place_id
    const existing = get().locations.find(
      (l) => (l.place_id && l.place_id === location.place_id) ||
             (Math.abs(l.latitude - location.latitude) < 0.0001 && Math.abs(l.longitude - location.longitude) < 0.0001)
    );
    if (!existing) {
      set((state) => ({ locations: [...state.locations, location] }));
    }
  },

  setExperiences: (experiences) => set({ experiences }),
  addExperience: (experience) => {
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
  saveRecommendationToWishlist: (recId) => {
    const rec = get().recommendations.find((r) => r.id === recId);
    if (!rec) return;

    let locId = null;
    if (rec.latitude && rec.longitude) {
      const existingLoc = get().locations.find(
        (l) => Math.abs(l.latitude - rec.latitude!) < 0.001 && Math.abs(l.longitude - rec.longitude!) < 0.001
      );
      if (existingLoc) {
        locId = existingLoc.id;
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
      }
    }

    const newWishlist: WishlistItem = {
      id: `wish-${Date.now()}`,
      user_id: 'demo-user',
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
      location: locId ? get().locations.find((l) => l.id === locId) : undefined,
    };

    get().addWishlistItem(newWishlist);
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === recId ? { ...r, is_saved: true } : r
      ),
    }));
  },
}));
