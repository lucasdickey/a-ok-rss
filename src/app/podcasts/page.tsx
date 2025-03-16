"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function PodcastsPage() {
  const podcasts = useQuery(api.podcasts.getPodcasts) || [];
  const createPodcast = useMutation(api.podcasts.createPodcast);
  const deletePodcast = useMutation(api.podcasts.deletePodcast);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    language: "en-us",
    copyright: "",
    author: "",
    ownerName: "",
    ownerEmail: "",
    imageUrl: "",
    explicit: false,
    categories: [""],
    imageFile: "",
  });

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
      await createPodcast({
        ...formData,
        categories: formData.categories.filter(c => c.trim() !== ""),
      });
      setIsCreating(false);
      setFormData({
        title: "",
        description: "",
        link: "",
        language: "en-us",
        copyright: "",
        author: "",
        ownerName: "",
        ownerEmail: "",
        imageUrl: "",
        explicit: false,
        categories: [""],
        imageFile: "",
      });
    } catch (error) {
      console.error("Error creating podcast:", error);
    }
  };

  const handleDelete = async (id: Id<"podcasts">) => {
    if (confirm("Are you sure you want to delete this podcast? This will also delete all episodes and RSS feeds.")) {
      try {
        await deletePodcast({ id });
      } catch (error) {
        console.error("Error deleting podcast:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Podcasts</h1>
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Back to Home
          </Link>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Podcast
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Podcast</h2>
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
                  <label className="block mb-1">Upload Image</label>
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
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Podcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <div key={podcast._id} className="border rounded-lg overflow-hidden shadow-md">
            <div className="h-40 bg-gray-200 flex items-center justify-center">
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
              <p className="text-gray-600 mb-4 line-clamp-3">{podcast.description}</p>
              <div className="flex justify-between">
                <Link
                  href={`/podcasts/${podcast._id}`}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Manage
                </Link>
                <button
                  onClick={() => handleDelete(podcast._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {podcasts.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No podcasts found. Create your first podcast to get started.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Podcast
          </button>
        </div>
      )}
    </div>
  );
}
