"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface RssFeedInfoProps {
  podcastId: string;
}

export default function RssFeedInfo({ podcastId }: RssFeedInfoProps) {
  const [copied, setCopied] = useState(false);
  const podcast = useQuery(api.podcasts.getPodcast, { id: podcastId });
  const rssFeedUrl = podcast?.rssFeedUrl || "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rssFeedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!podcast) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">RSS Feed Information</h3>
      
      <div className="mb-6">
        <label htmlFor="rss-url" className="block text-sm font-medium text-gray-700 mb-1">
          RSS Feed URL
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="rss-url"
            value={rssFeedUrl}
            readOnly
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Submit this URL to podcast directories like Apple Podcasts, Spotify, and Google Podcasts.
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Podcast Directories</h4>
        <div className="grid grid-cols-2 gap-4">
          <a
            href={`https://podcastsconnect.apple.com/my-podcasts/new-feed?url=${encodeURIComponent(rssFeedUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit to Apple Podcasts
          </a>
          <a
            href="https://podcasters.spotify.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit to Spotify
          </a>
          <a
            href="https://podcastsmanager.google.com/add-feed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit to Google Podcasts
          </a>
          <a
            href={`https://podcasts.amazon.com/submit?feedUrl=${encodeURIComponent(rssFeedUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit to Amazon Music
          </a>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Validate Feed</h4>
        <a
          href={`https://castfeedvalidator.com/?url=${encodeURIComponent(rssFeedUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Validate RSS Feed
        </a>
        <p className="mt-2 text-sm text-gray-500">
          Check your RSS feed for errors before submitting to podcast directories.
        </p>
      </div>
    </div>
  );
}
