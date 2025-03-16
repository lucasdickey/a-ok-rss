"use client";

import { useState, useRef, useEffect } from "react";

interface Chapter {
  startTime: number;
  title: string;
  description?: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  artworkUrl?: string;
  chapters?: Chapter[];
}

export default function AudioPlayer({
  audioUrl,
  title,
  artworkUrl,
  chapters = [],
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // Update current time and check for chapter changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      
      // Find current chapter
      if (chapters.length > 0) {
        const currentChapterIndex = chapters.findIndex((chapter, index) => {
          const nextChapterStartTime = index < chapters.length - 1 
            ? chapters[index + 1].startTime 
            : Infinity;
          return chapter.startTime <= audio.currentTime && audio.currentTime < nextChapterStartTime;
        });
        
        if (currentChapterIndex !== -1) {
          setCurrentChapter(chapters[currentChapterIndex]);
        } else {
          setCurrentChapter(null);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [chapters]);

  // Handle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  // Jump to a specific chapter
  const jumpToChapter = (chapter: Chapter) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = chapter.startTime;
    setCurrentTime(chapter.startTime);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex p-4">
        {/* Artwork */}
        <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden mr-4">
          <img
            src={artworkUrl || "https://via.placeholder.com/150?text=No+Artwork"}
            alt={`${title} artwork`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Player controls */}
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          
          {currentChapter && (
            <div className="mb-2">
              <span className="text-sm text-gray-500">
                Current chapter: {currentChapter.title}
              </span>
            </div>
          )}
          
          <div className="flex items-center mb-2">
            <button
              onClick={togglePlayPause}
              className="mr-4 focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <div className="flex-1 flex items-center">
              <span className="text-xs text-gray-500 w-10">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 mx-2 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
              />
              <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
            </div>
            
            <div className="ml-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-7.072m-2.828 9.9a9 9 0 010-12.728" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-2 ml-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Chapters list */}
      {chapters.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Chapters</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => jumpToChapter(chapter)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  currentChapter === chapter
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{chapter.title}</span>
                  <span className="text-xs text-gray-500">{formatTime(chapter.startTime)}</span>
                </div>
                {chapter.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{chapter.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
