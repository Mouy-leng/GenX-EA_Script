import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Send, MessageCircle, Brain } from 'lucide-react';
import type { SignalTransmission } from '../types';

export function RecentActivity() {
  const [activity, setActivity] = useState<SignalTransmission[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['/api/transmissions'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialData) {
      setActivity(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (lastMessage?.type === 'new_transmission') {
      setActivity(prev => [lastMessage.data, ...prev.slice(0, 19)]);
    }
  }, [lastMessage]);

  const getActivityIcon = (destination: string) => {
    switch (destination) {
      case 'discord':
        return <MessageCircle size={16} className="text-blue-400" />;
      case 'telegram':
        return <Send size={16} className="text-blue-400" />;
      case 'mt45':
        return <Brain size={16} className="text-purple-400" />;
      default:
        return <Send size={16} className="text-gray-400" />;
    }
  };

  const getActivityDescription = (item: SignalTransmission) => {
    switch (item.destination) {
      case 'discord':
        return 'Discord notification sent';
      case 'telegram':
        return 'Telegram signal sent';
      case 'mt45':
        return 'Signal sent to MT4/5 EA';
      default:
        return 'Signal transmitted';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2" size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded loading-shimmer" />
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
          <History className="mr-2" size={20} />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(item.destination)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{getActivityDescription(item)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.status === 'sent' ? 'Successfully transmitted' : 'Transmission failed'}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.sentAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
