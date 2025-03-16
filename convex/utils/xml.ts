// Use Node.js runtime for XML processing
"use node";

import { Builder } from 'xml2js';

interface PodcastInfo {
  title: string;
  description: string;
  author: string;
  email?: string;
  imageUrl: string;
  category: string;
  language: string;
  explicit: boolean;
  link: string;
  copyright?: string;
  owner?: {
    name: string;
    email: string;
  };
}

interface EpisodeInfo {
  guid: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration?: number; // in seconds
  imageUrl?: string;
  explicit?: boolean;
  season?: number;
  episode?: number;
  episodeType?: 'full' | 'trailer' | 'bonus';
  chapters?: Array<{
    startTime: number;
    title: string;
    url?: string;
  }>;
}

/**
 * Generate an RSS feed XML for a podcast
 */
export function generatePodcastRSS(
  podcastInfo: PodcastInfo,
  episodes: EpisodeInfo[]
): string {
  const now = new Date();
  
  // Format the date according to RFC 822
  const formatRFC822Date = (date: Date): string => {
    return date.toUTCString();
  };
  
  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };
  
  // Build the RSS feed object
  const rss = {
    rss: {
      $: {
        'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
        'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
        'xmlns:podcast': 'https://podcastindex.org/namespace/1.0',
        'version': '2.0'
      },
      channel: {
        title: podcastInfo.title,
        description: podcastInfo.description,
        link: podcastInfo.link,
        language: podcastInfo.language,
        copyright: podcastInfo.copyright || `Copyright ${now.getFullYear()} ${podcastInfo.author}`,
        lastBuildDate: formatRFC822Date(now),
        pubDate: episodes.length > 0 
          ? formatRFC822Date(episodes[0].pubDate) 
          : formatRFC822Date(now),
        'itunes:author': podcastInfo.author,
        'itunes:summary': podcastInfo.description,
        'itunes:type': 'episodic',
        'itunes:owner': {
          'itunes:name': podcastInfo.owner?.name || podcastInfo.author,
          'itunes:email': podcastInfo.owner?.email || podcastInfo.email || ''
        },
        'itunes:explicit': podcastInfo.explicit ? 'yes' : 'no',
        'itunes:category': {
          $: {
            text: podcastInfo.category
          }
        },
        'itunes:image': {
          $: {
            href: podcastInfo.imageUrl
          }
        },
        'itunes:new-feed-url': podcastInfo.link,
        item: episodes.map(episode => ({
          title: episode.title,
          description: episode.description,
          'content:encoded': episode.description,
          guid: {
            _: episode.guid,
            $: {
              isPermaLink: 'false'
            }
          },
          pubDate: formatRFC822Date(episode.pubDate),
          link: episode.audioUrl,
          enclosure: {
            $: {
              url: episode.audioUrl,
              type: 'audio/mpeg',
              length: '0' // In a real implementation, you'd include the file size
            }
          },
          'itunes:title': episode.title,
          'itunes:author': podcastInfo.author,
          'itunes:summary': episode.description,
          'itunes:image': {
            $: {
              href: episode.imageUrl || podcastInfo.imageUrl
            }
          },
          'itunes:explicit': episode.explicit !== undefined 
            ? (episode.explicit ? 'yes' : 'no') 
            : (podcastInfo.explicit ? 'yes' : 'no'),
          'itunes:duration': episode.duration ? formatDuration(episode.duration) : '00:00',
          ...(episode.season ? { 'itunes:season': episode.season } : {}),
          ...(episode.episode ? { 'itunes:episode': episode.episode } : {}),
          ...(episode.episodeType ? { 'itunes:episodeType': episode.episodeType } : {}),
          ...(episode.chapters && episode.chapters.length > 0 ? {
            'podcast:chapters': {
              $: {
                type: 'json',
                url: `${podcastInfo.link}/chapters/${episode.guid}.json`
              }
            }
          } : {})
        }))
      }
    }
  };
  
  // Convert the object to XML
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '  ', newline: '\n' },
    headless: false
  });
  
  return builder.buildObject(rss);
}

/**
 * Generate a JSON chapters file for an episode
 */
export function generateChaptersJson(
  episodeTitle: string,
  chapters: Array<{
    startTime: number;
    title: string;
    url?: string;
  }>
): string {
  const chaptersObj = {
    version: '1.2.0',
    title: episodeTitle,
    chapters: chapters.map((chapter, index) => ({
      startTime: chapter.startTime,
      title: chapter.title,
      ...(chapter.url ? { img: chapter.url } : {}),
      ...(index === chapters.length - 1 ? { endTime: -1 } : {})
    }))
  };
  
  return JSON.stringify(chaptersObj, null, 2);
}
