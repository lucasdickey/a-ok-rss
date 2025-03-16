"use client";

import { useState } from "react";

interface Chapter {
  startTime: number;
  title: string;
  description?: string;
}

interface TranscriptViewerProps {
  transcript: string;
  chapters: Chapter[];
  onChapterUpdate?: (updatedChapters: Chapter[]) => void;
  isEditable?: boolean;
}

export default function TranscriptViewer({
  transcript,
  chapters,
  onChapterUpdate,
  isEditable = false,
}: TranscriptViewerProps) {
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);
  const [editedChapter, setEditedChapter] = useState<Chapter | null>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "chapters">("transcript");

  // Parse VTT format transcript for display
  const parseVtt = (vtt: string) => {
    // Simple VTT parser - in a real app, use a proper VTT parser library
    const lines = vtt.split("\n");
    const cues: { startTime: string; endTime: string; text: string }[] = [];
    
    let currentCue: { startTime: string; endTime: string; text: string } | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === "WEBVTT" || line === "" || line.startsWith("NOTE")) {
        continue;
      }
      
      // Check if this line contains timestamps (00:00:00.000 --> 00:00:00.000)
      if (line.includes("-->")) {
        const [startTime, endTime] = line.split("-->").map(t => t.trim());
        currentCue = { startTime, endTime, text: "" };
      } else if (currentCue) {
        // This is text content for the current cue
        currentCue.text += (currentCue.text ? "\n" : "") + line;
        
        // If the next line is blank or contains timestamps, add the current cue to our list
        if (i + 1 >= lines.length || lines[i + 1].trim() === "" || lines[i + 1].includes("-->")) {
          cues.push(currentCue);
          currentCue = null;
        }
      }
    }
    
    return cues;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const handleChapterEdit = (index: number) => {
    setEditingChapterIndex(index);
    setEditedChapter({ ...chapters[index] });
  };

  const handleChapterSave = () => {
    if (editingChapterIndex !== null && editedChapter && onChapterUpdate) {
      const updatedChapters = [...chapters];
      updatedChapters[editingChapterIndex] = editedChapter;
      onChapterUpdate(updatedChapters);
      setEditingChapterIndex(null);
      setEditedChapter(null);
    }
  };

  const handleChapterCancel = () => {
    setEditingChapterIndex(null);
    setEditedChapter(null);
  };

  const parsedTranscript = transcript ? parseVtt(transcript) : [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("transcript")}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === "transcript"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Transcript
          </button>
          <button
            onClick={() => setActiveTab("chapters")}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === "chapters"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Chapters ({chapters.length})
          </button>
        </nav>
      </div>

      <div className="p-4">
        {activeTab === "transcript" ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Transcript</h3>
            {transcript ? (
              <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                {parsedTranscript.map((cue, index) => (
                  <div key={index} className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">{cue.startTime}</div>
                    <p className="text-gray-700">{cue.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No transcript available</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Chapters</h3>
              {isEditable && (
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Chapter
                </button>
              )}
            </div>
            
            {chapters.length > 0 ? (
              <div className="space-y-4">
                {chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className={`border rounded-md p-4 ${
                      editingChapterIndex === index ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    {editingChapterIndex === index && editedChapter ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Start Time
                          </label>
                          <input
                            type="text"
                            value={formatTime(editedChapter.startTime)}
                            onChange={(e) => {
                              // Parse time string to seconds
                              const [h, m, s] = e.target.value.split(":").map(Number);
                              const seconds = h * 3600 + m * 60 + s;
                              setEditedChapter({ ...editedChapter, startTime: seconds });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editedChapter.title}
                            onChange={(e) => setEditedChapter({ ...editedChapter, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Description (optional)
                          </label>
                          <textarea
                            value={editedChapter.description || ""}
                            onChange={(e) => setEditedChapter({ ...editedChapter, description: e.target.value })}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={handleChapterCancel}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleChapterSave}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            {formatTime(chapter.startTime)}
                          </span>
                          {isEditable && (
                            <button
                              type="button"
                              onClick={() => handleChapterEdit(index)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <h4 className="text-lg font-medium mt-2">{chapter.title}</h4>
                        {chapter.description && (
                          <p className="mt-1 text-gray-600">{chapter.description}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No chapters available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
