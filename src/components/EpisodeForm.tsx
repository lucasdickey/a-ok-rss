"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface EpisodeFormProps {
  podcastId: string;
  initialData?: {
    id?: string;
    title: string;
    description: string;
    audioUrl?: string;
    imageUrl?: string;
    season?: number;
    episode?: number;
    explicit: boolean;
    publishDate: string;
  };
  onSuccess?: () => void;
  isEditing?: boolean;
}

export default function EpisodeForm({
  podcastId,
  initialData = {
    title: "",
    description: "",
    explicit: false,
    publishDate: new Date().toISOString().split("T")[0],
  },
  onSuccess,
  isEditing = false,
}: EpisodeFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const podcast = useQuery(api.podcasts.getPodcast, { id: podcastId });
  const createEpisode = useMutation(api.episodes.createEpisode);
  const updateEpisode = useMutation(api.episodes.updateEpisode);
  const processAudio = useMutation(api.episodes.processAudio);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real implementation, we would upload the audio and image files to S3 or R2
      // and get back URLs to store in the database
      let audioUrl = formData.audioUrl;
      let imageUrl = formData.imageUrl;
      
      if (audioFile) {
        // This would be replaced with actual file upload logic
        audioUrl = URL.createObjectURL(audioFile);
      }
      
      if (imageFile) {
        // This would be replaced with actual file upload logic
        imageUrl = URL.createObjectURL(imageFile);
      }

      let episodeId;
      
      if (isEditing && formData.id) {
        await updateEpisode({
          id: formData.id,
          ...formData,
          audioUrl,
          imageUrl,
        });
        episodeId = formData.id;
      } else {
        const result = await createEpisode({
          podcastId,
          ...formData,
          audioUrl,
          imageUrl,
        });
        episodeId = result;
      }

      // If we have a new audio file, process it with AI
      if (audioFile && episodeId) {
        setIsProcessing(true);
        
        // Simulate processing progress
        const interval = setInterval(() => {
          setProcessingProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 5;
          });
        }, 1000);
        
        try {
          await processAudio({ 
            episodeId, 
            podcastId,
            // In a real implementation, we would pass the audio file or URL
          });
          
          setProcessingProgress(100);
          clearInterval(interval);
        } catch (err) {
          clearInterval(interval);
          console.error("Error processing audio:", err);
          // Don't fail the whole submission if AI processing fails
        } finally {
          setIsProcessing(false);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {podcast && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-700">
            Adding episode to podcast: <strong>{podcast.title}</strong>
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Episode Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          {isEditing ? "Edit manually or upload a new audio file to regenerate with AI" : "Upload audio to generate an enhanced description with AI"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">
            Season Number
          </label>
          <input
            type="number"
            id="season"
            name="season"
            min="1"
            value={formData.season || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="episode" className="block text-sm font-medium text-gray-700">
            Episode Number
          </label>
          <input
            type="number"
            id="episode"
            name="episode"
            min="1"
            value={formData.episode || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">
          Publish Date *
        </label>
        <input
          type="date"
          id="publishDate"
          name="publishDate"
          required
          value={formData.publishDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="explicit"
          name="explicit"
          checked={formData.explicit}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="explicit" className="ml-2 block text-sm text-gray-700">
          Contains explicit content
        </label>
      </div>

      <div>
        <label htmlFor="audio" className="block text-sm font-medium text-gray-700">
          Audio File {!isEditing && "*"}
        </label>
        <input
          type="file"
          id="audio"
          name="audio"
          accept="audio/*"
          required={!isEditing}
          onChange={handleAudioFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {formData.audioUrl && !audioFile && (
          <p className="mt-1 text-sm text-gray-500">
            Current audio file: {formData.audioUrl.split("/").pop()}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Episode Image (optional)
        </label>
        <div className="mt-1 flex items-center space-x-4">
          {(formData.imageUrl || imageFile) && (
            <div className="w-24 h-24 overflow-hidden rounded-md">
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                alt="Episode image preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          If not provided, the podcast artwork will be used
        </p>
      </div>

      {isProcessing && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Processing audio with AI...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {processingProgress < 100
              ? "Transcribing audio and generating chapters..."
              : "Processing complete!"}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isProcessing}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Episode" : "Create Episode"}
        </button>
      </div>
    </form>
  );
}
