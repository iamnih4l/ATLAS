'use client';

import React, { useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { StarRating } from '@/components/ui/star-rating';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Globe,
  MapPin,
  Star,
  Award,
  BookmarkCheck,
  Compass,
  Sparkles,
} from 'lucide-react';
import { DoodleSparkle, DoodleUnderline } from '@/components/ui/doodles';
import { PlayfulCompass, VerifiedStamp } from '@/components/ui/atlas-illustrations';

export default function StatisticsPage() {
  const { experiences, wishlistItems, categories } = useAtlasStore();

  // 1. Core aggregates calculated directly from records
  const stats = useMemo(() => {
    const totalExp = experiences.length;
    const countries = Array.from(
      new Set(experiences.map((e) => e.location?.country).filter(Boolean))
    );
    const cities = Array.from(
      new Set(experiences.map((e) => e.location?.city).filter(Boolean))
    );
    const uniqueLocs = Array.from(new Set(experiences.map((e) => e.location_id)));

    // Rating stats
    const ratings = experiences.map((e) => e.rating).filter((r): r is number => r !== null);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // Highest rated
    const highestRated = [...experiences]
      .filter((e) => e.rating !== null)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    // Countries breakdown
    const countryCounts: { [k: string]: number } = {};
    experiences.forEach((e) => {
      const c = e.location?.country || 'Unknown';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const countryChartData = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Categories breakdown
    const categoryCounts: { [k: string]: number } = {};
    experiences.forEach((e) => {
      const cat = categories.find((c) => c.id === e.category_id)?.name || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Wishlist ratio
    const completedWishlist = wishlistItems.filter((w) => w.is_completed).length;
    const activeWishlist = wishlistItems.filter((w) => !w.is_completed).length;

    return {
      totalExp,
      countriesCount: countries.length,
      citiesCount: cities.length,
      uniqueLocsCount: uniqueLocs.length,
      avgRating,
      highestRated,
      countryChartData,
      categoryChartData,
      completedWishlist,
      activeWishlist,
    };
  }, [experiences, wishlistItems, categories]);

  const COLORS = ['#6425F5', '#FFD45A', '#F04432', '#326BEE', '#10b981', '#f59e0b'];

  return (
    <div className="flex-1 overflow-y-auto pt-24 sm:pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-8 w-full bg-warm-cream-grid min-h-screen">
      {/* Page Header */}
      <div className="border-b-2 border-[#171313]/15 pb-6">
        <div className="flex items-center gap-2.5">
          <PlayfulCompass size={32} />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#171313] font-sans">
              Personal Travel & Life Stats
            </h1>
            <DoodleUnderline className="text-[#FFD45A] mt-0.5" />
          </div>
          <DoodleSparkle size={20} color="#6425F5" />
        </div>
        <p className="text-xs text-[#171313]/70 mt-1.5 font-bold">
          Synthesized insights and milestones derived from your verified memories.
        </p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-[#FFD45A] border-2 border-[#171313] rounded-3xl flex flex-col justify-between shadow-pop hover:scale-105 transition-transform">
          <div className="flex items-center justify-between text-[#171313]">
            <span className="text-[11px] font-black uppercase tracking-wider">Memories</span>
            <Award className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-3xl font-black text-[#171313] mt-2">{stats.totalExp}</p>
        </div>

        <div className="p-4 bg-[#326BEE] text-white border-2 border-[#171313] rounded-3xl flex flex-col justify-between shadow-pop hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-90">Countries</span>
            <Globe className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-3xl font-black mt-2">{stats.countriesCount}</p>
        </div>

        <div className="p-4 bg-[#F04432] text-white border-2 border-[#171313] rounded-3xl flex flex-col justify-between shadow-pop hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-90">Cities</span>
            <MapPin className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-3xl font-black mt-2">{stats.citiesCount}</p>
        </div>

        <div className="p-4 bg-[#6425F5] text-white border-2 border-[#171313] rounded-3xl flex flex-col justify-between shadow-pop hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-90">Locations</span>
            <Compass className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-3xl font-black mt-2">{stats.uniqueLocsCount}</p>
        </div>

        <div className="p-4 bg-white border-2 border-[#171313] rounded-3xl flex flex-col justify-between shadow-pop hover:scale-105 transition-transform">
          <div className="flex items-center justify-between text-[#171313]">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#171313]/70">Avg Rating</span>
            <Star className="w-4 h-4 text-[#FFD45A] fill-[#FFD45A]" />
          </div>
          <p className="text-3xl font-black text-[#171313] mt-2">{stats.avgRating.toFixed(1)}</p>
        </div>

        <div className="p-4 bg-emerald-400 text-[#171313] border-2 border-[#171313] rounded-3xl flex flex-col justify-between shadow-pop hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider">Wishlist</span>
            <BookmarkCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-3xl font-black mt-2">{stats.activeWishlist}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Visited Countries */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <div className="flex items-center justify-between border-b-2 border-[#171313]/10 pb-3">
            <h3 className="text-sm font-black text-[#171313] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#F04432] stroke-[2.5]" />
              Most Explored Countries
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#FFD45A] text-[#171313] border border-[#171313] shadow-pop-sm">
              Live Data
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {stats.countryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#171313]/50 text-xs font-bold">
                No countries logged yet. Record an experience to see live analytics!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.countryChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" stroke="#171313" fontSize={11} fontWeight={700} />
                  <YAxis dataKey="country" type="category" stroke="#171313" fontSize={11} fontWeight={800} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFF4D9', borderColor: '#171313', borderWidth: '2px', borderRadius: '16px', boxShadow: '3px 3px 0px #171313' }}
                    itemStyle={{ color: '#171313', fontWeight: 900 }}
                  />
                  <Bar dataKey="count" fill="#F04432" stroke="#171313" strokeWidth={2} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Categories Distribution */}
        <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
          <div className="flex items-center justify-between border-b-2 border-[#171313]/10 pb-3">
            <h3 className="text-sm font-black text-[#171313] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#326BEE] stroke-[2.5]" />
              Experience Categories
            </h3>
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#326BEE] text-white border border-[#171313] shadow-pop-sm">
              Breakdown
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            {stats.categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#171313]/50 text-xs font-bold">
                No category breakdown yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    stroke="#171313"
                    strokeWidth={2}
                    dataKey="value"
                  >
                    {stats.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFF4D9', borderColor: '#171313', borderWidth: '2px', borderRadius: '16px', boxShadow: '3px 3px 0px #171313' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Highest Rated Experiences Showcase */}
      <div className="p-6 bg-white border-2 border-[#171313] rounded-3xl space-y-4 shadow-pop">
        <h3 className="text-sm font-black text-[#171313] flex items-center gap-2 border-b-2 border-[#171313]/10 pb-3">
          <Star className="w-4 h-4 text-[#FFD45A] fill-[#FFD45A]" />
          Highest Rated Memories
        </h3>

        {stats.highestRated.length === 0 ? (
          <div className="py-8 text-center text-[#171313]/50 text-xs font-bold">
            Rate your experiences with stars to see your top milestones featured here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {stats.highestRated.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl flex items-center gap-3.5 shadow-pop-sm hover:shadow-pop transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#171313] shrink-0 border-2 border-[#171313]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80'}
                    alt={exp.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-[#171313] truncate">{exp.title}</h4>
                  <p className="text-[11px] text-[#171313]/70 font-bold truncate mt-0.5">{exp.location?.name}</p>
                  <div className="mt-1">
                    <StarRating value={exp.rating} readOnly size="sm" showNumber />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
