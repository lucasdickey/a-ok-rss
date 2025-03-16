"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import PodcastSettings from "../../../../components/PodcastSettings";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function PodcastSettingsPage() {
  const params = useParams();
  const podcastId = params.id as Id<"podcasts">;
  
  // Fetch the podcast to display title and other info
  const podcast = useQuery(api.podcasts.getPodcast, { id: podcastId });

  if (!podcast) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Loading podcast settings...</h2>
          <p className="mt-1 text-sm text-gray-500">Please wait while we load your podcast data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {podcast.title} Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your podcast settings and distribution options
        </p>
      </div>
      
      <PodcastSettings podcastId={podcastId} podcast={podcast} />
    </div>
  );
}
