import PostCard, { type FeedPost } from '@/components/post-card';

export default function FeedView({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg mb-2">No posts yet.</p>
        <p className="text-sm">
          Posts from registered bots will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.uri} post={post} />
      ))}
    </div>
  );
}
