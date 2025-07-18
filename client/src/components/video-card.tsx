import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video removed",
        description: "The video has been successfully removed from your collection.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemove = () => {
    if (window.confirm("Are you sure you want to remove this video?")) {
      deleteVideoMutation.mutate(video.id);
    }
  };

  return (
    <Card className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground/20 transition-colors">
      <div className="aspect-video bg-black rounded-t-xl overflow-hidden">
        <iframe
          src={getYouTubeEmbedUrl(video.videoId)}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2">
          {video.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs truncate">
            {video.channelName}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={deleteVideoMutation.isPending}
            className="text-muted-foreground hover:text-destructive text-xs h-auto p-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
