// src/components/chat/chat-interface.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, RefreshCw, Loader2, Bot, User } from 'lucide-react';
import { ChatAPI } from '@/lib/endpoints';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await ChatAPI.sendMessage(input, conversationId ?? undefined);
      const aiMessage: Message = {
        sender: 'ai',
        text: data.response,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setConversationId(data.conversationId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Falha ao comunicar com o assistente.';
      toast({
        title: 'Erro no Chat',
        description: errorMessage,
        variant: 'destructive',
      });
       // remove the user message that failed to get a response
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: 'Atualizando dados...',
      description: 'O assistente está atualizando suas informações. Isso pode levar um momento.',
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
    <Card className="h-[calc(100vh-10rem)] w-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
            <CardTitle className="flex items-center gap-2"><Bot /> Assistente IA</CardTitle>
            <CardDescription>Converse com a IA para obter insights sobre suas finanças.</CardDescription>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="sr-only">Atualizar Dados</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-lg p-3 text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.sources && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      Fonte: {message.sources.join(', ')}
                    </p>
                  )}
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 text-sm flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Pensando...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quanto custa choco?"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
