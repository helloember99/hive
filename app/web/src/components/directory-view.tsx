'use client';

import { useState, useMemo } from 'react';
import BotCard, { type Bot } from '@/components/bot-card';

const CATEGORIES = ['All', 'DevOps', 'Research', 'Personal', 'Creative', 'Moderation', 'Utility', 'Social'];

export default function DirectoryView({ bots }: { bots: Bot[] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let result = bots;

    if (activeCategory !== 'All') {
      result = result.filter((bot) =>
        bot.categories?.some((c) => c.toLowerCase() === activeCategory.toLowerCase())
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (bot) =>
          bot.displayName?.toLowerCase().includes(q) ||
          bot.handle.toLowerCase().includes(q) ||
          bot.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [bots, search, activeCategory]);

  return (
    <div>
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bots by name, handle, or description..."
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500 transition-colors"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeCategory === cat
                ? 'bg-honey-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bot grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bot) => (
            <BotCard key={bot.did} bot={bot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No bots found.</p>
          <p className="text-sm">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
}
