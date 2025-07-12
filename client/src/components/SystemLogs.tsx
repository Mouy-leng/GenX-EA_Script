import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SystemLog } from '../types';

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialData) {
      setLogs(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (lastMessage?.type === 'new_log') {
      setLogs(prev => [lastMessage.data, ...prev.slice(0, 19)]);
    }
  }, [lastMessage]);

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'log-info';
      case 'DEBUG':
        return 'log-debug';
      case 'WARN':
        return 'log-warn';
      case 'ERROR':
        return 'log-error';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" size={20} />
            System Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded loading-shimmer" />
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
          <FileText className="mr-2" size={20} />
          System Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm font-mono max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No logs available</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 log-entry">
                <span className="text-muted-foreground text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn("text-xs", getLogLevelClass(log.level))}>
                  [{log.level}]
                </span>
                <span className="text-foreground flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
