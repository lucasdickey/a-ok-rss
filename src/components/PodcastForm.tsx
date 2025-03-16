"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PodcastFormProps {
  initialData?: {
    id?: string;
    title: string;
    author: string;
    description: string;
    category: string;
    language: string;
    explicit: boolean;
    artworkUrl?: string;
  };
  onSuccess?: () => void;
  isEditing?: boolean;
}

export default function PodcastForm({
  initialData = {
    title: "",
    author: "",
    description: "",
    category: "Technology",
    language: "en-us",
    explicit: false,
  },
  onSuccess,
  isEditing = false,
}: PodcastFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPodcast = useMutation(api.podcasts.createPodcast);
  const updatePodcast = useMutation(api.podcasts.updatePodcast);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArtworkFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real implementation, we would upload the artwork file to S3 or R2
      // and get back a URL to store in the database
      let artworkUrl = formData.artworkUrl;
      
      if (artworkFile) {
        // This would be replaced with actual file upload logic
        artworkUrl = URL.createObjectURL(artworkFile);
      }

      if (isEditing && formData.id) {
        await updatePodcast({
          id: formData.id,
          ...formData,
          artworkUrl,
        });
      } else {
        await createPodcast({
          ...formData,
          artworkUrl,
        });
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

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Podcast Title *
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
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          Author *
        </label>
        <input
          type="text"
          id="author"
          name="author"
          required
          value={formData.author}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Arts">Arts</option>
            <option value="Business">Business</option>
            <option value="Comedy">Comedy</option>
            <option value="Education">Education</option>
            <option value="Fiction">Fiction</option>
            <option value="Government">Government</option>
            <option value="Health & Fitness">Health & Fitness</option>
            <option value="History">History</option>
            <option value="Kids & Family">Kids & Family</option>
            <option value="Leisure">Leisure</option>
            <option value="Music">Music</option>
            <option value="News">News</option>
            <option value="Religion & Spirituality">Religion & Spirituality</option>
            <option value="Science">Science</option>
            <option value="Society & Culture">Society & Culture</option>
            <option value="Sports">Sports</option>
            <option value="Technology">Technology</option>
            <option value="True Crime">True Crime</option>
            <option value="TV & Film">TV & Film</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="en-us">English (US)</option>
            <option value="en-gb">English (UK)</option>
            <option value="es-es">Spanish</option>
            <option value="fr-fr">French</option>
            <option value="de-de">German</option>
            <option value="it-it">Italian</option>
            <option value="ja-jp">Japanese</option>
            <option value="ko-kr">Korean</option>
            <option value="zh-cn">Chinese (Simplified)</option>
            <option value="pt-br">Portuguese (Brazil)</option>
          </select>
        </div>
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
        <label htmlFor="artwork" className="block text-sm font-medium text-gray-700">
          Podcast Artwork
        </label>
        <div className="mt-1 flex items-center space-x-4">
          {(formData.artworkUrl || artworkFile) && (
            <div className="w-24 h-24 overflow-hidden rounded-md">
              <img
                src={artworkFile ? URL.createObjectURL(artworkFile) : formData.artworkUrl}
                alt="Podcast artwork preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <input
            type="file"
            id="artwork"
            name="artwork"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Recommended size: 3000x3000 pixels (minimum 1400x1400)
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Podcast" : "Create Podcast"}
        </button>
      </div>
    </form>
  );
}
