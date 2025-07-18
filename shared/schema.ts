import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  profileImage: text("profile_image"),
  channelId: text("channel_id"),
  description: text("description"),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  videoId: text("video_id").notNull(),
  channelName: text("channel_name").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  duration: text("duration"),
  publishedAt: text("published_at"),
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  name: true,
  profileImage: true,
  channelId: true,
  description: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  videoId: true,
  channelName: true,
  url: true,
  thumbnail: true,
  duration: true,
  publishedAt: true,
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
