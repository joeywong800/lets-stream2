
import { Search, History, Film, Tv } from 'lucide-react';
import { Media } from '@/utils/types';

interface SearchSuggestionsProps {
  suggestions: string[] | Media[];
  onSuggestionClick: (suggestion: string | Media) => void;
  searchQuery?: string;
  onViewAllResults?: () => void;
}

const SearchSuggestions = ({ 
  suggestions, 
  onSuggestionClick,
  searchQuery,
  onViewAllResults
}: SearchSuggestionsProps) => {
  if (!suggestions.length) return null;
  
  // Determine if suggestions are strings or Media objects
  const isMediaSuggestions = typeof suggestions[0] !== 'string';
  
  return (
    <div className="absolute z-50 w-full mt-1 bg-background border border-white/10 rounded-md shadow-lg overflow-hidden animate-fade-in">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => {
          if (isMediaSuggestions) {
            // Handle Media type suggestions
            const mediaItem = suggestion as Media;
            return (
              <li key={`${mediaItem.media_type}-${mediaItem.id}`}>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 text-left group transition-colors"
                  onClick={() => onSuggestionClick(mediaItem)}
                  type="button"
                >
                  <span className="mr-2">
                    {mediaItem.media_type === 'movie' ? 
                      <Film className="h-4 w-4 text-white/50 group-hover:text-accent" /> : 
                      <Tv className="h-4 w-4 text-white/50 group-hover:text-accent" />
                    }
                  </span>
                  <span className="flex-1 truncate">{mediaItem.title || mediaItem.name}</span>
                  <span className="ml-2 text-xs text-white/50 opacity-0 group-hover:opacity-100">Go to page</span>
                </button>
              </li>
            );
          } else {
            // Handle string type suggestions (history items)
            const isHistory = index < 2;
            return (
              <li key={index}>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 text-left group transition-colors"
                  onClick={() => onSuggestionClick(suggestion as string)}
                  type="button"
                >
                  {isHistory ? (
                    <History className="h-4 w-4 mr-2 text-white/50 group-hover:text-accent transition-colors" />
                  ) : (
                    <Search className="h-4 w-4 mr-2 text-white/50 group-hover:text-accent transition-colors" />
                  )}
                  <span className="flex-1 truncate">{suggestion as string}</span>
                </button>
              </li>
            );
          }
        })}
      </ul>
      
      {searchQuery && onViewAllResults && (
        <div className="border-t border-white/10">
          <button
            onClick={onViewAllResults}
            className="w-full px-4 py-2 text-left text-sm text-accent hover:bg-white/10 transition-colors"
          >
            Ver tudo "{searchQuery}"
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
