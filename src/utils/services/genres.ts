import { tmdb } from './tmdb';
import { Media } from '../types';
import { TMDBMovieResult } from '../types/tmdb';
import { formatMediaResult } from './media';

// Genre IDs
const GENRES = {
  ACTION: 28,
  DRAMA: 18,
} as const;

// Helper function for genre content
const getGenreContent = async (genreId: number, page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        language: 'pt-BR',
        page
      }
    });
    return response.data.results.map((item: TMDBMovieResult) => formatMediaResult({ ...item, media_type: 'movie' }));
  } catch (error) {
    console.error(`Error fetching genre ${genreId} content:`, error);
    return [];
  }
};

// Action movies (genre id: 28)
export const getActionMovies = (page: number = 1) => getGenreContent(GENRES.ACTION, page);

// Drama movies (genre id: 18)
export const getDramaMovies = (page: number = 1) => getGenreContent(GENRES.DRAMA, page);

// Bollywood: Hindi language movies (India)
export const getBollywoodMovies = async (page: number = 1): Promise<Media[]> => {
  try {
    const response = await tmdb.get('/discover/movie', {
      params: {
        with_original_language: 'hi',
        region: 'IN',
        sort_by: 'popularity.desc',
        language: 'pt-BR',
        page
      }
    });
    return response.data.results.map((item: TMDBMovieResult) => formatMediaResult({ ...item, media_type: 'movie' }));
  } catch (error) {
    console.error('Error fetching Bollywood movies:', error);
    return [];
  }
};
