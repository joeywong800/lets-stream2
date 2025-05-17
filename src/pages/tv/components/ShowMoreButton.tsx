
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShowMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const ShowMoreButton = ({ onClick, isLoading }: ShowMoreButtonProps) => {
  return (
    <div className="flex justify-center my-8">
      <Button
        onClick={onClick}
        variant="outline"
        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
      >
        {isLoading ? (
          <>Loading...</>
        ) : (
          <>Mostrar Mais <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
        )}
      </Button>
    </div>
  );
};

export default ShowMoreButton;
