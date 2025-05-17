import { tmdb } from './tmdb';
import { Media, Episode, MovieImagesResponse } from '../types';
import { TVDetails } from '../types/tv';
import { TMDBTVResult, TMDBTVDetailsResult } from '../types/tmdb';
import { formatMediaResult } from './media';
import { TMDB } from '../config/constants';

const LANGUAGE = 'pt-BR';

export async function getTVShow(id: number): Promise<TVDetails> {
  const response = await tmdb.get<TMDBTVDetailsResult>(`/tv/${id}`, {
    params: { language: LANGUAGE }
  });
  return formatTVDetails(response.data);
}

export async function getPopularTVShows(page = 1): Promise<Media[]> {
  const response = await tmdb.get<{ results: TMDBTVResult[] }>('/tv/popular', {
    params: { page, language: LANGUAGE }
  });
  return response.data.results.map(formatMediaResult);
}

export async function getTopRatedTVShows(page = 1): Promise<Media[]> {
  const response = await tmdb.get<{ results: TMDBTVResult[] }>('/tv/top_rated', {
    params: { page, language: LANGUAGE }
  });
  return response.data.results.map(formatMediaResult);
}

export async function getTrendingTVShows(timeWindow: 'day' | 'week' = 'week', page = 1): Promise<Media[]> {
  const response = await tmdb.get<{ results: TMDBTVResult[] }>(`/trending/tv/${timeWindow}`, {
    params: { page, language: LANGUAGE }
  });
  return response.data.results.map(formatMediaResult);
}

export async function getTVEpisode(id: number, season: number, episode: number): Promise<Episode> {
  const response = await tmdb.get<TVEpisodeResult>(
    `/tv/${id}/season/${season}/episode/${episode}`,
    { params: { language: LANGUAGE } }
  );
  return {
    id: response.data.id,
    name: response.data.name,
    overview: response.data.overview,
    episode_number: response.data.episode_number,
    season_number: response.data.season_number,
    still_path: response.data.still_path,
    air_date: response.data.air_date,
    vote_average: response.data.vote_average
  };
}

export async function getTVRecommendations(id: number): Promise<Media[]> {
  try {
    const response = await tmdb.get<{ results: TMDBTVResult[] }>(`/tv/${id}/recommendations`, {
      params: { language: LANGUAGE }
    });
    return response.data.results.map(item => formatMediaResult({ ...item, media_type: 'tv' }));
  } catch (error) {
    console.error('Error fetching TV recommendations:', error);
    return [];
  }
}

interface TVEpisodeResult {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  vote_average: number;
}

export async function getTVDetails(id: number): Promise<TVDetails | null> {
  try {
    const [detailsResponse, imagesResponse] = await Promise.all([
      tmdb.get<TMDBTVDetailsResult>(`/tv/${id}`, {
        params: {
          append_to_response: 'content_ratings',
          language: LANGUAGE
        }
      }),
      tmdb.get<MovieImagesResponse>(`/tv/${id}/images`)
    ]);

    const detailsData = detailsResponse.data;
    const imagesData = imagesResponse.data;

    let certification = "";
    if (detailsData.content_ratings && detailsData.content_ratings.results) {
      const usRating = detailsData.content_ratings?.results.find((country) => country.iso_3166_1 === "US");
      if (usRating) {
        certification = usRating.rating || "";
      }
    }

    let bestLogo = null;
    if (imagesData.logos && imagesData.logos.length > 0) {
      const englishLogos = imagesData.logos.filter(logo => logo.iso_639_1 === "en");
      if (englishLogos.length > 0) {
        bestLogo = englishLogos.reduce((prev, current) =>
          (prev.vote_average > current.vote_average) ? prev : current
        );
      }
    }

    const formattedData = formatMediaResult({ ...detailsData, media_type: 'tv' });

    return {
      ...formattedData,
      name: formattedData.name || detailsData.name || 'Série Desconhecida',
      first_air_date: formattedData.first_air_date || detailsData.first_air_date || '',
      episode_run_time: detailsData.episode_run_time || [],
      genres: detailsData.genres || [],
      status: detailsData.status || '',
      tagline: detailsData.tagline || '',
      number_of_episodes: detailsData.number_of_episodes || 0,
      number_of_seasons: detailsData.number_of_seasons || 0,
      seasons: detailsData.seasons || [],
      production_companies: detailsData.production_companies || [],
      certification: certification,
      logo_path: bestLogo ? bestLogo.file_path : null,
    };
  } catch (error) {
    console.error(`Error fetching TV details for id ${id}:`, error);
    return null;
  }
}

export async function validateTVId(tmdbId: number): Promise<boolean> {
  try {
    const response = await tmdb.get(`/tv/${tmdbId}`, {
      params: { language: LANGUAGE }
    });
    return response.data && response.data.id === tmdbId;
  } catch (error) {
    return false;
  }
}

function formatTVDetails(show: TMDBTVDetailsResult): TVDetails {
  const formattedData = formatMediaResult({ ...show, media_type: 'tv' });

  return {
    ...formattedData,
    name: show.name || 'Série Desconhecida',
    first_air_date: show.first_air_date || '',
    episode_run_time: show.episode_run_time || [],
    genres: show.genres || [],
    status: show.status || '',
    tagline: show.tagline || '',
    number_of_episodes: show.number_of_episodes || 0,
    number_of_seasons: show.number_of_seasons || 0,
    seasons: show.seasons || [],
    production_companies: show.production_companies || [],
    certification: '',
    logo_path: null,
  };
}

export async function getSeasonDetails(id: number, seasonNumber: number): Promise<Episode[]> {
  try {
    const response = await tmdb.get<{ episodes: Episode[] }>(
      `/tv/${id}/season/${seasonNumber}`,
      { params: { language: LANGUAGE } }
    );
    return response.data.episodes;
  } catch (error) {
    console.error(`Error fetching season ${seasonNumber} for TV show ${id}:`, error);
    return [];
  }
}
