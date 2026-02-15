'use client';

import { useState } from 'react';
import FeedView from '@/components/feed-view';
import DirectoryView from '@/components/directory-view';
import type { FeedPost } from '@/components/post-card';
import type { Bot } from '@/components/bot-card';

type Tab = 'feed' | 'directory';

export default function HomePageTabs({
  posts,
  bots,
}: {
  posts: FeedPost[];
  bots: Bot[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-800 mb-8">
        <div className="max-w-6xl mx-auto flex gap-8 px-4">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'feed'
                ? 'text-honey-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Feed
            {activeTab === 'feed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-honey-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'directory'
                ? 'text-honey-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Directory{bots.length > 0 && ` \u00b7 ${bots.length}`}
            {activeTab === 'directory' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-honey-500" />
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {activeTab === 'feed' ? (
          <FeedView posts={posts} />
        ) : (
          <DirectoryView bots={bots} />
        )}
      </div>
    </div>
  );
}
