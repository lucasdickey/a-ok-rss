"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PodcastAnalyticsProps {
  podcastId: Id<"podcasts">;
  timeRange?: "7d" | "30d" | "90d" | "all";
}

export default function PodcastAnalytics({
  podcastId,
  timeRange = "30d",
}: PodcastAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d" | "all">(timeRange);
  const [selectedMetric, setSelectedMetric] = useState<"downloads" | "subscribers" | "listens">("downloads");
  
  // Fetch podcast data
  const podcast = useQuery(api.podcasts.getPodcast, { id: podcastId });
  
  // Fetch episodes for this podcast
  const episodes = useQuery(api.episodes.getEpisodesByPodcast, { podcastId }) || [];
  
  // Fetch analytics data
  // In a real implementation, this would come from your analytics backend
  // For now, we'll generate some sample data
  const analyticsData = generateSampleAnalyticsData(selectedTimeRange, episodes);
  
  // Calculate total downloads, subscribers, and listens
  const totalDownloads = analyticsData.reduce((sum, day) => sum + day.downloads, 0);
  const totalSubscribers = analyticsData.length > 0 ? analyticsData[analyticsData.length - 1].subscribers : 0;
  const totalListens = analyticsData.reduce((sum, day) => sum + day.listens, 0);
  
  // Calculate episode performance
  const episodePerformance = episodes.map(episode => ({
    title: episode.title,
    downloads: Math.floor(Math.random() * 5000) + 500,
    listens: Math.floor(Math.random() * 4000) + 300,
    completionRate: Math.floor(Math.random() * 30) + 60,
  })).sort((a, b) => b.downloads - a.downloads);
  
  // Calculate geographic distribution
  const geoDistribution = [
    { country: "United States", value: Math.floor(Math.random() * 60) + 30 },
    { country: "United Kingdom", value: Math.floor(Math.random() * 15) + 5 },
    { country: "Canada", value: Math.floor(Math.random() * 10) + 5 },
    { country: "Australia", value: Math.floor(Math.random() * 8) + 2 },
    { country: "Germany", value: Math.floor(Math.random() * 7) + 2 },
    { country: "Other", value: Math.floor(Math.random() * 10) + 5 },
  ];
  
  // Calculate listening platforms
  const platforms = [
    { name: "Apple Podcasts", value: Math.floor(Math.random() * 40) + 20 },
    { name: "Spotify", value: Math.floor(Math.random() * 35) + 20 },
    { name: "Google Podcasts", value: Math.floor(Math.random() * 15) + 5 },
    { name: "Overcast", value: Math.floor(Math.random() * 10) + 2 },
    { name: "Pocket Casts", value: Math.floor(Math.random() * 8) + 2 },
    { name: "Other", value: Math.floor(Math.random() * 10) + 5 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {podcast?.title || "Podcast"} Analytics
        </h2>
        <p className="text-gray-500">
          Track your podcast performance and audience engagement
        </p>
      </div>
      
      {/* Time range selector */}
      <div className="flex mb-6 space-x-2">
        <button
          onClick={() => setSelectedTimeRange("7d")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedTimeRange === "7d"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => setSelectedTimeRange("30d")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedTimeRange === "30d"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Last 30 days
        </button>
        <button
          onClick={() => setSelectedTimeRange("90d")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedTimeRange === "90d"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Last 90 days
        </button>
        <button
          onClick={() => setSelectedTimeRange("all")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedTimeRange === "all"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All time
        </button>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Downloads</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{totalDownloads.toLocaleString()}</div>
          <div className="mt-1 text-sm text-green-600">+{Math.floor(Math.random() * 10) + 5}% from previous period</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Subscribers</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{totalSubscribers.toLocaleString()}</div>
          <div className="mt-1 text-sm text-green-600">+{Math.floor(Math.random() * 8) + 2}% from previous period</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Listens</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{totalListens.toLocaleString()}</div>
          <div className="mt-1 text-sm text-green-600">+{Math.floor(Math.random() * 12) + 3}% from previous period</div>
        </div>
      </div>
      
      {/* Metric selector */}
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setSelectedMetric("downloads")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedMetric === "downloads"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Downloads
        </button>
        <button
          onClick={() => setSelectedMetric("subscribers")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedMetric === "subscribers"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setSelectedMetric("listens")}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            selectedMetric === "listens"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Listens
        </button>
      </div>
      
      {/* Main chart */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {selectedMetric === "downloads" && "Downloads Over Time"}
          {selectedMetric === "subscribers" && "Subscribers Over Time"}
          {selectedMetric === "listens" && "Listens Over Time"}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Episode performance */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Episode Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Episode
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listens
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {episodePerformance.map((episode, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {episode.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {episode.downloads.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {episode.listens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {episode.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Geographic distribution and platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Geographic Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={geoDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Percentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Listening Platforms
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platforms}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Percentage" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate sample analytics data
function generateSampleAnalyticsData(timeRange: "7d" | "30d" | "90d" | "all", episodes: any[]) {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 180;
  const data = [];
  
  let subscribers = Math.floor(Math.random() * 500) + 100;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    const downloads = Math.floor(Math.random() * 100) + 10;
    const listens = Math.floor(Math.random() * 80) + 5;
    
    // Subscribers generally increase over time
    subscribers += Math.floor(Math.random() * 5);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      downloads,
      subscribers,
      listens,
    });
  }
  
  return data;
}
