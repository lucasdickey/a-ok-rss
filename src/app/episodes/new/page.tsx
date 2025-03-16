"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function NewEpisodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const podcastId = searchParams.get("podcastId") as Id<"podcasts"> | null;
  
  const podcast = podcastId ? useQuery(api.podcasts.getPodcast, { id: podcastId }) : null;
  const createEpisode = useMutation(api.episodes.createEpisode);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    guid: "",
    pubDate: new Date().toISOString().split("T")[0],
    duration: 0,
    explicit: false,
    keywords: [""],
    audioFile: "",
    imageFile: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioFileName, setAudioFileName] = useState("");

  useEffect(() => {
    if (podcast) {
      setFormData(prev => ({
        ...prev,
        link: `${podcast.link}/episodes/${Date.now()}`,
        guid: `${podcast.link}-${Date.now()}`,
      }));
    }
  }, [podcast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData({ ...formData, keywords: newKeywords });
  };

  const addKeyword = () => {
    setFormData({ ...formData, keywords: [...formData.keywords, ""] });
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...formData.keywords];
    newKeywords.splice(index, 1);
    setFormData({ ...formData, keywords: newKeywords });
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFileName(file.name);
      
      // Create an audio element to get duration
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
        setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
      };
      
      audio.src = URL.createObjectURL(file);
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, audioFile: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageFile: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastId) {
      alert("Podcast ID is required");
      return;
    }
    
    if (!formData.audioFile) {
      alert("Audio file is required");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Format pubDate as RFC 2822 format
      const pubDate = new Date(formData.pubDate).toUTCString();
      
      await createEpisode({
        podcastId,
        title: formData.title,
        description: formData.description,
        link: formData.link,
        guid: formData.guid,
        pubDate,
        duration: formData.duration,
        explicit: formData.explicit,
        keywords: formData.keywords.filter(k => k.trim() !== ""),
        audioFile: formData.audioFile,
        imageFile: formData.imageFile || undefined,
      });
      
      router.push(`/podcasts/${podcastId}`);
    } catch (error) {
      console.error("Error creating episode:", error);
      setIsUploading(false);
      alert("Error creating episode. Please try again.");
    }
  };

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  if (!podcast && podcastId) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading podcast details...</p>
        </div>
      </div>
    );
  }

  if (!podcastId) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No podcast selected. Please select a podcast first.</p>
          <Link href="/podcasts" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Podcasts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Episode to {podcast?.title}</h1>
        <Link href={`/podcasts/${podcastId}`} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back to Podcast
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={isUploading}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Link</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={isUploading}
              />
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="block mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={4}
                required
                disabled={isUploading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Note: AI will enhance this description with chapter information after upload.
              </p>
            </div>
            <div className="mb-4">
              <label className="block mb-1">GUID</label>
              <input
                type="text"
                name="guid"
                value={formData.guid}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={isUploading}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Publication Date *</label>
              <input
                type="date"
                name="pubDate"
                value={formData.pubDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={isUploading}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Duration</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={true}
              />
              {audioDuration > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Detected duration: {formatDuration(audioDuration)}
                </p>
              )}
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="explicit"
                checked={formData.explicit}
                onChange={handleCheckboxChange}
                className="mr-2"
                disabled={isUploading}
              />
              <label>Explicit Content</label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Keywords</label>
            {formData.keywords.map((keyword, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="w-full p-2 border rounded mr-2"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                  disabled={formData.keywords.length === 1 || isUploading}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addKeyword}
              className="px-3 py-1 bg-green-500 text-white rounded"
              disabled={isUploading}
            >
              + Add Keyword
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Audio File *</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="w-full p-2 border rounded"
              required
              disabled={isUploading}
            />
            {audioFileName && (
              <p className="text-sm text-gray-500 mt-1">Selected: {audioFileName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Episode Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
              disabled={isUploading}
            />
            <p className="text-sm text-gray-500 mt-1">
              If not provided, the podcast's main image will be used.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Link
              href={`/podcasts/${podcastId}`}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Create Episode"}
            </button>
          </div>

          {isUploading && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-blue-700">
                Uploading episode... This may take a few minutes. Please don't close this page.
              </p>
              <p className="text-blue-700 mt-2">
                After upload, AI will automatically:
              </p>
              <ul className="list-disc pl-5 text-blue-700">
                <li>Transcribe your audio using Cloudflare's Whisper V3 Turbo</li>
                <li>Generate chapters based on content</li>
                <li>Enhance your episode description</li>
                <li>Update the RSS feed</li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
