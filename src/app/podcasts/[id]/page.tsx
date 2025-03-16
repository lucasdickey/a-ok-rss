"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function PodcastDetailPage({ params }: { params: { id: string } }) {
  const podcastId = params.id as Id<"podcasts">;
  const podcast = useQuery(api.podcasts.getPodcast, { id: podcastId });
  const episodes = useQuery(api.episodes.getEpisodes, { podcastId }) || [];
  const latestFeed = useQuery(api.rss.getLatestFeed, { podcastId });
  const feedVersions = useQuery(api.rss.getFeedVersions, { podcastId }) || [];
  
  const updatePodcast = useMutation(api.podcasts.updatePodcast);
  const deleteEpisode = useMutation(api.episodes.deleteEpisode);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    language: "",
    copyright: "",
    author: "",
    ownerName: "",
    ownerEmail: "",
    imageUrl: "",
    explicit: false,
    categories: [""],
    imageFile: "",
  });

  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.title,
        description: podcast.description,
        link: podcast.link,
        language: podcast.language,
        copyright: podcast.copyright,
        author: podcast.author,
        ownerName: podcast.ownerName,
        ownerEmail: podcast.ownerEmail,
        imageUrl: podcast.imageUrl,
        explicit: podcast.explicit,
        categories: podcast.categories.length > 0 ? podcast.categories : [""],
        imageFile: "",
      });
    }
  }, [podcast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...formData.categories];
    newCategories[index] = value;
    setFormData({ ...formData, categories: newCategories });
  };

  const addCategory = () => {
    setFormData({ ...formData, categories: [...formData.categories, ""] });
  };

  const removeCategory = (index: number) => {
    const newCategories = [...formData.categories];
    newCategories.splice(index, 1);
    setFormData({ ...formData, categories: newCategories });
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
      await updatePodcast({
        id: podcastId,
        ...formData,
        categories: formData.categories.filter(c => c.trim() !== ""),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating podcast:", error);
    }
  };

  const handleDeleteEpisode = async (id: Id<"episodes">) => {
    if (confirm("Are you sure you want to delete this episode?")) {
      try {
        await deleteEpisode({ id });
      } catch (error) {
        console.error("Error deleting episode:", error);
      }
    }
  };

  if (!podcast) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading podcast details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{podcast.title}</h1>
        <div className="flex gap-4">
          <Link href="/podcasts" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Back to Podcasts
          </Link>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Podcast
          </button>
          <Link
            href={`/episodes/new?podcastId=${podcastId}`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Episode
          </Link>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Podcast</h2>
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
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Link *</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4 md:col-span-2">
                  <label className="block mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="en-us"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Copyright</label>
                  <input
                    type="text"
                    name="copyright"
                    value={formData.copyright}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Owner Email *</label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Upload New Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="explicit"
                    checked={formData.explicit}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label>Explicit Content</label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-1">Categories</label>
                {formData.categories.map((category, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                      className="w-full p-2 border rounded mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      disabled={formData.categories.length === 1}
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  + Add Category
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Podcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="border rounded-lg overflow-hidden shadow-md">
            <div className="h-60 bg-gray-200 flex items-center justify-center">
              {podcast.imageUrl && (
                <img
                  src={podcast.imageUrl}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{podcast.title}</h2>
              <p className="text-gray-600 mb-4">{podcast.description}</p>
              <div className="mb-2">
                <span className="font-semibold">Author:</span> {podcast.author}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Language:</span> {podcast.language}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Explicit:</span> {podcast.explicit ? "Yes" : "No"}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Categories:</span>{" "}
                {podcast.categories.join(", ")}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="border rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">RSS Feed</h2>
            {latestFeed ? (
              <div>
                <div className="mb-4">
                  <span className="font-semibold">Latest Version:</span> {latestFeed.version}
                </div>
                <div className="mb-4">
                  <span className="font-semibold">Published:</span>{" "}
                  {new Date(latestFeed.publishedAt).toLocaleString()}
                </div>
                <div className="mb-4">
                  <a
                    href={latestFeed.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View RSS Feed
                  </a>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Previous Versions</h3>
                  <ul className="list-disc pl-5">
                    {feedVersions
                      .filter(feed => !feed.isLatest)
                      .map(feed => (
                        <li key={feed._id} className="mb-1">
                          <a
                            href={feed.feedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Version {feed.version} - {new Date(feed.publishedAt).toLocaleString()}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No RSS feed generated yet. Add episodes to generate a feed.</p>
            )}
          </div>

          <div className="border rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Episodes</h2>
            {episodes.length > 0 ? (
              <div className="space-y-4">
                {episodes.map(episode => (
                  <div key={episode._id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{episode.title}</h3>
                      <div className="flex gap-2">
                        <Link
                          href={`/episodes/${episode._id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteEpisode(episode._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      Published: {new Date(episode.pubDate).toLocaleString()}
                    </p>
                    <p className="text-gray-600 line-clamp-2">{episode.description}</p>
                    <div className="mt-2">
                      <a
                        href={episode.audioFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Listen to Episode
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No episodes yet. Add your first episode to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
