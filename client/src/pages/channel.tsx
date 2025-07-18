import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { VideoCard } from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Video } from "@shared/schema";

export default function ChannelPage() {
  const { channel: channelName } = useParams();
  const decodedChannelName = decodeURIComponent(channelName || "");

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos", "channel", decodedChannelName],
    queryFn: async () => {
      const response = await fetch(`/api/videos/channel/${encodeURIComponent(decodedChannelName)}`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">{decodedChannelName}</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? "Loading..." : `${videos?.length || 0} video${videos?.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎥</span>
            </div>
            <h3 className="text-lg font-medium mb-2">No videos yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              This channel doesn't have any videos in your collection yet. 
              Videos will appear here automatically as they're added.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}