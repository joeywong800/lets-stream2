
import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/player/VideoPlayer';
import VideoSourceSelector from '@/components/player/VideoSourceSelector';
import EpisodeNavigation from '@/components/player/EpisodeNavigation';
import MediaActions from '@/components/player/MediaActions';
import { useMediaPlayer } from '@/hooks/use-media-player';
import { videoSources } from '@/utils/video-sources';
import { useAuth } from '@/hooks';

const Player = () => {
  const { id, season, episode, type } = useParams<{
    id: string;
    season?: string;
    episode?: string;
    type: string;
  }>();
  const { user } = useAuth();
  
  const {
    title,
    mediaType,
    mediaDetails,
    episodes,
    currentEpisodeIndex,
    isLoading,
    isPlayerLoaded,
    iframeUrl,
    streamUrl,
    isCustomSource,
    selectedSource,
    isFavorite,
    isInMyWatchlist,
    handleSourceChange,
    goToDetails,
    goToNextEpisode,
    goToPreviousEpisode,
    toggleFavorite,
    toggleWatchlist,
    handlePlayerLoaded,
    handlePlayerError,
    goBack
  } = useMediaPlayer(id, season, episode, type);

  const posterUrl = mediaDetails ? 
    `https://image.tmdb.org/t/p/w1280${mediaDetails.backdrop_path}` 
    : undefined;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background relative"
    >
      <div className="fixed inset-0 bg-gradient-to-b from-background/95 to-background pointer-events-none" />
      
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent"
      >
        <Navbar />
      </motion.nav>

      <div className="relative z-10 container mx-auto px-4">
        <MediaActions 
          isFavorite={isFavorite}
          isInWatchlist={isInMyWatchlist}
          onToggleFavorite={toggleFavorite}
          onToggleWatchlist={toggleWatchlist}
          onBack={goBack}
          onViewDetails={goToDetails}
        />

        <VideoPlayer 
          isLoading={isLoading}
          isCustomSource={isCustomSource}
          streamUrl={streamUrl}
          iframeUrl={iframeUrl}
          title={title}
          poster={posterUrl}
          onLoaded={handlePlayerLoaded}
          onError={handlePlayerError}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          {mediaType === 'tv' && episodes.length > 0 && (
            <EpisodeNavigation 
              episodes={episodes}
              currentEpisodeIndex={currentEpisodeIndex}
              onPreviousEpisode={goToPreviousEpisode}
              onNextEpisode={goToNextEpisode}
            />
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Fontes de vídeo</h3>
                <p className="text-sm text-white/60">Seleciona a tua melhor opção</p>
              </div>
              <Button
               style={{ display: 'none' }}
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                onClick={goToDetails}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                
              </Button>
            </div>

            <VideoSourceSelector 
              videoSources={videoSources}
              selectedSource={selectedSource}
              onSourceChange={handleSourceChange}
              isCustomSource={isCustomSource}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Player;
