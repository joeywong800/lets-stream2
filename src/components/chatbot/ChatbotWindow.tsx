import React, { useRef, useEffect } from 'react';
import { Send, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useChatbot } from '@/contexts/chatbot-context';
import ChatMessage from './ChatMessage';
import Spinner from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const ChatbotWindow: React.FC = () => {
  const { isOpen, messages, isLoading, sendMessage, searchForMedia, closeChatbot } = useChatbot();
  const [input, setInput] = React.useState('');
  const [isSearchMode, setIsSearchMode] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim()) {
      if (isSearchMode) {
        searchForMedia(input);
      } else {
        sendMessage(input);
      }
      setInput('');
    }
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "fixed bottom-20 right-4 w-[380px] h-[520px] z-50",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "shadow-2xl rounded-xl border border-border/40",
      "transition-all duration-200 ease-in-out",
      "flex flex-col"
    )}>
      <CardHeader className="pb-2 border-b border-border/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Bad Bot.
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeChatbot}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-2">
             {/*<div className="space-y-2">
              <p className="text-lg font-semibold text-primary">Welcome to CineMate! 🎬</p> 
           <p className="text-sm text-muted-foreground">Posso recomendar filmes e séries $ animes adaptados ao teu gosto ou ajudar-te a descobrir algo novo.</p>
            </div>*/}
            
            <div className="w-full space-y-2">
              <p className="text-sm font-medium">Com o que te posso ajudar:</p>
              <ul className="text-left text-sm list-none space-y-2">
                {[
                  "Recomendações na base do humor",
                  "Pesquisa por Tendências e lançamentos",
                  "Adiciona filmes e séries a tua lista pra assistir depois",
                  "Acompanha o teu histórico de assistir",
                  "Pesquisas avançadas: Ano, Gênero e Classificação"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Exemplos:</p>
              <div className="space-y-1.5">
                {[
                  "Sugere-me um filme de comédia para o fim de semana",
                  "Mostra me os filmes mais assistidos da semana",
                  "Quero assistir filmes de adolescentes dos 2000"
                ].map((text, i) => (
                  <p key={i} className="text-xs italic text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
                    "{text}"
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-border/10 p-4">
         <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={toggleSearchMode}
            className={cn(
              "transition-colors duration-200",
              isSearchMode ? "text-primary bg-primary/10" : "hover:bg-primary/10"
            )}
          >
            
          </Button>
          
         <Input
            ref={inputRef}
            placeholder={isSearchMode ? "Search for movies or shows..." : "Escreve aqui"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(
              "flex-1 transition-all duration-200",
              "bg-muted/40 border-muted-foreground/20",
              "focus:ring-1 focus:ring-primary/30 focus:border-primary/30",
              "placeholder:text-muted-foreground/50"
            )}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "bg-primary/90 hover:bg-primary transition-colors",
              "disabled:bg-muted disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatbotWindow;
