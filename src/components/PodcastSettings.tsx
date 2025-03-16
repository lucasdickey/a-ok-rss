"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PodcastSettingsProps {
  podcastId: Id<"podcasts">;
  podcast: {
    title: string;
    description: string;
    author: string;
    email?: string;
    imageUrl: string;
    category: string;
    language: string;
    explicit: boolean;
    websiteUrl?: string;
    copyright?: string;
    owner?: {
      name: string;
      email: string;
    };
    customDomain?: string;
    autoPublish?: boolean;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      youtube?: string;
    };
  };
}

export default function PodcastSettings({ podcastId, podcast }: PodcastSettingsProps) {
  const router = useRouter();
  const updatePodcast = useMutation(api.podcasts.updatePodcast);
  const deletePodcast = useMutation(api.podcasts.deletePodcast);
  
  const [activeTab, setActiveTab] = useState<"general" | "distribution" | "advanced" | "danger">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    websiteUrl: podcast.websiteUrl || "",
    copyright: podcast.copyright || `© ${new Date().getFullYear()} ${podcast.author}`,
    owner: {
      name: podcast.owner?.name || podcast.author,
      email: podcast.owner?.email || podcast.email || "",
    },
    customDomain: podcast.customDomain || "",
    autoPublish: podcast.autoPublish !== undefined ? podcast.autoPublish : true,
    socialLinks: {
      twitter: podcast.socialLinks?.twitter || "",
      instagram: podcast.socialLinks?.instagram || "",
      facebook: podcast.socialLinks?.facebook || "",
      youtube: podcast.socialLinks?.youtube || "",
    },
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("owner.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        owner: {
          ...formData.owner,
          [field]: value,
        },
      });
    } else if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updatePodcast({
        id: podcastId,
        websiteUrl: formData.websiteUrl,
        copyright: formData.copyright,
        owner: formData.owner,
        customDomain: formData.customDomain,
        autoPublish: formData.autoPublish,
        socialLinks: formData.socialLinks,
      });
      
      // Show success message or notification
      alert("Podcast settings updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating podcast settings:", error);
      alert("Failed to update podcast settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle podcast deletion
  const handleDeletePodcast = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }
    
    try {
      await deletePodcast({ id: podcastId });
      alert("Podcast deleted successfully!");
      router.push("/podcasts");
    } catch (error) {
      console.error("Error deleting podcast:", error);
      alert("Failed to delete podcast. Please try again.");
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("distribution")}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === "distribution"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Distribution
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === "advanced"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setActiveTab("danger")}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === "danger"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Danger Zone
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          {activeTab === "general" && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                General Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="websiteUrl"
                      id="websiteUrl"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://yourwebsite.com"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    The website associated with your podcast
                  </p>
                </div>
                
                <div>
                  <label htmlFor="copyright" className="block text-sm font-medium text-gray-700">
                    Copyright
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="copyright"
                      id="copyright"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={formData.copyright}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Copyright information for your podcast
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="owner.name" className="block text-sm font-medium text-gray-700">
                      Owner Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="owner.name"
                        id="owner.name"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.owner.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="owner.email" className="block text-sm font-medium text-gray-700">
                      Owner Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="owner.email"
                        id="owner.email"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.owner.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Social Links</h4>
                  
                  <div>
                    <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700">
                      Twitter
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="socialLinks.twitter"
                        id="socialLinks.twitter"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://twitter.com/yourusername"
                        value={formData.socialLinks.twitter}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700">
                      Instagram
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="socialLinks.instagram"
                        id="socialLinks.instagram"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://instagram.com/yourusername"
                        value={formData.socialLinks.instagram}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700">
                      Facebook
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="socialLinks.facebook"
                        id="socialLinks.facebook"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://facebook.com/yourpage"
                        value={formData.socialLinks.facebook}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="socialLinks.youtube" className="block text-sm font-medium text-gray-700">
                      YouTube
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="socialLinks.youtube"
                        id="socialLinks.youtube"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://youtube.com/yourchannel"
                        value={formData.socialLinks.youtube}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Distribution Settings */}
          {activeTab === "distribution" && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Distribution Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                    Custom Domain
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="customDomain"
                      id="customDomain"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="podcast.yourdomain.com"
                      value={formData.customDomain}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Use your own domain for your podcast RSS feed
                  </p>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="autoPublish"
                      name="autoPublish"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={formData.autoPublish}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoPublish" className="font-medium text-gray-700">
                      Auto-publish episodes
                    </label>
                    <p className="text-gray-500">
                      Automatically publish episodes to your RSS feed when they are created
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Podcast Directories
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Submit your podcast to these directories to reach more listeners
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Apple Podcasts</h5>
                        <p className="text-xs text-gray-500">The largest podcast directory</p>
                      </div>
                      <a
                        href="https://podcastsconnect.apple.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Submit
                      </a>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Spotify</h5>
                        <p className="text-xs text-gray-500">The fastest growing podcast platform</p>
                      </div>
                      <a
                        href="https://podcasters.spotify.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Submit
                      </a>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Google Podcasts</h5>
                        <p className="text-xs text-gray-500">Google's podcast directory</p>
                      </div>
                      <a
                        href="https://podcastsmanager.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Submit
                      </a>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Amazon Music / Audible</h5>
                        <p className="text-xs text-gray-500">Amazon's podcast platform</p>
                      </div>
                      <a
                        href="https://podcasters.amazon.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Submit
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Advanced Settings */}
          {activeTab === "advanced" && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Advanced Settings
              </h3>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Advanced Settings
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          These settings are for advanced users. Changing these settings may affect your podcast's distribution.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    RSS Feed Options
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="includeEpisodeNumbers"
                          name="includeEpisodeNumbers"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="includeEpisodeNumbers" className="font-medium text-gray-700">
                          Include episode numbers
                        </label>
                        <p className="text-gray-500">
                          Add episode numbers to your RSS feed
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="includeSeasonNumbers"
                          name="includeSeasonNumbers"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="includeSeasonNumbers" className="font-medium text-gray-700">
                          Include season numbers
                        </label>
                        <p className="text-gray-500">
                          Add season numbers to your RSS feed
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="includeChapters"
                          name="includeChapters"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="includeChapters" className="font-medium text-gray-700">
                          Include chapters
                        </label>
                        <p className="text-gray-500">
                          Add chapter markers to your RSS feed
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="includeTranscripts"
                          name="includeTranscripts"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="includeTranscripts" className="font-medium text-gray-700">
                          Include transcripts
                        </label>
                        <p className="text-gray-500">
                          Add transcripts to your RSS feed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Export Options
                  </h4>
                  
                  <div className="space-y-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Export RSS Feed
                    </button>
                    
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Export Podcast Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Danger Zone */}
          {activeTab === "danger" && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-red-700 mb-4">
                Danger Zone
              </h3>
              
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Actions in this section can permanently delete your podcast and all associated data. These actions cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Delete Podcast
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Permanently delete this podcast and all of its episodes, analytics, and other data.
                  </p>
                  
                  {showDeleteConfirmation ? (
                    <div className="bg-red-50 p-4 rounded-md mb-4">
                      <p className="text-sm text-red-700 mb-4">
                        Are you sure you want to delete this podcast? This action cannot be undone.
                      </p>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={handleDeletePodcast}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Yes, Delete Podcast
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmation(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeletePodcast}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Podcast
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Submit Button (only show for general, distribution, and advanced tabs) */}
          {activeTab !== "danger" && (
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
