'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAtlasStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  getRecommendationsForMode,
  VERIFIED_EXPERIENCES,
} from '@/lib/ai-companion';
import { AIRecommendation } from '@/types';
import {
  Sparkles,
  Compass,
  MapPin,
  Send,
  BookmarkCheck,
  Check,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Flame,
  Globe2,
  Search,
} from 'lucide-react';

export default function DiscoverPage() {
  const {
    experiences,
    locations,
    saveRecommendationToWishlist,
    setFlyToTarget,
  } = useAtlasStore();

  const [activeMode, setActiveMode] = useState<
    'next_experience' | 'nearby' | 'bucket_list' | 'destination'
  >('next_experience');

  const [destinationInput, setDestinationInput] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Conversational Chat with Orion
  const [messages, setMessages] = useState<
    { role: 'user' | 'orion'; content: string; time: string }[]
  >([
    {
      role: 'orion',
      content:
        'Hello! I am Orion, your ATLAS experience companion. I study your recorded milestones, personal ratings, and bucket list to propose verified real-world places and activities you have never tried before. What kind of experience are you seeking?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load recommendations when mode or destination changes
  useEffect(() => {
    const recs = getRecommendationsForMode(
      activeMode,
      experiences,
      locations,
      destinationInput || undefined
    );
    setRecommendations(recs);
  }, [activeMode, experiences, locations, destinationInput]);

  const handleSaveToWishlist = (rec: AIRecommendation) => {
    saveRecommendationToWishlist(rec.id);
    setSavedIds((prev) => new Set(prev).add(rec.id));
  };

  const handleFly = (rec: AIRecommendation) => {
    if (rec.latitude && rec.longitude) {
      setFlyToTarget({
        latitude: rec.latitude,
        longitude: rec.longitude,
        altitude: 400000,
      });
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      role: 'user' as const,
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();

      if (q.includes('japan') || q.includes('kyoto') || q.includes('tokyo')) {
        reply =
          'Given your 5.0 rating on the Fushimi Inari Torii shrine hike in Kyoto, I strongly recommend the Kumano Kodo pilgrimage trails in Wakayama or night kayaking under bioluminescent squids in Toyama Bay. Both offer an intimate spiritual encounter with Japan’s ancient nature.';
        setActiveMode('destination');
        setDestinationInput('Japan');
      } else if (q.includes('scuba') || q.includes('diving') || q.includes('water')) {
        reply =
          'You already logged Niagara cave waters and saved bioluminescent kayaking in Puerto Rico! For your first major scuba adventure, the clear caverns of Cenote Dos Ojos in Mexico or the outer coral reefs of Cairns are world-class starting points.';
      } else if (q.includes('adventur') || q.includes('next')) {
        reply =
          'Based on your 13,000ft Skydive in Dubai, paragliding over the Swiss Alps in Interlaken gives you similar panoramic height but with 20 tranquil minutes in a thermal current instead of a fast freefall. I have populated the recommendations below!';
        setActiveMode('next_experience');
      } else {
        reply =
          'I have analyzed your preference for outdoor thrills, culture, and architecture. Take a look at the curated verified experiences below — each card explains the exact reason it fits your personal atlas!';
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'orion',
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const promptSuggestions = [
    'What should I try next based on my ratings?',
    'Recommend something adventurous in Japan',
    'I loved skydiving, where should I scuba dive?',
    'Show me unique bucket list journeys',
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="border-b border-[#1c1c22] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f0]">
              Orion AI Experience Companion
            </h1>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Grounded intelligence that maps your past memories to recommend real-world adventures worth taking.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          <Bot className="w-3.5 h-3.5" /> Grounded in Verified Coordinates
        </Badge>
      </div>

      {/* Orion Conversational Drawer */}
      <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c1c22]">
          <span className="text-xs font-semibold text-[#f5f5f0] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Conversation with Orion
          </span>
          <span className="text-[11px] text-[#71717a]">
            Synthesizes {experiences.length} logged memories
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 text-xs ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'orion' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-500 text-black font-medium'
                    : 'bg-[#181820] border border-[#27272a] text-[#f5f5f0]'
                }`}
              >
                {m.content}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.role === 'user' ? 'text-black/60' : 'text-[#71717a]'
                  }`}
                >
                  {m.time}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black font-bold text-[10px] shrink-0 mt-0.5">
                  U
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Orion is calculating recommendations…</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {promptSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#181820] hover:bg-[#22222c] border border-[#27272a] hover:border-emerald-500/40 text-[#a1a1aa] hover:text-[#f5f5f0] transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask Orion about destinations, adrenaline activities, or hidden spots…"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button variant="primary" onClick={() => handleSendMessage()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Four Recommendation Modes Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c22] pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveMode('next_experience');
                setDestinationInput('');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'next_experience'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#181820]'
              }`}
            >
              Mode A: Next Experience
            </button>

            <button
              onClick={() => {
                setActiveMode('nearby');
                setDestinationInput('');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'nearby'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#181820]'
              }`}
            >
              Mode B: Nearby Discoveries
            </button>

            <button
              onClick={() => {
                setActiveMode('bucket_list');
                setDestinationInput('');
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'bucket_list'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#181820]'
              }`}
            >
              Mode C: Personal Bucket List
            </button>

            <button
              onClick={() => setActiveMode('destination')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'destination'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-[#a1a1aa] hover:text-[#f5f5f0] hover:bg-[#181820]'
              }`}
            >
              Mode D: Destination Inspiration
            </button>
          </div>

          {activeMode === 'destination' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Type country/city (e.g. Japan, Switzerland)…"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5" />}
                className="py-1 text-xs"
              />
            </div>
          )}
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((rec) => {
            const isSaved = savedIds.has(rec.id);

            return (
              <div
                key={rec.id}
                className="bg-[#121215] border border-[#23232b] hover:border-emerald-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  {/* Photo */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-[#18181f]">
                    <img
                      src={rec.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="emerald" size="sm" className="bg-black/70 backdrop-blur-md">
                        {rec.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-sm font-bold text-[#f5f5f0] group-hover:text-emerald-300 transition-colors">
                      {rec.title}
                    </h3>

                    <p className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{rec.location_name}</span>
                    </p>

                    <p className="text-xs text-[#71717a] leading-relaxed">
                      {rec.description}
                    </p>

                    {/* Grounded Explanation Box */}
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Why Orion Recommended This:
                      </p>
                      <p className="text-[11px] text-emerald-200/90 leading-snug">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 border-t border-[#1c1c22] bg-[#0e0e12] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/globe"
                      onClick={() => handleFly(rec)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      <Globe2 className="w-3 h-3" /> Globe
                    </Link>

                    {rec.external_url && (
                      <a
                        href={rec.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#71717a] hover:text-[#f5f5f0] flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Details
                      </a>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isSaved ? 'secondary' : 'glow'}
                    disabled={isSaved}
                    onClick={() => handleSaveToWishlist(rec)}
                    className="text-xs py-1"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3 h-3 text-emerald-950" />
                        <span>Save to Wishlist</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
