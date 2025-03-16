"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AudioPlayer from "./AudioPlayer";

interface EpisodeListProps {
  podcastId: Id<"podcasts">;
  showHeader?: boolean;
}

export default function EpisodeList({ podcastId, showHeader = true }: EpisodeListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filterType, setFilterType] = useState<"all" | "published" | "draft">("all");
  
  // Fetch episodes for this podcast
  const episodes = useQuery(api.episodes.getEpisodesByPodcast, { podcastId }) || [];
  
  // Filter and sort episodes
  const filteredEpisodes = episodes.filter(episode => {
    if (filterType === "all") return true;
    if (filterType === "published") return episode.published;
    if (filterType === "draft") return !episode.published;
    return true;
  });
  
  const sortedEpisodes = [...filteredEpisodes].sort((a, b) => {
    const dateA = new Date(a.publishDate).getTime();
    const dateB = new Date(b.publishDate).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Format duration for display
  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {showHeader && (
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Episodes
            </h3>
            <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:space-x-3">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <label htmlFor="filter-type" className="text-sm font-medium text-gray-700">
                  Show:
                </label>
                <select
                  id="filter-type"
                  name="filter-type"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "published" | "draft")}
                >
                  <option value="all">All Episodes</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort-order" className="text-sm font-medium text-gray-700">
                  Sort:
                </label>
                <select
                  id="sort-order"
                  name="sort-order"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {sortedEpisodes.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-500">No episodes found.</p>
          <Link
            href={`/podcasts/${podcastId}/episodes/new`}
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500"
          >
            Create your first episode
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedEpisodes.map((episode) => (
            <li key={episode._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {episode.imageUrl ? (
                      <div className="flex-shrink-0 h-16 w-16 rounded overflow-hidden mr-4">
                        <img
                          src={episode.imageUrl}
                          alt={episode.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded mr-4 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-blue-600 truncate">
                          {episode.title}
                        </h4>
                        {!episode.published && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>{formatDate(episode.publishDate)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDuration(episode.duration || 0)}</span>
                        {episode.season && episode.episodeNumber && (
                          <>
                            <span className="mx-1">•</span>
                            <span>S{episode.season}:E{episode.episodeNumber}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => setSelectedEpisode(selectedEpisode === episode._id ? null : episode._id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {selectedEpisode === episode._id ? "Hide Player" : "Play"}
                    </button>
                    <Link
                      href={`/episodes/${episode._id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
                
                {selectedEpisode === episode._id && episode.audioUrl && (
                  <div className="mt-4">
                    <AudioPlayer
                      audioUrl={episode.audioUrl}
                      title={episode.title}
                      artworkUrl={episode.imageUrl}
                      chapters={episode.chapters || []}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
