import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  podcasts: defineTable({
    title: v.string(),
    description: v.string(),
    link: v.string(),
    language: v.string(),
    copyright: v.string(),
    author: v.string(),
    ownerName: v.string(),
    ownerEmail: v.string(),
    imageUrl: v.string(),
    explicit: v.boolean(),
    categories: v.array(v.string()),
    s3ImageKey: v.string(),
  }),

  episodes: defineTable({
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.string(),
    link: v.string(),
    guid: v.string(),
    pubDate: v.string(),
    duration: v.number(),
    audioFileUrl: v.string(),
    imageUrl: v.optional(v.string()),
    explicit: v.boolean(),
    keywords: v.array(v.string()),
    chapters: v.array(v.object({
      startTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
    })),
    transcript: v.optional(v.string()),
    s3AudioKey: v.string(),
    s3ImageKey: v.optional(v.string()),
    s3TranscriptKey: v.optional(v.string()),
  }),

  rssFeeds: defineTable({
    podcastId: v.id("podcasts"),
    version: v.number(),
    publishedAt: v.string(),
    s3XmlKey: v.string(),
    isLatest: v.boolean(),
  }),
});
