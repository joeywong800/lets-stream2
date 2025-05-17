
import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbot } from '@/contexts/chatbot-context';

const ChatbotButton: React.FC = () => {
  const { isOpen, openChatbot, closeChatbot } = useChatbot();

  return (
    <Button
     style={{ display: 'none' }}
      className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50 flex items-center justify-center"
      onClick={isOpen ? closeChatbot : openChatbot}
      variant="default"
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageSquare className="h-6 w-6" />
      )}
    </Button>
  );
};

export default ChatbotButton;
