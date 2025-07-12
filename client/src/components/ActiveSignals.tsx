import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TradingSignal } from '../types';

export function ActiveSignals() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialData) {
      setSignals(initialData.filter((signal: TradingSignal) => signal.status === 'pending'));
    }
  }, [initialData]);

  useEffect(() => {
    if (lastMessage?.type === 'new_signal') {
      setSignals(prev => [lastMessage.data, ...prev]);
    }
  }, [lastMessage]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'signal-buy';
      case 'SELL':
        return 'signal-sell';
      default:
        return 'signal-hold';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Signal className="mr-2" size={20} />
            Active Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded loading-shimmer" />
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
          <Signal className="mr-2" size={20} />
          Active Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active signals</p>
          ) : (
            signals.map((signal) => (
              <div key={signal.id} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{signal.symbol}</span>
                  <Badge className={getSignalColor(signal.signal)}>
                    {signal.signal}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Entry: ${signal.entryPrice.toFixed(4)}</p>
                  {signal.targetPrice && (
                    <p>TP: ${signal.targetPrice.toFixed(4)}</p>
                  )}
                  {signal.stopLoss && (
                    <p>SL: ${signal.stopLoss.toFixed(4)}</p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(signal.createdAt).toLocaleTimeString()}
                  </span>
                  <span className={cn("text-xs", getStatusColor(signal.status))}>
                    {signal.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
