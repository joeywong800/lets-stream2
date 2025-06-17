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
    const response = await fetch('https://vd-src-worker.chintanr21.workers.dev/');
    const data = await response.json();
    console.log(`[VideoSourceLoader] Received ${data.videoSources?.length || 0} sources from API`);
    const sources = (data.videoSources as JsonVideoSource[]).map(createVideoSource);
    console.log('[VideoSourceLoader] Successfully processed all sources');
    return sources;
  } catch (error) {
    console.error('[VideoSourceLoader] Error loading video sources:', error);
    return []; // Return empty array in case of error
  }
}
