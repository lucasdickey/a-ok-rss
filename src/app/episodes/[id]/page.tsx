"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EpisodeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const episodeId = params.id as Id<"episodes">;
  
  const episode = useQuery(api.episodes.getEpisode, { id: episodeId });
  const podcast = episode ? useQuery(api.podcasts.getPodcast, { id: episode.podcastId }) : null;
  
  const updateEpisode = useMutation(api.episodes.updateEpisode);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    guid: "",
    pubDate: "",
    duration: 0,
    explicit: false,
    keywords: [""],
    chapters: [] as { startTime: number; title: string; description?: string }[],
    imageFile: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (episode) {
      // Convert UTC string to local date format for input
      const pubDate = new Date(episode.pubDate);
      const localPubDate = new Date(pubDate.getTime() - pubDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
      
      setFormData({
        title: episode.title,
        description: episode.description,
        link: episode.link,
        guid: episode.guid,
        pubDate: localPubDate,
        duration: episode.duration,
        explicit: episode.explicit,
        keywords: episode.keywords.length > 0 ? episode.keywords : [""],
        chapters: episode.chapters || [],
        imageFile: "",
      });
    }
  }, [episode]);

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

  const handleChapterChange = (index: number, field: string, value: string | number) => {
    const newChapters = [...formData.chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setFormData({ ...formData, chapters: newChapters });
  };

  const addChapter = () => {
    const lastChapter = formData.chapters[formData.chapters.length - 1];
    const newStartTime = lastChapter ? lastChapter.startTime + 300 : 0; // Add 5 minutes from last chapter
    
    setFormData({
      ...formData,
      chapters: [
        ...formData.chapters,
        { startTime: newStartTime, title: "New Chapter" },
      ],
    });
  };

  const removeChapter = (index: number) => {
    const newChapters = [...formData.chapters];
    newChapters.splice(index, 1);
    setFormData({ ...formData, chapters: newChapters });
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
    
    try {
      setIsUpdating(true);
      
      // Format pubDate as RFC 2822 format
      const pubDate = new Date(formData.pubDate).toUTCString();
      
      await updateEpisode({
        id: episodeId,
        title: formData.title,
        description: formData.description,
        link: formData.link,
        guid: formData.guid,
        pubDate,
        explicit: formData.explicit,
        keywords: formData.keywords.filter(k => k.trim() !== ""),
        chapters: formData.chapters,
        imageFile: formData.imageFile || undefined,
      });
      
      setIsEditing(false);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error updating episode:", error);
      setIsUpdating(false);
      alert("Error updating episode. Please try again.");
    }
  };

  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
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

  // Parse HH:MM:SS to seconds
  const parseTimeToSeconds = (timeString: string) => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  if (!episode || !podcast) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading episode details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {episode.title} - {podcast.title}
        </h1>
        <div className="flex gap-4">
          <Link href={`/podcasts/${episode.podcastId}`} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Back to Podcast
          </Link>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Episode
          </button>
        </div>
      </div>

      {isEditing ? (
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
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                />
              </div>
              <div className="mb-4 md:col-span-2">
                <label className="block mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={6}
                  required
                  disabled={isUpdating}
                />
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
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Duration</label>
                <input
                  type="text"
                  value={formatDuration(formData.duration)}
                  className="w-full p-2 border rounded"
                  disabled={true}
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="explicit"
                  checked={formData.explicit}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                  disabled={isUpdating}
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
                    disabled={isUpdating}
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    disabled={formData.keywords.length === 1 || isUpdating}
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addKeyword}
                className="px-3 py-1 bg-green-500 text-white rounded"
                disabled={isUpdating}
              >
                + Add Keyword
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold">Chapters</label>
                <button
                  type="button"
                  onClick={addChapter}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  disabled={isUpdating}
                >
                  + Add Chapter
                </button>
              </div>
              
              {formData.chapters.length > 0 ? (
                <div className="border rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Time</th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.chapters.map((chapter, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <input
                              type="text"
                              value={formatTime(chapter.startTime)}
                              onChange={(e) => {
                                const seconds = parseTimeToSeconds(e.target.value);
                                handleChapterChange(index, "startTime", seconds);
                              }}
                              className="w-full p-1 border rounded"
                              placeholder="HH:MM:SS"
                              disabled={isUpdating}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={chapter.title}
                              onChange={(e) => handleChapterChange(index, "title", e.target.value)}
                              className="w-full p-1 border rounded"
                              disabled={isUpdating}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={chapter.description || ""}
                              onChange={(e) => handleChapterChange(index, "description", e.target.value)}
                              className="w-full p-1 border rounded"
                              placeholder="Optional"
                              disabled={isUpdating}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeChapter(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                              disabled={isUpdating}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No chapters defined yet.</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-1">Episode Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                disabled={isUpdating}
              />
              {episode.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Current image:</p>
                  <img
                    src={episode.imageUrl}
                    alt={episode.title}
                    className="h-20 mt-1 rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Episode"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="border rounded-lg overflow-hidden shadow-md">
              <div className="h-60 bg-gray-200 flex items-center justify-center">
                {episode.imageUrl ? (
                  <img
                    src={episode.imageUrl}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                ) : podcast.imageUrl ? (
                  <img
                    src={podcast.imageUrl}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{episode.title}</h2>
                <div className="mb-2">
                  <span className="font-semibold">Published:</span>{" "}
                  {new Date(episode.pubDate).toLocaleDateString()}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Duration:</span>{" "}
                  {formatDuration(episode.duration)}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Explicit:</span>{" "}
                  {episode.explicit ? "Yes" : "No"}
                </div>
                {episode.keywords.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold">Keywords:</span>{" "}
                    {episode.keywords.join(", ")}
                  </div>
                )}
                <div className="mt-4">
                  <audio
                    src={episode.audioFileUrl}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="border rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Episode Description</h2>
              <div className="prose max-w-none">
                {episode.description.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {episode.chapters && episode.chapters.length > 0 && (
              <div className="border rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-bold mb-4">Chapters</h2>
                <div className="space-y-4">
                  {episode.chapters.map((chapter, index) => (
                    <div key={index} className="flex">
                      <div className="w-24 font-mono text-gray-500">
                        {formatTime(chapter.startTime)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{chapter.title}</h3>
                        {chapter.description && (
                          <p className="text-gray-600">{chapter.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {episode.transcript && (
              <div className="border rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4">Transcript</h2>
                <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {episode.transcript}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
