import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageCircle, Send, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BotStatus as BotStatusType } from '../types';

export function BotStatus() {
  const [botStatuses, setBotStatuses] = useState<BotStatusType[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['/api/bot-status'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialData) {
      setBotStatuses(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (lastMessage?.type === 'bot_status') {
      setBotStatuses(prev => {
        const newStatuses = [...prev];
        const index = newStatuses.findIndex(bot => bot.botName === lastMessage.data.botName);
        
        if (index !== -1) {
          newStatuses[index] = lastMessage.data;
        } else {
          newStatuses.push(lastMessage.data);
        }
        
        return newStatuses;
      });
    }
  }, [lastMessage]);

  const getBotIcon = (botName: string) => {
    switch (botName) {
      case 'discord':
        return <MessageCircle size={16} className="text-blue-400" />;
      case 'telegram':
        return <Send size={16} className="text-blue-400" />;
      case 'ai':
        return <Brain size={16} className="text-purple-400" />;
      default:
        return <Bot size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-red-500';
      case 'error':
        return 'text-red-500';
      case 'limited':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-500';
      case 'limited':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2" size={20} />
            Bot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded loading-shimmer" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2" size={20} />
          Bot Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {botStatuses.map((bot) => (
            <div key={bot.botName} className="flex items-center justify-between">
              <div className="flex items-center">
                {getBotIcon(bot.botName)}
                <span className="ml-3 capitalize">{bot.botName} Bot</span>
              </div>
              <div className="flex items-center">
                <div className={cn("w-2 h-2 rounded-full mr-2", getStatusDot(bot.status))} />
                <span className={cn("text-sm capitalize", getStatusColor(bot.status))}>
                  {bot.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
