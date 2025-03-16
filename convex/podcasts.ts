import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getS3Client } from "./utils/s3";

// Get all podcasts
export const getPodcasts = query({
  handler: async (ctx) => {
    return await ctx.db.query("podcasts").collect();
  },
});

// Get a single podcast by ID
export const getPodcast = query({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new podcast
export const createPodcast = mutation({
  args: {
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
    imageFile: v.string(), // Base64 encoded image
  },
  handler: async (ctx, args) => {
    // Upload image to S3
    const s3 = getS3Client();
    const imageBuffer = Buffer.from(args.imageFile.split(",")[1], "base64");
    const s3ImageKey = `podcasts/images/${Date.now()}.jpg`;
    
    await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME || "a-ok-rss",
      Key: s3ImageKey,
      Body: imageBuffer,
      ContentType: "image/jpeg",
    }).promise();

    // Create podcast in database
    const podcastId = await ctx.db.insert("podcasts", {
      title: args.title,
      description: args.description,
      link: args.link,
      language: args.language,
      copyright: args.copyright,
      author: args.author,
      ownerName: args.ownerName,
      ownerEmail: args.ownerEmail,
      imageUrl: args.imageUrl,
      explicit: args.explicit,
      categories: args.categories,
      s3ImageKey: s3ImageKey,
    });

    return podcastId;
  },
});

// Update an existing podcast
export const updatePodcast = mutation({
  args: {
    id: v.id("podcasts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    language: v.optional(v.string()),
    copyright: v.optional(v.string()),
    author: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    explicit: v.optional(v.boolean()),
    categories: v.optional(v.array(v.string())),
    imageFile: v.optional(v.string()), // Base64 encoded image
  },
  handler: async (ctx, args) => {
    const { id, imageFile, ...updateData } = args;
    
    // Get existing podcast
    const podcast = await ctx.db.get(id);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    // Upload new image to S3 if provided
    if (imageFile) {
      const s3 = getS3Client();
      const imageBuffer = Buffer.from(imageFile.split(",")[1], "base64");
      const s3ImageKey = `podcasts/images/${Date.now()}.jpg`;
      
      await s3.upload({
        Bucket: process.env.S3_BUCKET_NAME || "a-ok-rss",
        Key: s3ImageKey,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      }).promise();

      // Add the new S3 image key to the update data
      Object.assign(updateData, { s3ImageKey });
    }

    // Update podcast in database
    await ctx.db.patch(id, updateData);
    
    return id;
  },
});

// Delete a podcast
export const deletePodcast = mutation({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    // Get all episodes for this podcast
    const episodes = await ctx.db
      .query("episodes")
      .filter((q) => q.eq(q.field("podcastId"), args.id))
      .collect();
    
    // Delete all episodes
    for (const episode of episodes) {
      await ctx.db.delete(episode._id);
    }
    
    // Delete all RSS feeds
    const rssFeeds = await ctx.db
      .query("rssFeeds")
      .filter((q) => q.eq(q.field("podcastId"), args.id))
      .collect();
    
    for (const feed of rssFeeds) {
      await ctx.db.delete(feed._id);
    }
    
    // Delete the podcast
    await ctx.db.delete(args.id);
    
    return args.id;
  },
});
