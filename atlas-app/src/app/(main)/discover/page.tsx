'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAtlasStore } from '@/lib/store';
import {
  getRecommendationsForMode,
} from '@/lib/ai-companion';
import { AIRecommendation } from '@/types';
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
} from 'lucide-react';
import { DoodleSparkle, DoodleUnderline, WashiTape, PassportStamp } from '@/components/ui/doodles';
import { PixelPlane } from '@/components/ui/pixel-stickers';
import { StarSpike, JoyBlob } from '@/components/ui/mascot-doodles';
import { VerifiedStamp, TicketBadge } from '@/components/ui/atlas-illustrations';

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
        'Hi there! I am Orion, your personal ATLAS travel & adventure companion! 🌟 I study your favorite recorded memories, highest ratings, and bucket list dreams to find verified real-world places you will love. Where do you want to explore next?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load recommendations when mode or destination changes
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

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      role: 'user' as const,
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
            role: m.role,
            content: m.content,
          })),
          experiences,
          locations,
        }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.reply;
      }
      if (!reply) {
        reply =
          'That sounds like an incredible idea! Based on your adventures, I recommend checking out our suggestions below. I have filtered verified real-world coordinates for you!';
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'orion',
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
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

  const promptSuggestions = [
    'Recommend something thrilling like Skydiving',
    'Where should I travel in Japan next?',
    'Find hidden nature escapes near mountains',
    'Best food destinations for a foodie adventure',
  ];

  return (
    <div className="flex-1 overflow-y-auto pt-24 sm:pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-8 w-full bg-warm-cream-grid min-h-screen">
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
            Smart, personalized recommendations that map your memories to find unforgettable real-world adventures.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#6425F5] text-white flex items-center gap-2 border-2 border-[#171313] shadow-pop-sm">
          <Bot className="w-4 h-4 stroke-[2.5]" /> Verified GPS Coordinates
        </span>
      </div>

      {/* Orion Conversational Box with Bento-Pop Styling */}
      <div className="bg-white border-2 border-[#171313] rounded-3xl p-6 space-y-4 shadow-pop-lg relative">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#171313]">
          <span className="text-xs font-black text-[#171313] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6425F5] stroke-[2.5]" />
            Chat with Orion AI
          </span>
          <span className="text-[11px] text-[#171313] font-black bg-[#FFD45A] border-2 border-[#171313] px-3 py-0.5 rounded-full shadow-pop-sm">
            Trained on {experiences.length} memories ✦
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
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
                className={`p-4 rounded-3xl max-w-xl leading-relaxed text-xs font-bold border-2 border-[#171313] shadow-pop-sm ${
                  m.role === 'user'
                    ? 'bg-[#F04432] text-white rounded-tr-xs'
                    : 'bg-[#FFF4D9] text-[#171313] rounded-tl-xs'
                }`}
              >
                {m.content}
                <div
                  className={`text-[10px] mt-1 text-right font-black ${
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
              <span>Orion is plotting adventures for you…</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t-2 border-[#171313]/10">
          {promptSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#FFF4D9] hover:bg-[#FFD45A] border-2 border-[#171313] text-[#171313] font-bold shadow-pop-sm transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2">
          <input
            placeholder="Ask Orion about destinations, adrenaline thrills, or hidden foodie spots…"
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
              Mode B: Nearby Gems
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
              Mode C: Bucket List Ideas
            </button>

            <button
              onClick={() => setActiveMode('destination')}
              className={cn(
                'px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 border-[#171313]',
                activeMode === 'destination'
                  ? 'bg-[#FFD45A] text-[#171313] shadow-pop scale-105'
                  : 'bg-white text-[#171313]/70 hover:bg-[#FFD45A]/30 shadow-pop-sm'
              )}
            >
              Mode D: Destination Inspiration
            </button>
          </div>

          {activeMode === 'destination' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                placeholder="Type country/city (e.g. Japan, Switzerland)…"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="bg-white border-2 border-[#171313] rounded-2xl px-4 py-2 text-xs text-[#171313] placeholder-[#171313]/50 focus:outline-none font-black shadow-pop-sm"
              />
            </div>
          )}
        </div>

        {/* Recommendation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const isSaved = savedIds.has(rec.id);

            return (
              <div
                key={rec.id}
                className={cn(
                  'relative bg-white border-2 border-[#171313] rounded-3xl p-4 pb-4 flex flex-col justify-between transition-all duration-300 group shadow-pop hover:shadow-pop-lg hover:-translate-y-1',
                  rec.id.charCodeAt(0) % 2 === 0 ? '-rotate-[0.5deg] hover:rotate-0' : 'rotate-[0.5deg] hover:rotate-0'
                )}
              >
                {/* Washi Tape Strip */}
                <WashiTape
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20"
                  rotate={rec.id.charCodeAt(0) % 2 === 0 ? '-2deg' : '2deg'}
                  color="bg-[#FFD45A]/90"
                />

                <div>
                  {/* Photo */}
                  <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-[#171313] border-2 border-[#171313] shadow-pop-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rec.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FFD45A] text-[#171313] uppercase border border-[#171313] shadow-pop-sm">
                        {rec.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-2 pt-3 space-y-2">
                    <h3 className="text-sm font-black text-[#171313] group-hover:text-[#6425F5] transition-colors">
                      {rec.title}
                    </h3>

                    <p className="text-xs text-[#171313]/70 font-black flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F04432] shrink-0 stroke-[2.5]" />
                      <span>{rec.location_name}</span>
                    </p>

                    <p className="text-xs text-[#171313]/80 font-medium leading-relaxed">
                      {rec.description}
                    </p>

                    {/* Grounded Explanation Box */}
                    <div className="p-3 bg-[#FFF4D9] rounded-2xl border-2 border-[#171313] space-y-1 mt-2 shadow-pop-sm">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#6425F5] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#6425F5] stroke-[2.5]" /> Why Orion Picked This:
                      </p>
                      <p className="text-[11px] text-[#171313] leading-snug font-bold">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-2 pt-3 mt-1 border-t-2 border-[#171313]/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/globe"
                      onClick={() => handleFly(rec)}
                      className="text-xs text-[#171313] hover:text-[#6425F5] font-black flex items-center gap-1"
                    >
                      <Globe2 className="w-3.5 h-3.5 stroke-[2.5]" /> Fly on Earth
                    </Link>

                    {rec.external_url && (
                      <a
                        href={rec.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#171313]/60 hover:text-[#171313] flex items-center gap-1 font-bold"
                      >
                        <ExternalLink className="w-3 h-3" /> Details
                      </a>
                    )}
                  </div>

                  <button
                    disabled={isSaved}
                    onClick={() => handleSaveToWishlist(rec)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-[#171313] transition-all flex items-center gap-1 cursor-pointer',
                      isSaved
                        ? 'bg-emerald-200 text-[#171313] shadow-none'
                        : 'bg-[#FFD45A] text-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5'
                    )}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3] text-[#171313]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3 h-3 stroke-[2.5]" />
                        <span>Wishlist</span>
                      </>
                    )}
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
