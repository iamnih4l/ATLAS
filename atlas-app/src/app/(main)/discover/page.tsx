'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtlasStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { getRecommendationsForMode } from '@/lib/ai-companion';
import {
  AIRecommendation,
  StructuredAdventurePayload,
  StructuredItineraryStop,
  AdventureIntent,
  Adventure,
  AIConversationThread,
  AIMessage,
  WishlistItem,
  Location,
} from '@/types';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  MapPin,
  Send,
  BookmarkCheck,
  Check,
  ExternalLink,
  Bot,
  Globe2,
  Search,
  Info,
  Calendar,
  Route,
  History,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  Compass,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { DoodleSparkle, DoodleUnderline, WashiTape, PassportStamp } from '@/components/ui/doodles';
import { PixelPlane } from '@/components/ui/pixel-stickers';
import { StarSpike, JoyBlob } from '@/components/ui/mascot-doodles';
import { VerifiedStamp, TicketBadge } from '@/components/ui/atlas-illustrations';

interface ChatEntry {
  id: string;
  role: 'user' | 'orion';
  content: string;
  time: string;
  adventure_preview?: StructuredAdventurePayload | null;
  intent?: AdventureIntent;
}

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedAdventureId = searchParams.get('adventure');

  const { user } = useAuth();
  const {
    experiences,
    locations,
    wishlistItems,
    adventures,
    addAdventure,
    addWishlistItem,
    addLocation,
    setSelectedAdventure,
    setFlyToTarget,
    setPendingLocation,
    setExperienceModalOpen,
    conversations,
    saveConversation,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
  } = useAtlasStore();

  const [activeMode, setActiveMode] = useState<
    'next_experience' | 'nearby' | 'bucket_list' | 'destination'
  >('next_experience');

  const [destinationInput, setDestinationInput] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedAdventureTitles, setSavedAdventureTitles] = useState<Set<string>>(new Set());
  const [savedDreamBatchTitles, setSavedDreamBatchTitles] = useState<Set<string>>(new Set());
  const [savedDreamKeys, setSavedDreamKeys] = useState<Set<string>>(new Set());
  const [selectedRecForDetails, setSelectedRecForDetails] = useState<AIRecommendation | null>(null);

  // Thread and History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string>(
    activeConversationId || `thread-${Date.now()}`
  );

  const initialWelcomeMsg: ChatEntry = {
    id: 'welcome-msg',
    role: 'orion',
    content:
      'Greetings, explorer! I am Orion, your personal ATLAS travel companion and Adventure Architect! 🌟 I study your memories, rated highlights, and dreams to construct real-world itineraries with verified GPS coordinates. What trip or dream shall we plan today?',
    time: 'Just now',
  };

  const [messages, setMessages] = useState<ChatEntry[]>([initialWelcomeMsg]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Sync remote conversations on mount
  useEffect(() => {
    let isCancelled = false;
    async function loadThreads() {
      try {
        const res = await fetch('/api/ai/conversations');
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.conversations && data.conversations.length > 0) {
            data.conversations.forEach((conv: AIConversationThread) => {
              saveConversation(conv);
            });
          }
        }
      } catch (err) {
        console.warn('Conversations fetch error (using local cache):', err);
      }
    }
    loadThreads();
    return () => {
      isCancelled = true;
    };
  }, [saveConversation]);

  // 2. Restore active conversation thread from store if available
  useEffect(() => {
    if (activeConversationId) {
      const found = conversations.find((c) => c.id === activeConversationId);
      if (found && found.messages && found.messages.length > 0) {
        setCurrentThreadId(found.id);
        setMessages(
          found.messages.map((m) => ({
            id: m.id,
            role: m.role === 'assistant' ? 'orion' : 'user',
            content: m.content,
            time: m.timestamp || 'Recent',
            adventure_preview: m.adventure_preview || m.structured_data || null,
          }))
        );
      }
    }
  }, [activeConversationId, conversations]);

  // 3. Handle incoming ?adventure= query parameter to resume planning
  useEffect(() => {
    if (linkedAdventureId) {
      const adv = adventures.find((a) => a.id === linkedAdventureId);
      if (adv) {
        setSelectedAdventure(adv);
        setChatInput(`Let's refine the itinerary for "${adv.title}"!`);
      }
    }
  }, [linkedAdventureId, adventures, setSelectedAdventure]);

  // 4. Recommendations loader
  useEffect(() => {
    let isCancelled = false;
    async function fetchRecs() {
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'recommendations',
            mode: activeMode,
            query: destinationInput || undefined,
            experiences,
            locations,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.recommendations && data.recommendations.length > 0) {
            setRecommendations(data.recommendations);
            return;
          }
        }
      } catch (err) {
        console.warn('API error, falling back to local pool:', err);
      }
      if (!isCancelled) {
        const recs = getRecommendationsForMode(
          activeMode,
          experiences,
          locations,
          destinationInput || undefined
        );
        setRecommendations(recs);
      }
    }
    fetchRecs();
    return () => {
      isCancelled = true;
    };
  }, [activeMode, experiences, locations, destinationInput]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist a single Dream List item (location or activity) both locally and to Supabase
  const persistDreamListPin = async (params: {
    title: string;
    description?: string | null;
    notes?: string | null;
    source: string;
    imageUrl?: string | null;
    locationName: string;
    city?: string | null;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    tags?: string[];
  }) => {
    const now = new Date().toISOString();
    const lat = typeof params.latitude === 'number' && Number.isFinite(params.latitude) ? params.latitude : null;
    const lng = typeof params.longitude === 'number' && Number.isFinite(params.longitude) ? params.longitude : null;

    let targetLoc: Location | undefined;
    if (lat !== null && lng !== null) {
      const existingLoc = useAtlasStore
        .getState()
        .locations.find(
          (l) => Math.abs(l.latitude - lat) < 0.0005 && Math.abs(l.longitude - lng) < 0.0005
        );
      if (existingLoc) {
        targetLoc = existingLoc;
      } else {
        targetLoc = {
          id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: params.locationName,
          city: params.city || null,
          country: params.country || 'Earth',
          venue: null,
          latitude: lat,
          longitude: lng,
          place_id: null,
          created_at: now,
          updated_at: now,
        };
        addLocation(targetLoc);
      }
    }

    // Prevent exact duplicate title in local wishlist
    const alreadyExists = useAtlasStore
      .getState()
      .wishlistItems.some(
        (w) => w.title.trim().toLowerCase() === params.title.trim().toLowerCase()
      );
    if (alreadyExists) return;

    const tempId = `wish-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem: WishlistItem = {
      id: tempId,
      user_id: user?.id || 'guest-user',
      title: params.title,
      location_id: targetLoc?.id || null,
      description: params.description || null,
      category_id: '1',
      priority: 'high',
      status: 'dreaming',
      tags: params.tags || ['Dreaming', 'Orion AI'],
      estimated_budget: null,
      notes: params.notes || null,
      source: params.source,
      reference_image_url: params.imageUrl || null,
      is_completed: false,
      completed_experience_id: null,
      created_at: now,
      updated_at: now,
      location: targetLoc,
    };

    addWishlistItem(newItem);

    if (user && !user.isGuest) {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newItem.title,
            description: newItem.description,
            category_id: newItem.category_id,
            priority: newItem.priority,
            status: 'dreaming',
            tags: newItem.tags,
            notes: newItem.notes,
            source: newItem.source,
            reference_image_url: newItem.reference_image_url,
            is_completed: false,
            location: targetLoc,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.id) {
            useAtlasStore.getState().updateWishlistItem(tempId, {
              id: data.id,
              user_id: data.user_id || user.id,
              location_id: data.location_id,
              location: data.location || targetLoc,
            });
          }
        }
      } catch (err) {
        console.warn('Failed to persist Dream List item to server:', err);
      }
    }
  };

  const handleSaveToWishlist = async (rec: AIRecommendation) => {
    setSavedIds((prev) => new Set(prev).add(rec.id));
    await persistDreamListPin({
      title: rec.title,
      description: `${rec.description}\n\nWhy recommended: ${rec.reason}`,
      notes: rec.reason,
      source: 'Orion AI Dream Recommendation',
      imageUrl: rec.image_url,
      locationName: rec.location_name,
      country: rec.location_name.split(',').pop()?.trim() || 'Earth',
      latitude: rec.latitude,
      longitude: rec.longitude,
      tags: ['Dreaming', 'Orion AI'],
    });
  };

  const handleAddStopToDreamList = async (
    stop: StructuredItineraryStop,
    activityName?: string
  ) => {
    const key = activityName ? `${stop.name}::${activityName}` : stop.name;
    setSavedDreamKeys((prev) => new Set(prev).add(key));

    const title = activityName ? `${activityName} — ${stop.name}` : stop.name;
    const description = activityName
      ? `Activity at ${stop.name}${stop.city ? `, ${stop.city}` : ''}, ${stop.country}.${stop.notes ? ` ${stop.notes}` : ''}`
      : stop.notes ||
        (stop.activities?.length
          ? `Top activities: ${stop.activities.join(' • ')}`
          : `Dream destination in ${[stop.city, stop.country].filter(Boolean).join(', ')}`);

    await persistDreamListPin({
      title,
      description,
      notes: stop.activities?.length ? `Activities: ${stop.activities.join(', ')}` : stop.notes,
      source: activityName ? 'Orion AI Activity Dream' : 'Orion AI Dream Destination',
      locationName: stop.name,
      city: stop.city,
      country: stop.country,
      latitude: stop.latitude,
      longitude: stop.longitude,
      tags: activityName ? ['Dreaming', 'Activity', 'Orion AI'] : ['Dreaming', 'Bucket List', 'Orion AI'],
    });
  };

  const handleAddAllStopsToDreamList = async (preview: StructuredAdventurePayload) => {
    setSavedDreamBatchTitles((prev) => new Set(prev).add(preview.title));
    const newKeys = new Set(savedDreamKeys);
    for (const stop of preview.stops) {
      newKeys.add(stop.name);
      await handleAddStopToDreamList(stop);
    }
    setSavedDreamKeys(newKeys);
  };

  const handleLogStopAsMemory = (stop: StructuredItineraryStop) => {
    setPendingLocation({
      latitude: stop.latitude || 0,
      longitude: stop.longitude || 0,
      name: stop.name,
      city: stop.city || undefined,
      country: stop.country || undefined,
    });
    setExperienceModalOpen(true);
  };

  const handleFly = (rec: AIRecommendation) => {
    if (rec.latitude && rec.longitude) {
      setFlyToTarget({
        latitude: rec.latitude,
        longitude: rec.longitude,
        altitude: 400000,
      });
      router.push('/globe');
    }
  };

  // Start new chat thread
  const handleStartNewSession = () => {
    const newId = `thread-${Date.now()}`;
    setCurrentThreadId(newId);
    setActiveConversationId(newId);
    setMessages([initialWelcomeMsg]);
    setIsHistoryOpen(false);
  };

  // Switch to existing thread
  const handleSwitchThread = (thread: AIConversationThread) => {
    setCurrentThreadId(thread.id);
    setActiveConversationId(thread.id);
    setMessages(
      thread.messages.map((m) => ({
        id: m.id,
        role: m.role === 'assistant' ? 'orion' : 'user',
        content: m.content,
        time: m.timestamp || 'Recent',
        adventure_preview: m.adventure_preview || m.structured_data || null,
      }))
    );
    setIsHistoryOpen(false);
  };

  // Delete thread
  const handleDeleteThread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    try {
      await fetch(`/api/ai/conversations?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Error deleting conversation on server:', err);
    }
    if (currentThreadId === id) {
      handleStartNewSession();
    }
  };

  // Send message and get Orion AI response
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg: ChatEntry = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: nextMessages.map((m) => ({
            role: m.role === 'orion' ? 'assistant' : m.role,
            content: m.content,
          })),
          experiences,
          locations,
          adventures,
          wishlistItems,
        }),
      });

      let reply = '';
      let adventurePreview: StructuredAdventurePayload | null = null;
      let intent: AdventureIntent = 'general_chat';

      if (res.ok) {
        const data = await res.json();
        reply = data.reply;
        adventurePreview = data.adventure_preview || null;
        intent = data.intent || 'general_chat';
      }

      if (!reply) {
        reply =
          "That sounds like an incredible journey! I have mapped grounded coordinates for your destination below.";
      }

      const orionMsg: ChatEntry = {
        id: `orion-${Date.now()}`,
        role: 'orion',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adventure_preview: adventurePreview,
        intent,
      };

      const finalMessages = [...nextMessages, orionMsg];
      setMessages(finalMessages);

      // Persist this conversation thread
      const threadTitle =
        adventurePreview?.title ||
        nextMessages.find((m) => m.role === 'user')?.content.slice(0, 32) ||
        'Adventure Plan';

      const threadPayload: AIConversationThread = {
        id: currentThreadId,
        title: threadTitle,
        adventure_id: linkedAdventureId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: finalMessages.map((m) => ({
          id: m.id,
          role: m.role === 'orion' ? 'assistant' : 'user',
          content: m.content,
          structured_data: m.adventure_preview || null,
          adventure_preview: m.adventure_preview || null,
          timestamp: m.time,
        })),
      };

      saveConversation(threadPayload);

      // Async post to Supabase
      fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threadPayload),
      }).catch((err) => console.warn('Background thread sync error:', err));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `orion-${Date.now()}`,
          role: 'orion',
          content:
            'That sounds like a thrilling expedition! Check out the handpicked recommendation cards below for grounded coordinates.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Convert structured AI preview into permanent Adventure
  const handleSaveAdventure = async (preview: StructuredAdventurePayload) => {
    const advId = `adv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const destinations = preview.stops.map((stop, idx) => ({
      id: `dest-${Date.now()}-${idx}`,
      adventure_id: advId,
      name: stop.name,
      city: stop.city || null,
      country: stop.country,
      latitude: stop.latitude || 0,
      longitude: stop.longitude || 0,
      order_index: idx,
      day_number: stop.day_number || idx + 1,
      target_date: stop.target_date || null,
      notes: stop.notes || null,
      activities: stop.activities || [],
      is_completed: preview.status === 'completed',
    }));

    const completeAdventure: Adventure = {
      id: advId,
      user_id: 'active-user',
      title: preview.title,
      description: preview.description || null,
      status: preview.status || 'planned',
      estimated_budget: preview.estimated_budget || null,
      currency: preview.currency || 'USD',
      notes: `Planned with Orion AI Companion.\n${preview.description || ''}`,
      cover_image_url:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      is_bucket_list: preview.status === 'dreaming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      destinations,
      conversation_id: currentThreadId,
    };

    addAdventure(completeAdventure);
    setSelectedAdventure(completeAdventure);
    setSavedAdventureTitles((prev) => new Set(prev).add(preview.title));

    try {
      const res = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adventure: completeAdventure,
          destinations,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.adventure && data.adventure.id !== advId) {
          const state = useAtlasStore.getState();
          state.setAdventures(
            state.adventures.map((a) => (a.id === advId ? data.adventure : a))
          );
          if (state.selectedAdventure?.id === advId) {
            state.setSelectedAdventure(data.adventure);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to sync adventure to server (persisted locally):', err);
    }
  };

  // View on 3D Globe — automatically routes dreaming/bucket_list to Dream List & planned trips to Adventures
  const handleViewAdventureOnGlobe = async (preview: StructuredAdventurePayload) => {
    const isDreamIntent = preview.status === 'dreaming' || preview.intent === 'bucket_list';
    if (isDreamIntent) {
      await handleAddAllStopsToDreamList(preview);
    } else {
      await handleSaveAdventure(preview);
    }
    const firstStop = preview.stops[0];
    if (firstStop && firstStop.latitude && firstStop.longitude) {
      setFlyToTarget({
        latitude: firstStop.latitude,
        longitude: firstStop.longitude,
        altitude: 350000,
      });
    }
    router.push('/globe');
  };

  const promptSuggestions = [
    'I want to visit the Seven Wonders of the World',
    'Plan a 5-day trip to Switzerland: Zurich, Lucerne, Interlaken, Zermatt',
    'I dream of seeing Mount Fuji and climbing the summit',
    'I visited Paris last summer and loved the historic architecture',
  ];

  return (
    <div className="flex-1 overflow-y-auto pt-20 sm:pt-28 pb-28 sm:pb-24 px-3.5 sm:px-6 max-w-7xl mx-auto space-y-8 w-full bg-warm-cream-grid min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#171313]/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5 relative">
            <PixelOrionAvatar size={32} />
            <div className="relative">
              <h1 className="text-3xl font-black tracking-tight text-[#171313] font-sans">
                Meet Orion AI Companion
              </h1>
              <DoodleUnderline className="text-[#6425F5] mt-0.5" />
            </div>
            <DoodleSparkle size={20} color="#6425F5" />
          </div>
          <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
            Adventure architect that turns your wanderlust into structured multi-stop journeys on your 3D globe.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-white hover:bg-[#FFD45A] text-[#171313] flex items-center gap-2 border-2 border-[#171313] shadow-pop-sm transition-all cursor-pointer"
          >
            <History className="w-4 h-4 stroke-[2.5]" />
            <span>Saved Plans ({conversations.length})</span>
          </button>

          <button
            onClick={handleStartNewSession}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-[#FFD45A] hover:bg-[#ffc72c] text-[#171313] flex items-center gap-2 border-2 border-[#171313] shadow-pop-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Slide-out / Dropdown Conversation History Drawer */}
      {isHistoryOpen && (
        <div className="p-5 bg-white border-2 border-[#171313] rounded-3xl shadow-pop-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#171313] mb-3">
            <span className="text-xs font-black text-[#171313] flex items-center gap-2">
              <History className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />
              Your Adventure Planning History
            </span>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-xs font-black text-[#171313]/60 hover:text-[#171313]"
            >
              ✕ Close
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-[#171313]/60 font-bold py-2">
              No previous conversations yet. Start planning with Orion below!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {conversations.map((thread) => {
                const isActive = thread.id === currentThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSwitchThread(thread)}
                    className={cn(
                      'p-3.5 rounded-2xl border-2 border-[#171313] transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-pop-xs hover:scale-[1.02]',
                      isActive ? 'bg-[#FFD45A]' : 'bg-[#FFF4D9] hover:bg-white'
                    )}
                  >
                    <div>
                      <h4 className="text-xs font-black text-[#171313] line-clamp-1">
                        {thread.title}
                      </h4>
                      <p className="text-[10px] text-[#171313]/70 font-bold mt-0.5">
                        {thread.messages.length} messages •{' '}
                        {new Date(thread.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#171313]/10">
                      <span className="text-[10px] font-black text-[#6425F5]">
                        {isActive ? '● Active Session' : 'Switch →'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="p-1 text-[#171313]/50 hover:text-[#F04432] transition-colors"
                        title="Delete Thread"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Orion Conversational Box with Bento-Pop Styling */}
      <div className="bg-white border-2 border-[#171313] rounded-3xl p-4 sm:p-6 space-y-4 shadow-pop-lg relative">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#171313]">
          <span className="text-xs font-black text-[#171313] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />
            Live Session: {conversations.find((c) => c.id === currentThreadId)?.title || 'New Adventure Plan'}
          </span>
          <span className="text-[11px] text-[#171313] font-black bg-[#FFD45A] border-2 border-[#171313] px-3 py-0.5 rounded-full shadow-pop-sm">
            Trained on {experiences.length} memories & {adventures.length} adventures ✦
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`flex items-start gap-3 text-xs ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'orion' && (
                <div className="w-9 h-9 rounded-2xl bg-[#6425F5] border-2 border-[#171313] flex items-center justify-center shrink-0 mt-0.5 shadow-pop-sm">
                  <PixelOrionAvatar size={24} />
                </div>
              )}

              <div
                className={`p-4 rounded-3xl max-w-2xl leading-relaxed text-xs font-bold border-2 border-[#171313] shadow-pop-sm ${
                  m.role === 'user'
                    ? 'bg-[#F04432] text-white rounded-tr-xs'
                    : 'bg-[#FFF4D9] text-[#171313] rounded-tl-xs'
                }`}
              >
                {/* Conversational Text */}
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Structured Adventure Itinerary Preview Card */}
                {m.adventure_preview && (
                  <div className="mt-4 p-4 bg-white border-2 border-[#171313] rounded-2xl shadow-pop-sm space-y-3 text-[#171313]">
                    {/* Header with Title & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#171313]/15 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#171313]',
                              m.adventure_preview.status === 'completed'
                                ? 'bg-[#F04432] text-white'
                                : m.adventure_preview.status === 'dreaming'
                                ? 'bg-[#FFD45A] text-[#171313]'
                                : 'bg-[#6425F5] text-white'
                            )}
                          >
                            {m.adventure_preview.status === 'dreaming'
                              ? '✦ Dream Destination'
                              : m.adventure_preview.status === 'completed'
                              ? '✓ Completed Memory'
                              : '🏔️ Planned Expedition'}
                          </span>
                          {m.adventure_preview.estimated_budget && (
                            <span className="text-[11px] font-mono font-black text-[#171313] bg-[#FFF4D9] px-2 py-0.5 rounded-md border border-[#171313]">
                              Budget: ~{m.adventure_preview.estimated_budget} {m.adventure_preview.currency || 'USD'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black text-[#171313] mt-1">
                          {m.adventure_preview.title}
                        </h3>
                      </div>
                    </div>

                    {m.adventure_preview.description && (
                      <p className="text-xs text-[#171313]/80 font-medium">
                        {m.adventure_preview.description}
                      </p>
                    )}

                    {/* Ordered Stops Timeline */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-black text-[#171313]/70 uppercase tracking-wider flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-[#6425F5] stroke-[2.5]" />
                        Itinerary Stops ({m.adventure_preview.stops.length})
                      </div>

                      <div className="space-y-2">
                        {m.adventure_preview.stops.map((stop, sIdx) => {
                          const isStopSaved =
                            savedDreamKeys.has(stop.name) ||
                            wishlistItems.some(
                              (w) => w.title.trim().toLowerCase() === stop.name.trim().toLowerCase()
                            );
                          return (
                            <div
                              key={sIdx}
                              className="p-2.5 bg-[#FFF4D9] rounded-xl border border-[#171313] text-xs flex flex-col gap-1.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-black text-[#171313] flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-[#6425F5] text-white text-[10px] font-black inline-flex items-center justify-center shrink-0">
                                    {sIdx + 1}
                                  </span>
                                  {stop.name}
                                </span>

                                {/* Direct Per-Location Actions from AI */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleAddStopToDreamList(stop)}
                                    disabled={isStopSaved}
                                    className={cn(
                                      'px-2 py-0.5 rounded-lg text-[10px] font-black border border-[#171313] transition-all flex items-center gap-1 cursor-pointer',
                                      isStopSaved
                                        ? 'bg-emerald-500 text-white cursor-default'
                                        : 'bg-[#FFD45A] hover:bg-[#ffc72c] text-[#171313] shadow-pop-2xs'
                                    )}
                                    title="Pin this location directly to your Dream List & Bucket List"
                                  >
                                    {isStopSaved ? (
                                      <>
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>In Dream List</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3 h-3 stroke-[2.5]" />
                                        <span>+ Dream List</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleLogStopAsMemory(stop)}
                                    className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white hover:bg-[#F04432] hover:text-white text-[#171313] border border-[#171313] transition-all flex items-center gap-1 cursor-pointer"
                                    title="Log this location as a Visited Memory"
                                  >
                                    <MapPin className="w-3 h-3 stroke-[2.5]" />
                                    <span>+ Memory</span>
                                  </button>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#171313]/70 font-bold ml-6.5 flex items-center gap-2 flex-wrap">
                                <span>
                                  {[stop.city, stop.country].filter(Boolean).join(', ')}
                                  {stop.day_number ? ` • Day ${stop.day_number}` : ''}
                                </span>
                                {stop.latitude && stop.longitude ? (
                                  <span className="text-[10px] font-mono text-[#171313]/60">
                                    ({stop.latitude.toFixed(2)}°, {stop.longitude.toFixed(2)}°)
                                  </span>
                                ) : null}
                              </p>

                              {stop.activities && stop.activities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 ml-6.5 mt-0.5">
                                  {stop.activities.map((act, aIdx) => {
                                    const actKey = `${stop.name}::${act}`;
                                    const actTitle = `${act} — ${stop.name}`;
                                    const isActSaved =
                                      savedDreamKeys.has(actKey) ||
                                      wishlistItems.some(
                                        (w) =>
                                          w.title.trim().toLowerCase() ===
                                          actTitle.trim().toLowerCase()
                                      );
                                    return (
                                      <button
                                        key={aIdx}
                                        type="button"
                                        onClick={() => handleAddStopToDreamList(stop, act)}
                                        disabled={isActSaved}
                                        className={cn(
                                          'text-[10px] font-black border border-[#171313] px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer',
                                          isActSaved
                                            ? 'bg-emerald-500 text-white cursor-default'
                                            : 'bg-white hover:bg-[#6425F5] hover:text-white text-[#171313]'
                                        )}
                                        title={
                                          isActSaved
                                            ? 'Added to Dream List'
                                            : `Click to add "${act}" directly to your Dream List`
                                        }
                                      >
                                        {isActSaved ? (
                                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        ) : (
                                          <Plus className="w-2.5 h-2.5 stroke-[3]" />
                                        )}
                                        <span>{act}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {stop.notes && (
                                <p className="text-[11px] text-[#171313]/80 italic ml-6.5 mt-0.5">
                                  &ldquo;{stop.notes}&rdquo;
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar: Explicit Dream List vs Planned Adventure Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#171313]/15">
                      <button
                        type="button"
                        onClick={() => handleAddAllStopsToDreamList(m.adventure_preview!)}
                        disabled={savedDreamBatchTitles.has(m.adventure_preview.title)}
                        className={cn(
                          'py-2 px-4 rounded-xl text-xs font-black border-2 border-[#171313] shadow-pop-xs transition-all flex items-center gap-1.5 cursor-pointer',
                          savedDreamBatchTitles.has(m.adventure_preview.title)
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-[#F04432] hover:bg-[#d63626] text-white'
                        )}
                      >
                        {savedDreamBatchTitles.has(m.adventure_preview.title) ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Added All to Dream List!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>
                              ✦ Add All to Dream List ({m.adventure_preview.stops.length})
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveAdventure(m.adventure_preview!)}
                        disabled={savedAdventureTitles.has(m.adventure_preview.title)}
                        className={cn(
                          'py-2 px-4 rounded-xl text-xs font-black border-2 border-[#171313] shadow-pop-xs transition-all flex items-center gap-1.5 cursor-pointer',
                          savedAdventureTitles.has(m.adventure_preview.title)
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-[#FFD45A] hover:bg-[#ffc72c] text-[#171313]'
                        )}
                      >
                        {savedAdventureTitles.has(m.adventure_preview.title) ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Saved as Planned Adventure!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Save as Planned Adventure</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleViewAdventureOnGlobe(m.adventure_preview!)}
                        className="py-2 px-4 rounded-xl text-xs font-black bg-[#6425F5] hover:bg-[#521ec9] text-white border-2 border-[#171313] shadow-pop-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>View on 3D Globe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setChatInput(
                            `Can you suggest top scenic viewpoints and authentic dining in ${m.adventure_preview?.stops[0]?.name || 'this itinerary'}?`
                          )
                        }
                        className="py-2 px-3 rounded-xl text-xs font-black bg-white hover:bg-[#FFF4D9] text-[#171313] border-2 border-[#171313] shadow-pop-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#6425F5]" />
                        <span>Refine Itinerary</span>
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right font-black ${
                    m.role === 'user' ? 'text-white/80' : 'text-[#171313]/50'
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-[#FFD45A] border-2 border-[#171313] flex items-center justify-center text-[#171313] font-black text-xs shrink-0 mt-0.5 shadow-pop-sm">
                  ME
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#6425F5] font-black">
              <Bot className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Orion is plotting routes and coordinates…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t-2 border-[#171313]/10">
          {promptSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#FFF4D9] hover:bg-[#FFD45A] border-2 border-[#171313] text-[#171313] font-bold shadow-pop-sm transition-all cursor-pointer truncate max-w-full"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2">
          <input
            placeholder="Ask Orion to plan a trip, dream of a destination, or log a memory…"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl px-4 py-2.5 text-xs text-[#171313] placeholder-[#171313]/50 focus:outline-none focus:bg-white font-black shadow-pop-sm"
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Four Recommendation Modes Tabs */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#171313] pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setActiveMode('next_experience');
                setDestinationInput('');
              }}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313]',
                activeMode === 'next_experience'
                  ? 'bg-[#FFD45A] text-[#171313] shadow-pop scale-105'
                  : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/30 shadow-pop-sm'
              )}
            >
              Mode A: Next Adventure
            </button>

            <button
              onClick={() => {
                setActiveMode('nearby');
                setDestinationInput('');
              }}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313]',
                activeMode === 'nearby'
                  ? 'bg-[#FFD45A] text-[#171313] shadow-pop scale-105'
                  : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/30 shadow-pop-sm'
              )}
            >
              Mode B: Hidden Gems Nearby
            </button>

            <button
              onClick={() => {
                setActiveMode('bucket_list');
                setDestinationInput('');
              }}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313]',
                activeMode === 'bucket_list'
                  ? 'bg-[#FFD45A] text-[#171313] shadow-pop scale-105'
                  : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/30 shadow-pop-sm'
              )}
            >
              Mode C: Bucket List Dreams
            </button>

            <button
              onClick={() => {
                setActiveMode('destination');
              }}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313]',
                activeMode === 'destination'
                  ? 'bg-[#FFD45A] text-[#171313] shadow-pop scale-105'
                  : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/30 shadow-pop-sm'
              )}
            >
              Mode D: Destination Focus
            </button>
          </div>

          {activeMode === 'destination' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search city, country, or landmark…"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="bg-white border-2 border-[#171313] rounded-2xl px-4 py-2 text-xs text-[#171313] placeholder-[#171313]/50 focus:outline-none font-bold shadow-pop-sm w-64"
              />
            </div>
          )}
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((rec) => {
            const isSaved = savedIds.has(rec.id) || rec.is_saved;
            return (
              <div
                key={rec.id}
                className="bg-white border-2 border-[#171313] rounded-3xl overflow-hidden shadow-pop hover:scale-[1.01] transition-all flex flex-col justify-between"
              >
                <div>
                  {rec.image_url && (
                    <div className="relative h-44 w-full bg-[#171313] border-b-2 border-[#171313] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rec.image_url}
                        alt={rec.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#FFD45A] text-[#171313] font-black text-[10px] px-3 py-1 rounded-full border-2 border-[#171313] shadow-pop-xs uppercase tracking-wider">
                        {rec.category}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-black text-[#171313] line-clamp-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-[#171313]/70 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                      <span className="truncate">{rec.location_name}</span>
                    </p>
                    <p className="text-xs text-[#171313]/80 font-medium line-clamp-2">
                      {rec.description}
                    </p>
                    {rec.reason && (
                      <p className="text-[11px] text-[#6425F5] font-black italic bg-[#6425F5]/10 p-2 rounded-xl border border-[#6425F5]/20">
                        &ldquo;{rec.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleSaveToWishlist(rec)}
                    disabled={isSaved}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-2xl text-xs font-black border-2 border-[#171313] shadow-pop-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                      isSaved
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-[#FFD45A] hover:bg-[#ffc72c] text-[#171313]'
                    )}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Save to Wishlist</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleFly(rec)}
                    className="p-2 rounded-2xl bg-[#6425F5] hover:bg-[#521ec9] text-white border-2 border-[#171313] shadow-pop-xs transition-all cursor-pointer"
                    title="View on 3D Globe"
                  >
                    <Globe2 className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen flex items-center justify-center bg-warm-cream-grid">
          <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl shadow-pop flex items-center gap-3">
            <PixelOrionAvatar size={32} />
            <span className="text-xs font-black text-[#171313]">
              Loading Orion Adventure Architect…
            </span>
          </div>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}

function PixelOrionAvatar({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
      className="inline-block"
    >
      {/* Cute Antennas */}
      <rect x="7" y="1" width="2" height="2" fill="#6425F5" />
      <rect x="6" y="0" width="4" height="1" fill="#FFD45A" />
      {/* Bot Head */}
      <rect x="3" y="3" width="10" height="9" fill="#6425F5" />
      <rect x="4" y="4" width="8" height="7" fill="#8b5cf6" />
      {/* Screen Face */}
      <rect x="4" y="5" width="8" height="5" fill="#171313" />
      {/* Happy Glowing Eyes */}
      <rect x="5" y="6" width="2" height="2" fill="#FFD45A" />
      <rect x="9" y="6" width="2" height="2" fill="#FFD45A" />
      <rect x="5" y="6" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="6" width="1" height="1" fill="#ffffff" />
      {/* Rosy Cheek Pixels */}
      <rect x="4" y="8" width="1" height="1" fill="#F04432" />
      <rect x="11" y="8" width="1" height="1" fill="#F04432" />
      {/* Cute Smile */}
      <rect x="7" y="8" width="2" height="1" fill="#FFD45A" />
    </svg>
  );
}
