
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getTrending } from '@/utils/api';
import { Media, ensureExtendedMediaArray } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Trending = () => {
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [allTrending, setAllTrending] = useState<Media[]>([]);
  
  const trendingQuery = useQuery({
    queryKey: ['trending', timeWindow, page],
    queryFn: () => getTrending(timeWindow, page),
    placeholderData: keepPreviousData,
  });

  // Update accumulated trending items when new data arrives
  useEffect(() => {
    if (trendingQuery.data) {
      setAllTrending(prev => {
        const newItems = trendingQuery.data
          .filter(item => !prev.some(p => p.id === item.id))
          .map(item => ({
            ...item,
            media_type: item.media_type as "movie" | "tv"
          }));
        return [...prev, ...newItems];
      });
    }
  }, [trendingQuery.data]);

  // Prefetch next page
  useEffect(() => {
    if (trendingQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['trending', timeWindow, page + 1],
        queryFn: () => getTrending(timeWindow, page + 1),
      });
    }
  }, [page, timeWindow, queryClient, trendingQuery.data]);
  
  const handleShowMore = () => {
    setPage(prev => prev + 1);
  };
  
  // Check if there are more items to load
  const hasMore = trendingQuery.data?.length === ITEMS_PER_PAGE;
  
  // Reset accumulated data when changing time window
  const handleTimeWindowChange = (value: 'day' | 'week') => {
    setTimeWindow(value);
    setPage(1);
    setAllTrending([]);
  };

  // Convert Media[] to ExtendedMedia[] for MediaGrid
  const extendedMedia = ensureExtendedMediaArray(allTrending);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="flex items-center gap-3 mb-8 pt-10">
            <TrendingUp className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold text-white">Tendências</h1>
          </div>
          
          <Tabs defaultValue="week" onValueChange={(value) => handleTimeWindowChange(value as 'day' | 'week')}>
            <TabsList className="mb-8">
              <TabsTrigger value="day">Hoje</TabsTrigger>
              <TabsTrigger value="week">Esta semana</TabsTrigger>
            </TabsList>
            
            <TabsContent value="day">
              {trendingQuery.isLoading ? (
                <MediaGridSkeleton />
              ) : trendingQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading trending content. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={extendedMedia} title="Tendência de hoje" />
                  
                  {hasMore && (
                    <div className="flex justify-center my-8">
                      <Button 
                        onClick={handleShowMore}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {trendingQuery.isFetching ? (
                          <>Loading...</>
                        ) : (
                          <>Mostrar mais <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="week">
              {trendingQuery.isLoading ? (
                <MediaGridSkeleton />
              ) : trendingQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading trending content. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={extendedMedia} title="Tendência desta semana" />
                  
                  {hasMore && (
                    <div className="flex justify-center my-8">
                      <Button 
                        onClick={handleShowMore}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {trendingQuery.isFetching ? (
                          <>Loading...</>
                        ) : (
                          <>Mostrar mais <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Trending;
