// Use Node.js runtime for RSS feed generation
"use node";

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { uploadToS3, getS3Url } from "./utils/s3";
import xml2js from "xml2js";

// Generate RSS feed for a podcast
export const generateFeed = action({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    // Get the podcast
    const podcast = await ctx.db.get(args.podcastId);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    // Get all episodes for this podcast
    const episodes = await ctx.db
      .query("episodes")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .order("desc")
      .collect();

    // Create RSS feed XML
    const rss = {
      rss: {
        $: {
          version: "2.0",
          "xmlns:dc": "http://purl.org/dc/elements/1.1/",
          "xmlns:content": "http://purl.org/rss/1.0/modules/content/",
          "xmlns:atom": "http://www.w3.org/2005/Atom",
          "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
          "xmlns:googleplay": "http://www.google.com/schemas/play-podcasts/1.0",
          "xmlns:media": "http://search.yahoo.com/mrss/",
          "xmlns:podcast": "https://podcastindex.org/namespace/1.0"
        },
        channel: {
          title: podcast.title,
          link: podcast.link,
          description: podcast.description,
          language: podcast.language,
          copyright: podcast.copyright,
          "itunes:author": podcast.author,
          "itunes:owner": {
            "itunes:name": podcast.ownerName,
            "itunes:email": podcast.ownerEmail
          },
          "itunes:image": {
            $: {
              href: podcast.imageUrl
            }
          },
          "itunes:explicit": podcast.explicit ? "yes" : "no",
          "itunes:category": podcast.categories.map(category => ({
            $: {
              text: category
            }
          })),
          item: episodes.map(episode => {
            // Format chapters for description
            const chaptersText = episode.chapters
              .map(chapter => `(${formatTime(chapter.startTime)}) ${chapter.title}`)
              .join('\n');

            // Create episode item
            return {
              title: episode.title,
              description: {
                _: `<![CDATA[${episode.description}\n\n${chaptersText}]]>`
              },
              link: episode.link,
              guid: {
                _: episode.guid,
                $: {
                  isPermaLink: "false"
                }
              },
              pubDate: episode.pubDate,
              enclosure: {
                $: {
                  url: episode.audioFileUrl,
                  length: "0", // This would ideally be the file size
                  type: "audio/mpeg"
                }
              },
              "itunes:duration": formatDuration(episode.duration),
              "itunes:explicit": episode.explicit ? "yes" : "no",
              "itunes:image": episode.imageUrl ? {
                $: {
                  href: episode.imageUrl
                }
              } : undefined,
              "itunes:keywords": episode.keywords.join(","),
              "podcast:chapters": {
                $: {
                  url: `${episode.link}/chapters.json`,
                  type: "application/json"
                }
              }
            };
          })
        }
      }
    };

    // Convert to XML
    const builder = new xml2js.Builder({
      cdata: true,
      xmldec: { version: "1.0", encoding: "UTF-8" }
    });
    const xml = builder.buildObject(rss);

    // Upload XML to S3
    const timestamp = new Date().toISOString();
    const s3XmlKey = `rss/${args.podcastId}/${timestamp}.xml`;
    await uploadToS3(Buffer.from(xml), s3XmlKey, "application/xml");

    // Get current version number
    const latestFeed = await ctx.db
      .query("rssFeeds")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .filter((q) => q.eq(q.field("isLatest"), true))
      .first();

    const version = latestFeed ? latestFeed.version + 1 : 1;

    // Mark all existing feeds as not latest
    if (latestFeed) {
      await ctx.db.patch(latestFeed._id, { isLatest: false });
    }

    // Create new RSS feed record
    const feedId = await ctx.db.insert("rssFeeds", {
      podcastId: args.podcastId,
      version: version,
      publishedAt: timestamp,
      s3XmlKey: s3XmlKey,
      isLatest: true,
    });

    // Generate chapters JSON for each episode
    for (const episode of episodes) {
      if (episode.chapters && episode.chapters.length > 0) {
        const chaptersJson = {
          version: "1.2.0",
          chapters: episode.chapters.map(chapter => ({
            startTime: chapter.startTime,
            title: chapter.title,
            ...(chapter.description ? { description: chapter.description } : {})
          }))
        };

        const chaptersJsonString = JSON.stringify(chaptersJson, null, 2);
        const s3ChaptersKey = `episodes/chapters/${episode._id}.json`;
        await uploadToS3(Buffer.from(chaptersJsonString), s3ChaptersKey, "application/json");
      }
    }

    return {
      success: true,
      feedId: feedId,
      feedUrl: getS3Url(s3XmlKey),
    };
  },
});

// Get the latest RSS feed for a podcast
export const getLatestFeed = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    const latestFeed = await ctx.db
      .query("rssFeeds")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .filter((q) => q.eq(q.field("isLatest"), true))
      .first();

    if (!latestFeed) {
      return null;
    }

    return {
      ...latestFeed,
      feedUrl: getS3Url(latestFeed.s3XmlKey),
    };
  },
});

// Get all RSS feed versions for a podcast
export const getFeedVersions = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    const feeds = await ctx.db
      .query("rssFeeds")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .order("desc")
      .collect();

    return feeds.map(feed => ({
      ...feed,
      feedUrl: getS3Url(feed.s3XmlKey),
    }));
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

// Helper function to format duration in HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
