// Database types matching the Supabase schema
// These types are the source of truth for the entire application

export interface Location {
  id: string;
  name: string;
  city: string | null;
  country: string;
  venue: string | null;
  latitude: number;
  longitude: number;
  place_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  user_id: string;
  location_id: string;
  title: string;
  description: string | null;
  date: string;
  rating: number | null;
  category_id: string | null;
  privacy: 'private' | 'unlisted' | 'public';
  notes: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  location?: Location;
  category?: Category;
  media?: ExperienceMedia[];
  tags?: Tag[];
}

export interface ExperienceMedia {
  id: string;
  experience_id: string;
  user_id: string;
  file_url: string;
  thumbnail_url: string | null;
  file_type: 'image' | 'video';
  file_name: string;
  file_size: number;
  width: number | null;
  height: number | null;
  exif_data: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_default: boolean;
  user_id: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface ExperienceTag {
  experience_id: string;
  tag_id: string;
}

export type WishlistStatus = 'dreaming' | 'planned' | 'visited';

export interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  location_id: string | null;
  description: string | null;
  category_id: string | null;
  priority: 'high' | 'medium' | 'low';
  status?: WishlistStatus;
  tags?: string[];
  estimated_budget: number | null;
  notes: string | null;
  source: string | null;
  reference_image_url: string | null;
  is_completed: boolean;
  completed_experience_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  location?: Location;
  category?: Category;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  reason: string;
  external_url: string | null;
  image_url: string | null;
  distance_km: number | null;
  mode: 'next_experience' | 'nearby' | 'bucket_list' | 'destination';
  is_saved: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_categories: string[];
  interests: string[];
  preferred_distance_km: number;
  travel_budget: 'budget' | 'moderate' | 'luxury' | null;
  home_latitude: number | null;
  home_longitude: number | null;
  ai_personalization: boolean;
  location_permission: boolean;
  default_privacy: 'private' | 'unlisted' | 'public';
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: 'google_drive';
  provider_account_id: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Form types for creating/editing
export interface ExperienceFormData {
  title: string;
  description: string;
  date: string;
  rating: number | null;
  category_id: string;
  privacy: 'private' | 'unlisted' | 'public';
  notes: string;
  tags: string[];
  location: LocationFormData;
}

export interface LocationFormData {
  name: string;
  city: string;
  country: string;
  venue: string;
  latitude: number;
  longitude: number;
  place_id: string;
}

export interface WishlistFormData {
  title: string;
  description: string;
  category_id: string;
  priority: 'high' | 'medium' | 'low';
  estimated_budget: number | null;
  notes: string;
  source: string;
  location: LocationFormData | null;
}

// Globe marker types
export interface GlobeMarker {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  type: 'experienced' | 'wishlist';
  count: number;
  category: string | null;
  rating: number | null;
  coverImage: string | null;
  experiences?: Experience[];
  wishlistItems?: WishlistItem[];
}

// AI types
export type AdventureIntent = 
  | 'bucket_list'
  | 'trip_planning'
  | 'explicit_save'
  | 'completed_experience'
  | 'general_chat';

export type AdventureStatus = 
  | 'dreaming' 
  | 'planned' 
  | 'upcoming' 
  | 'in_progress' 
  | 'completed' 
  | 'archived';

export interface StructuredItineraryStop {
  name: string;
  city?: string | null;
  country: string;
  latitude?: number;
  longitude?: number;
  day_number?: number | null;
  target_date?: string | null;
  activities: string[];
  notes?: string | null;
}

export interface StructuredAdventurePayload {
  intent: AdventureIntent;
  title: string;
  description?: string;
  status: AdventureStatus;
  estimated_budget?: number;
  currency?: string;
  target_start_date?: string;
  target_end_date?: string;
  stops: StructuredItineraryStop[];
  detected_experience?: {
    title: string;
    location_name: string;
    city?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    date?: string;
    rating?: number;
    notes?: string;
  };
}

export interface AdventureDestination {
  id: string;
  adventure_id: string;
  location_id?: string | null;
  name: string;
  city?: string | null;
  country: string;
  latitude: number;
  longitude: number;
  order_index: number;
  day_number?: number | null;
  target_date?: string | null;
  notes?: string | null;
  activities?: string[];
  is_completed?: boolean;
  completed_experience_id?: string | null;
  created_at?: string;
  updated_at?: string;
  location?: Location;
}

export interface Adventure {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: AdventureStatus;
  target_start_date?: string | null;
  target_end_date?: string | null;
  estimated_budget?: number | null;
  currency?: string;
  notes?: string | null;
  cover_image_url?: string | null;
  is_bucket_list?: boolean;
  created_at: string;
  updated_at: string;
  destinations?: AdventureDestination[];
  conversation_id?: string | null;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: AIRecommendation[];
  structured_data?: StructuredAdventurePayload | null;
  adventure_preview?: StructuredAdventurePayload | null;
  timestamp: string;
}

export interface AIConversationThread {
  id: string;
  user_id?: string;
  title: string;
  adventure_id?: string | null;
  created_at: string;
  updated_at: string;
  messages: AIMessage[];
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  created_at: string;
}

export interface RecommendationRequest {
  mode: 'next_experience' | 'nearby' | 'bucket_list' | 'destination';
  query?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  destination?: string;
}

// Statistics types
export interface UserStatistics {
  totalExperiences: number;
  countriesVisited: number;
  citiesExplored: number;
  uniqueLocations: number;
  totalPhotos: number;
  totalVideos: number;
  averageRating: number;
  highestRated: Experience[];
  mostVisitedCountries: { country: string; count: number }[];
  topCategories: { category: string; count: number }[];
  experiencesByYear: { year: number; count: number }[];
  wishlistCount: number;
  completedVsPlanned: { completed: number; planned: number };
}

// EXIF extraction
export interface ExtractedExifData {
  latitude: number | null;
  longitude: number | null;
  dateTime: string | null;
  camera: string | null;
  lens: string | null;
  focalLength: string | null;
  aperture: string | null;
  iso: number | null;
  shutterSpeed: string | null;
}

// Search result types
export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  types: string[];
}

