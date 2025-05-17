import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { useWatchHistory } from '@/hooks/watch-history';
import { useUserPreferences } from '@/hooks/user-preferences';
import { User, History, Settings, Check, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import AccentColorPicker from '@/components/AccentColorPicker';
import { videoSources } from '@/utils/video-sources';

const Profile = () => {
  const { user, logout } = useAuth();
  const { watchHistory, clearWatchHistory, hasMore, isLoading, loadMore } = useWatchHistory();
  const { userPreferences, toggleWatchHistory, toggleNotifications, updatePreferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState('history');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loader = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  }, [loadMore]);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const currentLoader = loader.current;
    const currentObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && activeTab === 'history') {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (currentLoader) {
      currentObserver.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        currentObserver.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoadingMore, activeTab, handleLoadMore]);

  const handleClearHistory = () => {
    clearWatchHistory();
    toast({
      title: "Watch history cleared",
      description: "Your watch history has been successfully cleared."
    });
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Error is handled in auth context
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-slow text-white font-medium">Loading...</div>
      </div>
    );
  }

  // Convert watch history items to Media format for the MediaGrid
  const watchHistoryMedia = watchHistory.map(item => ({
    id: item.media_id,
    media_id: item.media_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    vote_average: item.rating || 0,
    media_type: item.media_type,
    genre_ids: [],
    // Additional watch info to display
    watch_position: item.watch_position,
    duration: item.duration,
    created_at: item.created_at
  }));

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      
      <motion.div 
        className="container mx-auto pt-24 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 bg-accent text-white text-2xl">
              <AvatarImage src={user.photoURL || ""} alt={user.email || 'User'} />
              <AvatarFallback>
                {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {user.displayName || user.email || 'User Profile'}
              </h1>
              <p className="text-white/70">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="border-white/20 bg-black/50 text-white hover:bg-black/70"
                >
                  Terminar Sessão
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-background border border-white/10">
            <TabsTrigger value="history" className="data-[state=active]:bg-accent">
              <History className="h-4 w-4 mr-2" />
              Continuar Assistir
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-accent">
              <Settings className="h-4 w-4 mr-2" />
              Preferências
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Histórico </h2>
              
              {watchHistory.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearHistory}
                  className="border-white/20 bg-black/50 text-white hover:bg-black/70"
                >
                  Limpar Histórico
                </Button>
              )}
            </div>
            
            {watchHistory.length > 0 ? (
              <>
                <MediaGrid media={watchHistoryMedia} listView />
                {(hasMore || isLoadingMore) && (
                  <div 
                    ref={loader}
                    className="w-full flex justify-center py-4"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                )}
              </>
            ) : (
              <div className="glass p-8 rounded-lg text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-white/50" />
                <h3 className="text-lg font-medium text-white mb-2">Ainda não assistis-te a nada !</h3>
                <p className="text-white/70 mb-4">
                  Comece a ver filmes e séries & Animes para construir o teu histórico.
                </p>
                <Button onClick={() => navigate('/')}>
                  Descobrir conteúdo
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preferences" className="pt-4">
            <div className="glass p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">As tuas Preferências</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-medium text-white">Histórico De Assistir</h3>
                    <p className="text-sm text-white/70">
                      {userPreferences?.isWatchHistoryEnabled
                        ? "O teu histórico está a ser guardado"
                        : "O teu histórico não está a ser guardado"}
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.isWatchHistoryEnabled}
                    onCheckedChange={toggleWatchHistory}
                    aria-label="Toggle watch history"
                  />
                </div>
                
                {/* Accent Color Picker */}
                <AccentColorPicker />
                
                {/* Video Source Preference */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Fonte de vídeo preferida</h3>
                  <p className="text-sm text-white/70">
                    Selecione a tua fonte de vídeo predefinida para filmes e séries & Animes
                  </p>
                  <Select 
                    value={userPreferences?.preferred_source || ''} 
                    onValueChange={(value) => updatePreferences({ preferred_source: value })}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecionar fonte" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10">
                      {videoSources.map(source => (
                        <SelectItem 
                          key={source.key} 
                          value={source.key}
                          className="text-white focus:text-white focus:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            {userPreferences?.preferred_source === source.key && (
                              <Check className="h-4 w-4" />
                            )}
                            {source.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feature Notifications Toggle */}
                <div className="flex items-center justify-between"
                style={{ display: 'none' }}
                >
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-medium">Feature Notifications</h3>
                    <p className="text-sm text-white/70">
                      Get notified about new features and updates
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.isNotificationsEnabled}
                    onCheckedChange={toggleNotifications}
                    aria-label="Toggle feature notifications"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Profile;
