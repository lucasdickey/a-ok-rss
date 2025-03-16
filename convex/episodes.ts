import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { uploadToS3, getS3Url } from "./utils/s3";
import { generateRssFeed } from "./rss";
import { Anthropic } from "@anthropic-ai/sdk";
import { Ai } from "@cloudflare/ai";

// Get all episodes for a podcast
export const getEpisodes = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("episodes")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .order("desc")
      .collect();
  },
});

// Get a single episode by ID
export const getEpisode = query({
  args: { id: v.id("episodes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new episode
export const createEpisode = mutation({
  args: {
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.string(),
    link: v.string(),
    guid: v.string(),
    pubDate: v.string(),
    duration: v.number(),
    explicit: v.boolean(),
    keywords: v.array(v.string()),
    audioFile: v.string(), // Base64 encoded audio
    imageFile: v.optional(v.string()), // Base64 encoded image
  },
  handler: async (ctx, args) => {
    // Get the podcast
    const podcast = await ctx.db.get(args.podcastId);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    // Upload audio to S3
    const audioBuffer = Buffer.from(args.audioFile.split(",")[1], "base64");
    const s3AudioKey = `episodes/audio/${Date.now()}.mp3`;
    const audioUrl = await uploadToS3(audioBuffer, s3AudioKey, "audio/mpeg");

    // Upload image to S3 if provided
    let s3ImageKey = undefined;
    if (args.imageFile) {
      const imageBuffer = Buffer.from(args.imageFile.split(",")[1], "base64");
      s3ImageKey = `episodes/images/${Date.now()}.jpg`;
      await uploadToS3(imageBuffer, s3ImageKey, "image/jpeg");
    }

    // Create episode in database
    const episodeId = await ctx.db.insert("episodes", {
      podcastId: args.podcastId,
      title: args.title,
      description: args.description,
      link: args.link,
      guid: args.guid,
      pubDate: args.pubDate,
      duration: args.duration,
      audioFileUrl: audioUrl,
      imageUrl: s3ImageKey ? getS3Url(s3ImageKey) : undefined,
      explicit: args.explicit,
      keywords: args.keywords,
      chapters: [], // Will be populated by AI later
      s3AudioKey: s3AudioKey,
      s3ImageKey: s3ImageKey,
    });

    // Schedule AI processing
    await ctx.scheduler.runAfter(0, "episodes:processAudio", { episodeId });

    // Generate and publish RSS feed
    await ctx.scheduler.runAfter(0, "rss:generateFeed", { podcastId: args.podcastId });

    return episodeId;
  },
});

// Process audio with AI (transcription, chapter generation)
export const processAudio = action({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, args) => {
    // Get the episode
    const episode = await ctx.db.get(args.episodeId);
    if (!episode) {
      throw new Error("Episode not found");
    }

    // Get the podcast
    const podcast = await ctx.db.get(episode.podcastId);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    // Get audio file from S3
    const audioUrl = getS3Url(episode.s3AudioKey);

    // Initialize Cloudflare AI for transcription
    const ai = new Ai();

    // Transcribe audio using Whisper
    const transcription = await ai.run("@cf/whisper/v3-turbo", {
      audio: audioUrl,
      output_format: "vtt",
    });

    // Save transcript to S3
    const s3TranscriptKey = `episodes/transcripts/${args.episodeId}.vtt`;
    await uploadToS3(Buffer.from(transcription), s3TranscriptKey, "text/vtt");

    // Generate chapters using Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    const chapterPrompt = `
    You are an AI assistant helping to generate podcast chapters.
    Based on the following transcript, identify 3-7 distinct segments or topics and create timestamped chapters.
    For each chapter, provide a short, descriptive title and the timestamp where it begins.
    
    Transcript:
    ${transcription}
    
    Format your response as a JSON array with objects containing:
    - startTime (in seconds)
    - title (string)
    `;

    const chapterResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: chapterPrompt }],
    });

    // Extract chapters from Claude's response
    const chaptersText = chapterResponse.content[0].text;
    const chaptersJson = chaptersText.match(/\[[\s\S]*\]/)?.[0] || "[]";
    const chapters = JSON.parse(chaptersJson);

    // Generate enhanced description using Claude
    const descriptionPrompt = `
    You are an AI assistant helping to generate podcast episode descriptions.
    Based on the following transcript and chapters, create a compelling episode description.
    Include the chapter timestamps in the format (HH:MM:SS) Chapter Title.
    
    Podcast: ${podcast.title}
    Episode: ${episode.title}
    
    Transcript:
    ${transcription}
    
    Chapters:
    ${chapters.map(c => `(${formatTime(c.startTime)}) ${c.title}`).join('\n')}
    
    Create a description that summarizes the episode content and highlights key points.
    The description should be engaging and informative, around 150-250 words.
    `;

    const descriptionResponse = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: descriptionPrompt }],
    });

    const enhancedDescription = descriptionResponse.content[0].text;

    // Update episode with transcription, chapters, and enhanced description
    await ctx.db.patch(args.episodeId, {
      transcript: transcription,
      s3TranscriptKey: s3TranscriptKey,
      chapters: chapters,
      description: enhancedDescription,
    });

    // Regenerate RSS feed
    await ctx.scheduler.runAfter(0, "rss:generateFeed", { podcastId: episode.podcastId });

    return {
      success: true,
      episodeId: args.episodeId,
    };
  },
});

// Helper function to format seconds as HH:MM:SS
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}

// Update an existing episode
export const updateEpisode = mutation({
  args: {
    id: v.id("episodes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    guid: v.optional(v.string()),
    pubDate: v.optional(v.string()),
    duration: v.optional(v.number()),
    explicit: v.optional(v.boolean()),
    keywords: v.optional(v.array(v.string())),
    chapters: v.optional(v.array(v.object({
      startTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
    }))),
    imageFile: v.optional(v.string()), // Base64 encoded image
  },
  handler: async (ctx, args) => {
    const { id, imageFile, ...updateData } = args;
    
    // Get existing episode
    const episode = await ctx.db.get(id);
    if (!episode) {
      throw new Error("Episode not found");
    }

    // Upload new image to S3 if provided
    if (imageFile) {
      const imageBuffer = Buffer.from(imageFile.split(",")[1], "base64");
      const s3ImageKey = `episodes/images/${Date.now()}.jpg`;
      await uploadToS3(imageBuffer, s3ImageKey, "image/jpeg");

      // Add the new S3 image key and URL to the update data
      Object.assign(updateData, { 
        s3ImageKey,
        imageUrl: getS3Url(s3ImageKey)
      });
    }

    // Update episode in database
    await ctx.db.patch(id, updateData);
    
    // Regenerate RSS feed
    await ctx.scheduler.runAfter(0, "rss:generateFeed", { podcastId: episode.podcastId });
    
    return id;
  },
});

// Delete an episode
export const deleteEpisode = mutation({
  args: { id: v.id("episodes") },
  handler: async (ctx, args) => {
    // Get the episode
    const episode = await ctx.db.get(args.id);
    if (!episode) {
      throw new Error("Episode not found");
    }
    
    // Delete the episode
    await ctx.db.delete(args.id);
    
    // Regenerate RSS feed
    await ctx.scheduler.runAfter(0, "rss:generateFeed", { podcastId: episode.podcastId });
    
    return args.id;
  },
});
