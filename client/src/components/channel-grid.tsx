import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { Channel } from "@shared/schema";

export function ChannelGrid() {
  const { data: channels, isLoading } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card border border-border p-4">
            <Skeleton className="w-full aspect-square rounded-full mb-3" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </Card>
        ))}
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📺</span>
        </div>
        <h3 className="text-lg font-medium mb-2">No channels yet</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Start building your curated collection by adding your first YouTube channel above. 
          Your channels will appear here as clickable profile pictures.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Card className="bg-card border border-border hover:border-muted-foreground/20 transition-all duration-200 group">
      <div className="p-4">
        <Link href={`/channel/${encodeURIComponent(channel.name)}`}>
          <div className="cursor-pointer">
            <div className="w-full aspect-square rounded-full overflow-hidden mb-3 bg-muted">
              {channel.profileImage ? (
                <img
                  src={channel.profileImage}
                  alt={channel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-center truncate group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
          </div>
        </Link>
      </div>
    </Card>
  );
}