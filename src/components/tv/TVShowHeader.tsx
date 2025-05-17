
import { Tv, Heart, Bookmark, History, Play, Calendar, Star, List, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { backdropSizes, posterSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { TVDetails } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TVShowHeaderProps {
  tvShow: TVDetails;
  isFavorite: boolean;
  isInWatchlist: boolean;
  onToggleFavorite: () => void;
  onToggleWatchlist: () => void;
  onPlayEpisode: (season: number, episode: number) => void;
  lastWatchedEpisode: { season: number; episode: number; progress: number } | null;
}

export const TVShowHeader = ({
  tvShow,
  isFavorite,
  isInWatchlist,
  onToggleFavorite,
  onToggleWatchlist,
  onPlayEpisode,
  lastWatchedEpisode
}: TVShowHeaderProps) => {
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="relative w-full h-[70vh]">
      {!backdropLoaded && (
        <div className="absolute inset-0 bg-background image-skeleton" />
      )}
          <img
        src={getImageUrl(tvShow.backdrop_path, backdropSizes.original)}
        alt={tvShow.name || 'TV Show backdrop'}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          backdropLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setBackdropLoaded(true)}
      />
        
      <div className="absolute inset-0 details-gradient" />
        
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
        <div className="flex flex-col md:flex-row items-start gap-6 max-w-6xl mx-auto">
          <div className="hidden md:block flex-shrink-0 w-48 xl:w-64 rounded-lg overflow-hidden shadow-lg">            <img 
              src={getImageUrl(tvShow.poster_path, posterSizes.medium)}
              alt={tvShow.name || 'TV show poster'} 
              className="w-full h-auto"
            />
          </div>
            
          <div className="flex-1 animate-slide-up">
            {tvShow.logo_path ? (
              <div className="relative w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto mb-4 
                            transition-all duration-300 ease-in-out hover:scale-105">
                {!logoLoaded && (
                  <div className="absolute inset-0 bg-background image-skeleton rounded-lg" />
                )}
                  
                <img                  src={getImageUrl(tvShow.logo_path, backdropSizes.original)}
                  alt={tvShow.name}
                  className={`w-full h-auto object-contain filter drop-shadow-lg
                            transition-opacity duration-700 ease-in-out
                            ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
            ) : (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 text-balance
                            animate-fade-in">
                {tvShow.name}
              </h1>
            )}
              
            {tvShow.tagline && (
              <p className="text-white/70 mb-4 italic text-lg">{tvShow.tagline}</p>
            )}
              
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {tvShow.certification && (
                <div className="flex items-center bg-white/20 px-2 py-1 rounded">
                  <Shield className="h-4 w-4 mr-1 text-white" />
                  <span className="text-white font-medium text-sm">{tvShow.certification}</span>
                </div>
              )}
                
              {tvShow.first_air_date && (
                <div className="flex items-center text-white/80">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(tvShow.first_air_date)}
                </div>
              )}
                
              <div className="flex items-center text-white/80">
                <List className="h-4 w-4 mr-2" />
                {tvShow.number_of_seasons} {tvShow.number_of_seasons === 1 ? 'Temporada' : 'Temporadas'}
              </div>
                
              {tvShow.vote_average > 0 && (
                <div className="flex items-center text-amber-400">
                  <Star className="h-4 w-4 mr-2 fill-amber-400" />
                  {tvShow.vote_average.toFixed(1)}
                </div>
              )}
                
              <div className="flex flex-wrap gap-2">
                {tvShow.genres.map((genre) => (
                  <span 
                    key={genre.id}
                    className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
              
            <p className="text-white/80 mb-6">{tvShow.overview}</p>
              
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => onPlayEpisode(1, 1)}
                className="bg-accent hover:bg-accent/80 text-white flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Assistir primeiro episódio
              </Button>

              {lastWatchedEpisode && (
                <Button 
                  onClick={() => {
                    onPlayEpisode(lastWatchedEpisode.season, lastWatchedEpisode.episode);
                  }}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10 flex items-center"
                >
                  <History className="h-4 w-4 mr-2" />
                  Continuar T{lastWatchedEpisode.season} EP{lastWatchedEpisode.episode} ({lastWatchedEpisode.progress}%)
                </Button>
              )}

              <Button 
                onClick={onToggleFavorite}
                variant="outline"
                className={cn(
                  "border-white/20", 
                  isFavorite ? "bg-accent text-white" : "bg-black/50 text-white hover:bg-black/70"
                )}
              >
                <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
                {isFavorite ? 'Favorito' : 'Favorito'}
              </Button>

              <Button 
                onClick={onToggleWatchlist}
                variant="outline"
                className={cn(
                  "border-white/20", 
                  isInWatchlist ? "bg-accent text-white" : "bg-black/50 text-white hover:bg-black/70"
                )}
              >
                <Bookmark className={cn("h-4 w-4 mr-2", isInWatchlist && "fill-current")} />
                {isInWatchlist ? 'Minha Lista' : 'Minha Lista'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVShowHeader;
