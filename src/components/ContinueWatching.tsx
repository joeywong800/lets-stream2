import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { useWatchHistory } from '@/hooks/watch-history';
import { WatchHistoryItem } from '@/contexts/types/watch-history';
import { Play, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // 👈 Adicionado para tradução

interface ContinueWatchingProps {
  maxItems?: number;
}

const ContinueWatching = ({ maxItems = 20 }: ContinueWatchingProps) => {
  const { user } = useAuth();
  const { watchHistory } = useWatchHistory();
  const [continuableItems, setContinuableItems] = useState<WatchHistoryItem[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const processedHistory = useMemo(() => {
    if (watchHistory.length === 0) return [];
    const validItems = watchHistory.filter(item => {
      if (!item.created_at) return false;
      try {
        const date = new Date(item.created_at);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    });
    const uniqueMediaMap = new Map<string, WatchHistoryItem>();
    validItems.forEach(item => {
      const key = `${item.media_type}-${item.media_id}${item.media_type === 'tv' ? `-s${item.season}-e${item.episode}` : ''}`;
      if (!uniqueMediaMap.has(key) || new Date(item.created_at) > new Date(uniqueMediaMap.get(key)!.created_at)) {
        uniqueMediaMap.set(key, item);
      }
    });
    return Array.from(uniqueMediaMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [watchHistory]);

  useEffect(() => {
    setContinuableItems(processedHistory.slice(0, maxItems));
  }, [processedHistory, maxItems]);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };
  
  // ✅ Atualizada para português
  const formatLastWatched = (dateString: string) => {
    if (!dateString) return 'Recentemente';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date > new Date()) {
        return 'Recentemente';
      }
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Recentemente';
    }
  };

  const formatTimeRemaining = (position: number, duration: number) => {
    if (!duration) return '';
    const remaining = Math.max(0, duration - position);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    return `Duração ${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user || continuableItems.length === 0) return null;

  const handleContinueWatching = (item: WatchHistoryItem) => {
    if (item.media_type === 'movie') {
      navigate(`/watch/${item.media_type}/${item.media_id}`);
    } else if (item.media_type === 'tv') {
      navigate(`/watch/${item.media_type}/${item.media_id}/${item.season}/${item.episode}`);
    }
  };

  const handleNavigateToDetails = (event: React.MouseEvent, item: WatchHistoryItem) => {
    event.stopPropagation();
    navigate(`/${item.media_type === 'movie' ? 'movie' : 'tv'}/${item.media_id}`);
  };

  return (
    <div className="px-4 md:px-8 mt-8 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-accent" />
        Continuar Assistir
      </h2>
      
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showLeftArrow && (
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            } hidden md:flex`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <motion.div 
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 pb-4"
          onScroll={handleScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {continuableItems.map((item) => (
            <motion.div
              key={`${item.id}-${item.media_id}-${item.season || 0}-${item.episode || 0}`}
              className="relative flex-none w-[280px] md:w-[300px] aspect-video bg-card rounded-lg overflow-hidden group cursor-pointer hover-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleContinueWatching(item)}
              style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-white font-medium line-clamp-1 text-base md:text-lg">{item.title}</h3>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full bg-black/30 hover:bg-accent/80 transition-colors -mt-1"
                          onClick={(e) => handleNavigateToDetails(e, item)}
                        >
                          <Info className="h-3.5 w-3.5 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Ver detalhes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatLastWatched(item.created_at)}
                  </span>
                  {item.media_type === 'tv' && (
                    <span>T{item.season} EP{item.episode}</span>
                  )}
                </div>
                <div className="mb-3 relative">
                  <Progress 
                    value={(item.watch_position / item.duration) * 100} 
                    className="h-1" 
                  />
                  <div className="text-xs text-white/70 mt-1 text-right">
                    {formatTimeRemaining(item.watch_position, item.duration)}
                  </div>
                </div>
                <Button 
                  className="w-full bg-accent hover:bg-accent/80 text-white flex items-center justify-center gap-1"
                  size="sm"
                >
                  <Play className="h-3 w-3" />
                  Continuar
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {showRightArrow && (
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white transition-all ${
              isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            } hidden md:flex`}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContinueWatching;
