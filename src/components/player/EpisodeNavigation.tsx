import { Button } from '@/components/ui/button';
import { SkipBack, SkipForward } from 'lucide-react';
import { Episode } from '@/utils/types';
import { cn } from '@/lib/utils';

interface EpisodeNavigationProps {
  episodes: Episode[];
  currentEpisodeIndex: number;
  onPreviousEpisode: () => void;
  onNextEpisode: () => void;
}

const EpisodeNavigation = ({
  episodes,
  currentEpisodeIndex,
  onPreviousEpisode,
  onNextEpisode
}: EpisodeNavigationProps) => {
  if (episodes.length === 0) return null;

  const currentEpisode = episodes[currentEpisodeIndex];

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Estás a assistir</h3>
          <p className="text-sm text-white/60">
            Temporada {currentEpisode?.season_number} • Episódio {currentEpisode?.episode_number} de {episodes.length}
          </p>
        </div>
      </div>

      <div className="glass p-4 rounded-lg border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col space-y-3">
          {/* Current Episode Info */}
          <div className="space-y-1">
            <h4 className="text-white font-medium">
              {currentEpisode?.name || 'Episódio ' + currentEpisode?.episode_number}
            </h4>
            {currentEpisode?.overview && (
              <p className="text-sm text-white/70 line-clamp-2">
                {currentEpisode?.overview}
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                onClick={onPreviousEpisode}
                disabled={currentEpisodeIndex === 0}
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Episódio anterior
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                onClick={onNextEpisode}
                disabled={currentEpisodeIndex === episodes.length - 1}
              >
                Próximo
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                onClick={handleGoBack}
              >
                Selecionar Temporada
              </Button>
            </div>

            {currentEpisode?.air_date && (
              <span className="text-sm text-white/40">
                Lançado: {new Date(currentEpisode.air_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeNavigation;
