"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import PodcastAnalytics from "../../../../components/PodcastAnalytics";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function PodcastAnalyticsPage() {
  const params = useParams();
  const podcastId = params.id as Id<"podcasts">;
  
  // Fetch the podcast to display title and other info
  const podcast = useQuery(api.podcasts.getPodcast, { id: podcastId });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {podcast?.title || "Podcast"} Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your podcast performance and audience engagement
        </p>
      </div>
      
      <PodcastAnalytics podcastId={podcastId} />
    </div>
  );
}
