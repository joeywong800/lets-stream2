import { VideoSource, StreamResponse } from './types';
import { loadVideoSources } from './video-source-loader';
import { fetchMovieSources, fetchTVSources } from './custom-api';
import { useState, useEffect } from 'react';

// Default empty array for initial state
let videoSourcesCache: VideoSource[] = [];
let isInitialized = false;

// Custom API source definition
const customApiSource: VideoSource = {
  key: "custom-api",
  name: "Custom API (HLS)",
  getMovieUrl: async (id: number): Promise<StreamResponse | null> => {
    console.log(`[VideoSources] Fetching movie stream for ID: ${id} from Custom API`);
    const result = await fetchMovieSources(id);
    if (result && result.url) {
      console.log(`[VideoSources] Successfully found movie stream for ID: ${id}`);
      return {
        url: result.url,
        headers: result.headers,
        subtitles: result.subtitles?.map(sub => ({
          language: sub.lang,
          label: sub.label,
          file: sub.file,
        }))
      };
    }
    console.warn(`[VideoSources] No movie stream found for ID: ${id}`);
    return null;
  },
  getTVUrl: async (id: number, season: number, episode: number): Promise<StreamResponse | null> => {
    console.log(`[VideoSources] Fetching TV stream for ID: ${id}, Season: ${season}, Episode: ${episode} from Custom API`);
    const result = await fetchTVSources(id, season, episode);
    if (result && result.url) {
      console.log(`[VideoSources] Successfully found TV stream for ID: ${id}, S${season}E${episode}`);
      return {
        url: result.url,
        headers: result.headers,
        subtitles: result.subtitles?.map(sub => ({
          language: sub.lang,
          label: sub.label,
          file: sub.file,
        }))
      };
    }
    console.warn(`[VideoSources] No TV stream found for ID: ${id}, S${season}E${episode}`);
    return null;
  }
};

// Function to load sources
export async function initializeVideoSources() {
  if (isInitialized) {
    console.log('[VideoSources] Sources already initialized, returning cached sources');
    return videoSourcesCache;
  }

  console.log('[VideoSources] Initializing video sources...');
  try {
    console.log('[VideoSources] Fetching sources from remote API...');
    const sources = await loadVideoSources();
    console.log(`[VideoSources] Successfully loaded ${sources.length} sources from API`);
    videoSourcesCache = [...sources, customApiSource];
    isInitialized = true;
    console.log(`[VideoSources] Initialization complete. Total sources: ${videoSourcesCache.length}`);
    return videoSourcesCache;
  } catch (error) {
    console.error('[VideoSources] Error initializing video sources:', error);
    videoSourcesCache = [customApiSource];
    isInitialized = true;
    console.log('[VideoSources] Falling back to custom API source only');
    return videoSourcesCache;
  }
}

// Function to get current sources
export function getVideoSources(): VideoSource[] {
  if (!isInitialized) {
    console.warn('[VideoSources] Sources accessed before initialization, returning fallback source');
    return [customApiSource];
  }
  return videoSourcesCache;
}

// Hook for using video sources in components
export function useVideoSources() {
  const [sources, setSources] = useState<VideoSource[]>([customApiSource]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[VideoSources] useVideoSources hook mounted');
    let mounted = true;

    const loadSources = async () => {
      try {
        const initializedSources = await initializeVideoSources();
        if (mounted) {
          console.log('[VideoSources] Setting sources in hook:', initializedSources.length);
          setSources(initializedSources);
        }
      } catch (error) {
        console.error('[VideoSources] Error loading sources in hook:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSources();

    return () => {
      mounted = false;
    };
  }, []);

  return { sources, loading };
}

// Export just the getter for compatibility
export const videoSources = [customApiSource];
export default getVideoSources;
