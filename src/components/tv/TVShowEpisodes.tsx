import { Play, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backdropSizes } from '@/utils/api';
import { Episode, Season } from '@/utils/types';
import { format } from 'date-fns';
import { getImageUrl } from '@/utils/services/tmdb';

interface TVShowEpisodesProps {
  seasons: Season[];
  episodes: Episode[];
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  onPlayEpisode: (seasonNumber: number, episodeNumber: number) => void;
}

export const TVShowEpisodes = ({
  seasons,
  episodes,
  selectedSeason,
  onSeasonChange,
  onPlayEpisode
}: TVShowEpisodesProps) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-6">Escolhe temporada e episódio</h2>
        
      <Tabs 
        defaultValue={selectedSeason.toString()} 
        onValueChange={(value) => onSeasonChange(parseInt(value, 10))}
        className="mb-6"
      >
        <TabsList className="bg-white/10 p-1 overflow-x-auto flex-nowrap whitespace-nowrap max-w-full">
          {seasons
            .filter(season => season.season_number > 0)
            .map(season => (
              <TabsTrigger 
                key={season.id}
                value={season.season_number.toString()}
                className={selectedSeason === season.season_number ? 'text-white' : 'text-white/70'}
              >
                Temporada {season.season_number}
              </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>
        
      <div className="space-y-4">
        {episodes.length > 0 ? (
          episodes.map(episode => (
            <div key={episode.id} className="glass p-4 rounded-lg">
              <div className="flex flex-col md:flex-row gap-4">
                {episode.still_path && (
                  <div className="flex-shrink-0 w-full md:w-48">
                    <img 
                      src={getImageUrl(episode.still_path, backdropSizes.small)} 
                      alt={`${episode.name} still`}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      {episode.air_date && (
                        <div className="flex items-center text-white/60 text-sm mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(episode.air_date)}
                        </div>
                      )}
                    </div>
                    {episode.vote_average > 0 && (
                      <div className="flex items-center text-amber-400 text-sm">
                        <Star className="h-3 w-3 mr-1 fill-amber-400" />
                        {episode.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{episode.overview}</p>
                  
                  <Button 
                    onClick={() => onPlayEpisode(episode.season_number, episode.episode_number)}
                    size="sm"
                    className="bg-accent hover:bg-accent/80 text-white flex items-center"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Assistir Agora
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-white/70">
            No episodes available for this season.
          </div>
        )}
      </div>
    </>
  );
};

export default TVShowEpisodes;
