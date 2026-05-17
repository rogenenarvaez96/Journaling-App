import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { parseISO, differenceInDays, startOfDay } from 'date-fns';
import { Flame, Target, CalendarDays, Loader2 } from 'lucide-react';

const MOOD_COLORS = {
  Happy: '#22c55e',
  Productive: '#3b82f6',
  Neutral: '#94a3b8',
  Tired: '#f59e0b',
  Sad: '#64748b',
  Angry: '#ef4444'
};

const Analytics = () => {
  const [journals, setJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const { data } = await api.get('/journals');
        setJournals(data);
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJournals();
  }, []);

  const stats = useMemo(() => {
    if (!journals.length) return { currentStreak: 0, longestStreak: 0, total: 0, moodData: [] };

    // 1. Calculate Mood Distribution
    const moodCounts = {};
    journals.forEach(j => {
      moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
    });
    const moodData = Object.keys(moodCounts).map(mood => ({
      name: mood,
      count: moodCounts[mood]
    })).sort((a, b) => b.count - a.count);

    // 2. Calculate Streaks
    // Sort oldest to newest
    const sortedDates = [...new Set(journals.map(j => startOfDay(parseISO(j.createdAt)).getTime()))].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = differenceInDays(sortedDates[i], sortedDates[i-1]);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // Check if current streak is still active (written today or yesterday)
    const lastDate = sortedDates[sortedDates.length - 1];
    const today = startOfDay(new Date()).getTime();
    const daysSinceLastEntry = differenceInDays(today, lastDate);

    if (daysSinceLastEntry <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak, total: journals.length, moodData };
  }, [journals]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-terracotta" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Reflection Analytics</h1>
        <p className="text-sm opacity-60">Visualize your writing habits and emotional trends</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4">
            <Flame size={28} />
          </div>
          <h2 className="text-4xl font-bold mb-1">{stats.currentStreak}</h2>
          <p className="text-sm opacity-60 font-medium uppercase tracking-wider">Day Streak</p>
        </div>

        <div className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-amethyst/10 text-amethyst rounded-full flex items-center justify-center mb-4">
            <Target size={28} />
          </div>
          <h2 className="text-4xl font-bold mb-1">{stats.longestStreak}</h2>
          <p className="text-sm opacity-60 font-medium uppercase tracking-wider">Best Streak</p>
        </div>

        <div className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center mb-4">
            <CalendarDays size={28} />
          </div>
          <h2 className="text-4xl font-bold mb-1">{stats.total}</h2>
          <p className="text-sm opacity-60 font-medium uppercase tracking-wider">Total Entries</p>
        </div>
      </div>

      {stats.moodData.length > 0 ? (
        <div className="bg-white/50 dark:bg-obsidian-elevated p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <h3 className="text-xl font-serif font-bold mb-8">Mood Distribution</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.moodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="currentColor" className="opacity-50 text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="opacity-50 text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#12131c', border: 'none', borderRadius: '12px', color: '#fff'}} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.name] || '#d97736'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 opacity-50">Write more entries to unlock mood analytics.</div>
      )}
    </div>
  );
};

export default Analytics;
