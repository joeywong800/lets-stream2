
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Media } from '@/utils/types';
import { backdropSizes } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaPreferences } from '@/hooks/use-media-preferences';
import { trackMediaPreference } from '@/lib/analytics';
import useKeyPress from '@/hooks/use-key-press';

interface HeroProps {
  media: Media[];
  className?: string;
}

const Hero = ({ media, className = '' }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preference } = useMediaPreferences();
  
  // Filter and prioritize media based on user preferences
  const filteredMedia = useMemo(() => {
    // First filter out items without backdrop
    const withBackdrop = media.filter(item => item.backdrop_path);
    
    // If user has a preference, prioritize that content type
    if (preference && preference !== 'balanced') {
      const preferred = withBackdrop.filter(item => item.media_type === preference);
      const others = withBackdrop.filter(item => item.media_type !== preference);
      return [...preferred, ...others];
    }
    
    return withBackdrop;
  }, [media, preference]);
  
  const featuredMedia = filteredMedia[currentIndex];

  // Navigation functions
  const goToNext = useCallback(() => {
    setIsLoaded(false); 
    setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
  }, [filteredMedia.length]);

  const goToPrev = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
  }, [filteredMedia.length]);

  // Keyboard navigation
  useKeyPress("ArrowRight", goToNext);
  useKeyPress("ArrowLeft", goToPrev);
  
  const handleMediaClick = useCallback((media: Media) => {
    trackMediaPreference(media.media_type as 'movie' | 'tv', 'select');
    navigate(media.media_type === 'movie' ? `/movie/${media.id}` : `/tv/${media.id}`);
  }, [navigate]);

  // Touch handling for swipes
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    pauseAutoRotation();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    restartAutoRotation();
  };

  // Auto rotation management
  const startAutoRotation = useCallback(() => {
    if (filteredMedia.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 10000); // 10 seconds interval
  }, [filteredMedia.length, goToNext]);

  const pauseAutoRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restartAutoRotation = () => {
    pauseAutoRotation();
    startAutoRotation();
  };

  // Initialize and clean up auto rotation
  useEffect(() => {
    startAutoRotation();
    return pauseAutoRotation;
  }, [startAutoRotation]);

  // Handle mouse interactions
  const handleMouseEnter = pauseAutoRotation;
  const handleMouseLeave = restartAutoRotation;

  // Render nothing if no media is available
  if (!featuredMedia) return null;

  const title = featuredMedia.title || featuredMedia.name || 'Untitled';
  const releaseDate = featuredMedia.release_date || featuredMedia.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const handlePlay = () => {
    const mediaType = featuredMedia.media_type;
    const id = featuredMedia.id;

    if (mediaType === 'tv') {
      navigate(`/watch/tv/${id}/1/1`);
    } else {
      navigate(`/watch/${mediaType}/${id}`);
    }
  };

  const handleMoreInfo = () => {
    navigate(`/${featuredMedia.media_type}/${featuredMedia.id}`);
  };

  return (
    <section
      className={`relative w-full h-[70vh] md:h-[80vh] overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Featured media carousel"
      aria-roledescription="carousel"
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
          <div className="w-full h-full">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Background Image with Gradient Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.05 
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Hero Image */}
          <img
            src={getImageUrl(featuredMedia.backdrop_path, backdropSizes.original)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoaded(true)}
            loading={currentIndex === 0 ? "eager" : "lazy"}
          />

          {/* Combined gradient overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" 
            style={{ backdropFilter: 'brightness(0.8)' }}
          />
          
          {/* Side gradient for better text contrast */}
          <div className="absolute inset-0 md:w-1/2 bg-gradient-to-r from-background/90 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-x-0 bottom-0 p-6 md:p-12 lg:p-16 flex flex-col items-start max-w-3xl"
        >
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-xs font-medium text-white uppercase tracking-wider">
              {featuredMedia.media_type === 'movie' ? 'Filme' : 'Série'}
            </span>
            
            {releaseYear && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white">
                <Calendar className="w-3 h-3 mr-1" />
                {releaseYear}
              </span>
            )}
            
            {featuredMedia.vote_average > 0 && (
              <span className="flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                {featuredMedia.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 
            className="text-4xl md:text-6xl font-bold text-white mb-3 text-shadow text-balance"
          >
            {title}
          </h1>

          {/* Overview */}
          <p 
            className="text-white/90 mb-8 line-clamp-3 md:line-clamp-3 text-sm md:text-base max-w-2xl text-shadow"
          >
            {featuredMedia.overview}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleMoreInfo}
              className="hero-button bg-accent hover:bg-accent/90 text-white flex items-center transition-all hover:scale-105 shadow-lg shadow-accent/20"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Assistir
            </Button>
            
            {/*<Button
              onClick={handleMoreInfo}
              variant="outline"
              size="lg"
              className="hero-button border-white/30 bg-black/40 text-white hover:bg-black/60 hover:border-white/50 flex items-center transition-all hover:scale-105"
            >
              <Info className="h-4 w-4 mr-2" />
              More Info
            </Button>*/}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination indicators */}
      {filteredMedia.length > 1 && (
        <nav 
          className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex space-x-2 z-10"
          aria-label="Hero carousel navigation"
        >
          {filteredMedia.slice(0, 5).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-accent w-8 animate-pulse'
                  : 'bg-white/30 w-2 hover:bg-white/50'
              }`}
              onClick={() => {
                setIsLoaded(false);
                setCurrentIndex(index);
              }}
              aria-label={`View featured item ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </nav>
      )}
      
      {/* Previous/Next buttons (visible on larger screens) */}
      {filteredMedia.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white p-2 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white p-2 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
};

export default Hero;
