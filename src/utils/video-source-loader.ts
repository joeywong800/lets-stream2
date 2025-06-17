import { VideoSource } from './types';

interface JsonVideoSource {
  key: string;
  name: string;
  movieUrlPattern: string;
  tvUrlPattern: string;
}

function createVideoSource(source: JsonVideoSource): VideoSource {
  console.log(`[VideoSourceLoader] Creating source: ${source.name} (${source.key})`);
  return {
    key: source.key,
    name: source.name,
    getMovieUrl: (id: number) => source.movieUrlPattern.replace('{id}', id.toString()),
    getTVUrl: (id: number, season: number, episode: number) =>
      source.tvUrlPattern
        .replace('{id}', id.toString())
        .replace('{season}', season.toString())
        .replace('{episode}', episode.toString()),
  };
}

export async function loadVideoSources(): Promise<VideoSource[]> {
  try {
    console.log('[VideoSourceLoader] Fetching video sources from remote API...');
    const response = await fetch('https://vd-src-worker.chintanr21.workers.dev/api');

    if (!response.ok) {
      console.error(`[VideoSourceLoader] API response not ok: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log('[VideoSourceLoader] Raw API response:', data);

    if (!data || typeof data !== 'object') {
      console.error('[VideoSourceLoader] Invalid API response format - expected an object');
      return [];
    }

    if (!Array.isArray(data.sources)) {
      console.error('[VideoSourceLoader] Invalid API response - sources is not an array:', data);
      return [];
    }

    console.log(`[VideoSourceLoader] Received ${data.sources.length} sources from API`);

    // Validate each source before creating it
    const validSources = data.sources.filter(source => {
      if (!source || typeof source !== 'object') {
        console.warn('[VideoSourceLoader] Invalid source object:', source);
        return false;
      }
      if (!source.key || !source.name || !source.movieUrlPattern || !source.tvUrlPattern) {
        console.warn('[VideoSourceLoader] Source missing required fields:', source);
        return false;
      }
      return true;
    });

    const sources = validSources.map(createVideoSource);
    console.log('[VideoSourceLoader] Successfully processed all sources');
    return sources;
  } catch (error) {
    console.error('[VideoSourceLoader] Error loading video sources:', error);
    if (error instanceof TypeError) {
      console.error('[VideoSourceLoader] Type error details:', error.message);
    }
    return []; // Return empty array in case of error
  }
}
