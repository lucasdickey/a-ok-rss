"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function EpisodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPodcast, setFilterPodcast] = useState<string | null>(null);
  
  const podcasts = useQuery(api.podcasts.getPodcasts) || [];
  const episodes = useQuery(api.episodes.getAllEpisodes) || [];

  // Filter episodes based on search term and selected podcast
  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = searchTerm === "" || 
      episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPodcast = filterPodcast === null || episode.podcastId === filterPodcast;
    
    return matchesSearch && matchesPodcast;
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

  // Find podcast title by ID
  const getPodcastTitle = (podcastId: string) => {
    const podcast = podcasts.find(p => p._id === podcastId);
    return podcast ? podcast.title : "Unknown Podcast";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Episodes
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/episodes/new"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Episode
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Episodes
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="podcast-filter" className="block text-sm font-medium text-gray-700">
                Filter by Podcast
              </label>
              <select
                id="podcast-filter"
                name="podcast-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterPodcast || ""}
                onChange={(e) => setFilterPodcast(e.target.value === "" ? null : e.target.value)}
              >
                <option value="">All Podcasts</option>
                {podcasts.map((podcast) => (
                  <option key={podcast._id} value={podcast._id}>
                    {podcast.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {filteredEpisodes.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">No episodes found.</p>
            {searchTerm || filterPodcast ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPodcast(null);
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/episodes/new"
                className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500"
              >
                Create your first episode
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredEpisodes.map((episode) => (
              <li key={episode._id}>
                <Link href={`/episodes/${episode._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {episode.imageUrl ? (
                          <div className="flex-shrink-0 h-12 w-12 rounded overflow-hidden mr-4">
                            <img
                              src={episode.imageUrl}
                              alt={episode.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded mr-4 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {episode.title}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <span className="truncate">{getPodcastTitle(episode.podcastId)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                        <p className="text-sm text-gray-500">
                          {formatDate(episode.publishDate)}
                        </p>
                        {episode.transcript ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Transcribed
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No Transcript
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
