import { Button } from '@/components/ui/button';
import { STREAMING_PLATFORMS } from '../constants/streamingPlatforms';

interface PlatformFilterProps {
  platformFilters: string[];
  togglePlatformFilter: (platformId: string) => void;
  clearPlatformFilters: () => void;
  togglePlatformBar: () => void;
  showPlatformBar: boolean;
}

const PlatformFilter = ({ 
  platformFilters, 
  togglePlatformFilter, 
  clearPlatformFilters,
  togglePlatformBar,
  showPlatformBar
}: PlatformFilterProps) => {
  return (
    <div className="bg-black/30 p-4 rounded-lg text-white">
      <h3 className="text-sm font-semibold mb-3">Plataformas de Streaming</h3>
      <div className="flex flex-wrap gap-2">
        {STREAMING_PLATFORMS.map(platform => (
          <Button
            key={platform.id}
            variant={platformFilters.includes(platform.id) ? 'default' : 'outline'}
            size="sm"
            onClick={() => togglePlatformFilter(platform.id)}
            className={`flex items-center gap-1 border-white/10 ${
              platformFilters.includes(platform.id)
                ? 'bg-accent/20 border-accent'
                : ''
            }`}
          >
            {platform.icon ? (
              <platform.icon className={`h-4 w-4 ${platform.color}`} />
            ) : (
              <div className={`h-3 w-3 rounded-full ${platform.color}`} />
            )}
            <span className="text-sm">{platform.name}</span>
          </Button>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        {platformFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearPlatformFilters}
            className="w-full"
          >
            Limpar Plataformas
          </Button>
        )}
        <Button
          style={{ display: 'none' }}
          variant="outline"
          size="sm"
          onClick={togglePlatformBar}
          className="w-full"
        >
          {showPlatformBar ? "Ocultar Barra de Plataformas" : "Mostrar Barra de Plataformas"}
        </Button>
      </div>
    </div>
  );
};

export default PlatformFilter;
