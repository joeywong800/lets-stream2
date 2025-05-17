import React, { useState } from 'react';
import { ThumbsUp, Star } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/contexts/chatbot-context';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useChatbot } from '@/contexts/chatbot-context';
import { extractMediaItems, createMediaObjects } from '@/utils/chatbot-utils';
import RecommendationCard from './RecommendationCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { rateRecommendation } = useChatbot();
  const [showRating, setShowRating] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  
  // Extract media items from the message
  const parsedItems = !message.isUser ? extractMediaItems(message.text) : [];
  const mediaItems = createMediaObjects(parsedItems);
  
  // Extract initial greeting or explanation text
  const getIntroText = (text: string): string => {
    const numberedItemIndex = text.search(/\d+\.\s+/);
    const titlePatternIndex = text.search(/(?:\*\*)?([^*\n(]+)(?:\*\*)?\s*\((\d{4}(?:-\d{4}|\s*-\s*Present)?)\)/);
    
    let cutoffIndex = text.length;
    if (numberedItemIndex > 0) cutoffIndex = numberedItemIndex;
    if (titlePatternIndex > 0 && titlePatternIndex < cutoffIndex) cutoffIndex = titlePatternIndex;
    
    return text.substring(0, cutoffIndex).trim();
  };

  const handleRate = (rating: number) => {
    rateRecommendation(message.id, rating);
    setShowRating(false);
    setHasReacted(true);
  };

  // Pass the expected TMDB ID (from parsedItems) to RecommendationCard for validation
  if (!message.isUser && mediaItems.length > 0) {
    const introText = getIntroText(message.text);
    return (
      <div className="flex flex-col space-y-4 mb-4">
        {introText && (
          <div className="max-w-[90%] p-3 bg-muted text-foreground rounded-lg rounded-bl-none">
            {introText}
          </div>
        )}
        <motion.div 
          className="grid gap-4 ml-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, staggerChildren: 0.1 }}
        >
          {mediaItems.map((media, index) => (
            <motion.div
              key={`${media.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RecommendationCard 
                media={media}
                genres={parsedItems[index]?.genres}
                rating={parsedItems[index]?.rating}
                expectedTmdbId={parsedItems[index]?.tmdbId}
              />
            </motion.div>
          ))}
        </motion.div>
        
        <div className="flex justify-end">
          {showRating ? (
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => handleRate(rating)}
                >
                  <Star className={`h-4 w-4 ${rating <= 3 ? 'text-amber-400 fill-amber-400' : 'text-amber-400'}`} />
                </Button>
              ))}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs py-1 px-2 h-auto"
              onClick={() => setShowRating(true)}
              disabled={hasReacted}
            >
              {hasReacted ? (
                <span className="flex items-center">
                  <ThumbsUp className="h-3 w-3 mr-1" /> 
                  Avaliado
                </span>
              ) : (
                'Avalia isto'
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Regular message rendering
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
