import { videos, channels, type Video, type Channel, type InsertVideo, type InsertChannel } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
  
  // Channel CRUD operations
  getAllChannels(): Promise<Channel[]>;
  getChannelByName(name: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  deleteChannel(id: number): Promise<boolean>;
  
  // Video CRUD operations
  getAllVideos(): Promise<Video[]>;
  getVideosByChannel(channelName: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  deleteVideo(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private channels: Map<number, Channel>;
  private videos: Map<number, Video>;
  private currentUserId: number;
  private currentChannelId: number;
  private currentVideoId: number;

  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.videos = new Map();
    this.currentUserId = 1;
    this.currentChannelId = 1;
    this.currentVideoId = 1;
  }

  async getUser(id: number): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getAllChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async getChannelByName(name: string): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(
      channel => channel.name === name
    );
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.currentChannelId++;
    const channel: Channel = { 
      ...insertChannel, 
      id,
      profileImage: insertChannel.profileImage || null,
      channelId: insertChannel.channelId || null,
      description: insertChannel.description || null
    };
    this.channels.set(id, channel);
    return channel;
  }

  async deleteChannel(id: number): Promise<boolean> {
    return this.channels.delete(id);
  }

  async getVideosByChannel(channelName: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      video => video.channelName === channelName
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const video: Video = { 
      ...insertVideo, 
      id,
      thumbnail: insertVideo.thumbnail || null,
      duration: insertVideo.duration || null,
      publishedAt: insertVideo.publishedAt || null
    };
    this.videos.set(id, video);
    return video;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }
}

export const storage = new MemStorage();
