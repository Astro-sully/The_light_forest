import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, insertChannelSchema } from "@shared/schema";
import { z } from "zod";

const addChannelSchema = z.object({
  channelUrl: z.string().url(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all channels
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getAllChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // Add new channel
  app.post("/api/channels", async (req, res) => {
    try {
      const { channelUrl } = addChannelSchema.parse(req.body);
      
      // Extract channel info from YouTube URL
      const channelInfo = await fetchChannelMetadata(channelUrl);
      
      // Check if channel already exists
      const existingChannel = await storage.getChannelByName(channelInfo.name);
      if (existingChannel) {
        return res.status(400).json({ message: "Channel already exists in your collection" });
      }
      
      const channelData = {
        name: channelInfo.name,
        profileImage: channelInfo.profileImage,
        channelId: channelInfo.channelId,
        description: channelInfo.description,
      };

      const channel = await storage.createChannel(channelData);
      
      // Fetch all videos from this channel in the background
      fetchChannelVideos(channelInfo.channelId, channelInfo.name).catch(error => {
        console.error(`Failed to fetch videos for channel ${channelInfo.name}:`, error);
      });
      
      res.json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error adding channel:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to add channel" });
    }
  });

  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get videos by channel
  app.get("/api/videos/channel/:channel", async (req, res) => {
    try {
      const { channel } = req.params;
      const videos = await storage.getVideosByChannel(decodeURIComponent(channel));
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Delete video
  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVideo(id);
      
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

async function fetchChannelMetadata(channelUrl: string): Promise<{ name: string; profileImage: string; channelId: string; description: string }> {
  const channelId = extractChannelId(channelUrl);
  if (!channelId) {
    throw new Error("Invalid YouTube channel URL");
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }

  try {
    // First, resolve the channel ID if it's a custom URL
    let resolvedChannelId = channelId;
    
    // If it's not a channel ID (doesn't start with UC), try to resolve it
    if (!channelId.startsWith('UC')) {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&maxResults=1&key=${apiKey}`
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.items && searchData.items.length > 0) {
          resolvedChannelId = searchData.items[0].snippet.channelId;
        }
      }
    }

    // Get channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${resolvedChannelId}&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      throw new Error("Failed to fetch channel data from YouTube");
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error("Channel not found");
    }

    const channel = channelData.items[0];
    
    return {
      name: channel.snippet.title,
      profileImage: channel.snippet.thumbnails.default?.url || null,
      channelId: resolvedChannelId,
      description: channel.snippet.description || null
    };
  } catch (error) {
    console.error("Error fetching channel metadata:", error);
    throw new Error("Failed to fetch channel information");
  }
}

function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/channel\/([^\/\?]+)/,
    /youtube\.com\/c\/([^\/\?]+)/,
    /youtube\.com\/user\/([^\/\?]+)/,
    /youtube\.com\/@([^\/\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

async function fetchChannelVideos(channelId: string, channelName: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("YouTube API key not configured");
    return;
  }

  console.log(`Starting to fetch videos for channel: ${channelName} (ID: ${channelId})`);

  try {
    let nextPageToken = '';
    let allVideos: any[] = [];
    const maxVideos = 50; // Reduced for testing
    
    do {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=25&pageToken=${nextPageToken}&key=${apiKey}`;
      console.log(`Fetching videos from: ${searchUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch videos from YouTube API: ${response.status} ${errorText}`);
        break;
      }

      const data = await response.json();
      console.log(`Found ${data.items?.length || 0} videos in this batch`);
      
      if (data.items) {
        allVideos.push(...data.items);
      }
      
      nextPageToken = data.nextPageToken || '';
      
      // Stop if we've reached our limit
      if (allVideos.length >= maxVideos) {
        break;
      }
    } while (nextPageToken && allVideos.length < maxVideos);

    console.log(`Total videos found: ${allVideos.length}`);

    // Filter out shorts (videos under 60 seconds) by checking duration
    const videoIds = allVideos.map(video => video.id.videoId).filter(id => id).join(',');
    console.log(`Video IDs to check: ${videoIds.substring(0, 100)}...`);
    
    if (videoIds) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log(`Got details for ${detailsData.items?.length || 0} videos`);
        
        let savedCount = 0;
        for (const video of detailsData.items || []) {
          // Parse duration to filter out shorts
          const duration = video.contentDetails.duration;
          const durationInSeconds = parseDuration(duration);
          
          console.log(`Processing: ${video.snippet.title} - Duration: ${duration} (${durationInSeconds}s)`);
          
          // Skip videos under 60 seconds (likely Shorts)
          if (durationInSeconds < 60) {
            console.log(`Skipping short video: ${video.snippet.title}`);
            continue;
          }
          
          const videoData = {
            title: video.snippet.title,
            videoId: video.id,
            channelName: channelName,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnail: video.snippet.thumbnails.medium?.url || null,
            duration: duration,
            publishedAt: video.snippet.publishedAt
          };

          try {
            const savedVideo = await storage.createVideo(videoData);
            console.log(`✓ Saved video: ${video.snippet.title} (ID: ${savedVideo.id})`);
            savedCount++;
          } catch (error) {
            console.error(`✗ Failed to store video ${video.snippet.title}:`, error);
          }
        }
        console.log(`Saved ${savedCount} longform videos for channel: ${channelName}`);
      } else {
        const errorText = await detailsResponse.text();
        console.error(`Failed to fetch video details: ${detailsResponse.status} ${errorText}`);
      }
    }
    
    console.log(`Finished processing videos for channel: ${channelName}`);
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelName}:`, error);
  }
}

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration format (PT1H2M3S) to seconds
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}
