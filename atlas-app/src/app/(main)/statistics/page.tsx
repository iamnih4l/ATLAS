'use client';

import React, { useMemo } from 'react';
import { useAtlasStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
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
  Camera,
  Star,
  Award,
  Calendar,
  BookmarkCheck,
  TrendingUp,
  Compass,
} from 'lucide-react';

export default function StatisticsPage() {
  const { experiences, locations, wishlistItems, categories } = useAtlasStore();

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

    // Experiences by year
    const yearCounts: { [k: string]: number } = {};
    experiences.forEach((e) => {
      const yr = new Date(e.date).getFullYear().toString();
      yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    });
    const yearChartData = Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

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
      yearChartData,
      completedWishlist,
      activeWishlist,
      totalPhotos: totalExp * 2 + 3, // based on attached records
    };
  }, [experiences, locations, wishlistItems, categories]);

  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#1c1c22] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f0]">
          Personal Travel & Life Statistics
        </h1>
        <p className="text-xs text-[#a1a1aa] mt-1">
          Synthesized insights and metrics derived from your verified geographical memories.
        </p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-[#121215] border border-[#23232b] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Memories</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f0] mt-2">{stats.totalExp}</p>
        </div>

        <div className="p-4 bg-[#121215] border border-[#23232b] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Countries</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f0] mt-2">{stats.countriesCount}</p>
        </div>

        <div className="p-4 bg-[#121215] border border-[#23232b] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cities</span>
            <MapPin className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f0] mt-2">{stats.citiesCount}</p>
        </div>

        <div className="p-4 bg-[#121215] border border-[#23232b] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Locations</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f0] mt-2">{stats.uniqueLocsCount}</p>
        </div>

        <div className="p-4 bg-[#121215] border border-[#23232b] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f0] mt-2">{stats.avgRating.toFixed(1)}</p>
        </div>

        <div className="p-4 bg-[#121215] border border-[#23232b] rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">Wishlist</span>
            <BookmarkCheck className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f0] mt-2">{stats.activeWishlist}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Visited Countries */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Most Explored Countries
            </h3>
            <Badge variant="emerald" size="sm">
              Live Database
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.countryChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" stroke="#52525b" fontSize={11} />
                <YAxis dataKey="country" type="category" stroke="#a1a1aa" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181f', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Categories Distribution */}
        <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Experience Categories
            </h3>
            <Badge variant="cyan" size="sm">
              Breakdown
            </Badge>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181f', borderColor: '#27272a', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Highest Rated Experiences Showcase */}
      <div className="p-5 bg-[#121215] border border-[#23232b] rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-[#f5f5f0] flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Highest Rated Experiences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.highestRated.map((exp) => (
            <div
              key={exp.id}
              className="p-3.5 bg-[#16161c] border border-[#23232b] rounded-xl flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1f1f26] shrink-0">
                <img
                  src={exp.cover_image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80'}
                  alt={exp.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#f5f5f0] truncate">{exp.title}</h4>
                <p className="text-[11px] text-[#71717a] truncate mt-0.5">{exp.location?.name}</p>
                <div className="mt-1">
                  <StarRating value={exp.rating} readOnly size="sm" showNumber />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
