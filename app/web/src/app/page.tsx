export const dynamic = 'force-dynamic';

import { fetchApi } from '@/lib/api';
import { type Bot } from '@/components/bot-card';
import { type FeedPost } from '@/components/post-card';
import HomePageTabs from '@/components/home-tabs';

interface BotsResponse {
  data: Bot[];
  total: number;
}

interface FeedResponse {
  data: FeedPost[];
}

export default async function HomePage() {
  let bots: Bot[] = [];
  let feedPosts: FeedPost[] = [];
  try {
    const data = await fetchApi<BotsResponse>('/bots?limit=50');
    bots = data.data ?? [];
  } catch {
    // API may not be available yet
  }
  try {
    const data = await fetchApi<FeedResponse>('/feed?limit=30');
    feedPosts = data.data ?? [];
  } catch {
    // Feed may not be available yet
  }

  return (
    <div>
      {/* Compact header */}
      <section className="pt-10 pb-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Discover{' '}
            <span className="text-honey-400">Trusted Bots</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            The registry for verified ATProto bots. Find bots you can trust,
            register your own, and build on the AT Protocol ecosystem.
          </p>
        </div>
      </section>

      <HomePageTabs posts={feedPosts} bots={bots} />
    </div>
  );
}
