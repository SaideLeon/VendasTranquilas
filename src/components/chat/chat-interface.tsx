'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, RefreshCw, Loader2, Bot, User, Sparkles, Mic } from 'lucide-react';
import { ChatAPI } from '@/lib/endpoints';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus no input após enviar mensagem
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    console.log('Enviando mensagem:', { message: input, conversationId: conversationId ?? undefined });

    try {
      const { data } = await ChatAPI.sendMessage(input, conversationId ?? undefined);
      
      console.log('Resposta recebida:', data);

      const aiMessage: Message = {
        sender: 'ai',
        text: data.response,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setConversationId(data.conversationId);
    } catch (error: any) {
      console.error('Erro na resposta:', error);

      const errorMessage = error.response?.data?.message || 'Falha ao comunicar com o assistente.';
      toast({
        title: 'Erro no Chat',
        description: errorMessage,
        variant: 'destructive',
      });
      // Remove a mensagem do usuário que falhou
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: 'Atualizando dados...',
      description: 'O assistente está atualizando suas informações.',
    });
    try {
      await ChatAPI.refreshData();
      toast({
        title: 'Dados Atualizados',
        description: 'O assistente agora tem suas informações mais recentes.',
      });
    } catch (error: any) {
       const errorMessage = error.response?.data?.message || 'Não foi possível atualizar os dados.';
       toast({
        title: 'Erro ao Atualizar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-10rem)] w-full flex flex-col shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="relative">
              <Bot className="h-6 w-6" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-primary animate-pulse" />
            </div>
            Assistente IA
          </CardTitle>
          <CardDescription className="text-sm">
            Converse sobre suas finanças e obtenha insights personalizados
          </CardDescription>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
          <div className="p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="relative mb-4">
                  <Bot className="h-16 w-16 text-muted-foreground/50" />
                  <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Como posso ajudar?</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Faça perguntas sobre suas finanças, despesas ou receitas. Estou aqui para ajudar!
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm [&_*]:text-primary-foreground'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  <div className={cn(
                    "prose prose-sm max-w-none [&_p]:leading-relaxed",
                    message.sender === 'user' ? 'prose-invert [&_*]:text-primary-foreground' : ''
                  )}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4">{children}</ol>,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className={cn(
                        "text-xs flex items-center gap-1",
                        message.sender === 'user' 
                          ? 'text-primary-foreground/80' 
                          : 'text-muted-foreground/80'
                      )}>
                        <span className="font-medium">Fontes:</span>
                        <span>{message.sources.join(', ')}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                {message.sender === 'user' && (
                  <Avatar className="h-9 w-9 border-2 border-muted">
                    <AvatarFallback className="bg-muted-foreground/10">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Pensando...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </CardContent>

      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                toast({
                  title: 'Em breve!',
                  description: 'A funcionalidade de áudio será implementada em breve.',
                });
              }}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 shrink-0"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
              <span className="sr-only">Gravar áudio</span>
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem... (ex: Quanto gastei este mês?)"
              disabled={isLoading}
              className="flex-1 rounded-full px-4"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-full h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}