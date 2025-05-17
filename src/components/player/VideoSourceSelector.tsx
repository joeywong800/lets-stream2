
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VideoSource } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/user-preferences';
import { useAuth } from '@/hooks';

interface VideoSourceSelectorProps {
  videoSources: VideoSource[];
  selectedSource: string;
  onSourceChange: (sourceKey: string) => void;
  isCustomSource: boolean;
}

const VideoSourceSelector = ({
  videoSources,
  selectedSource,
  onSourceChange,
  isCustomSource
}: VideoSourceSelectorProps) => {
  const { toast } = useToast();
  const { updatePreferences } = useUserPreferences();
  const { user } = useAuth();

  const handleSourceChange = async (sourceKey: string) => {
    onSourceChange(sourceKey);
    
    if (user) {
      await updatePreferences({
        preferred_source: sourceKey
      });
    }
    
    const sourceName = videoSources.find(s => s.key === sourceKey)?.name || 'new source';
    toast({
      title: "Source Changed",
      description: `Switched to ${sourceName}`,
      duration: 3000,
    });
  };

  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {videoSources.map((source, index) => (
        <motion.button
          key={source.key}
          onClick={() => handleSourceChange(source.key)}
          className={cn(
            "relative group p-4 rounded-lg border transition-all duration-300",
            "bg-gradient-to-br backdrop-blur-sm",
            selectedSource === source.key
              ? "from-accent/20 to-accent/10 border-accent"
              : "from-white/5 to-transparent border-white/10 hover:border-white/20"
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm font-medium transition-colors",
                selectedSource === source.key ? "text-accent" : "text-white group-hover:text-white/90"
              )}>
                {source.name}
              </span>
              {selectedSource === source.key && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-2 w-2 rounded-full bg-accent"
                />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {selectedSource === source.key ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-accent flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Ativo
                </motion.div>
              ) : (
                <span className="text-xs text-white/40">Clica para selecionar</span>
              )}
            </div>
          </div>
          
          {/* Highlight effect */}
          <div className={cn(
            "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300",
            "bg-gradient-to-br from-white/5 to-transparent",
            "group-hover:opacity-100"
          )} />
        </motion.button>
      ))}
    </motion.div>
  );
};

export default VideoSourceSelector;
