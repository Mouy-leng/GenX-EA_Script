import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketData } from '../types';

export function RealTimeDataTable() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const { lastMessage } = useWebSocket('/ws');

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialData) {
      setMarketData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (lastMessage?.type === 'market_data') {
      setMarketData(prev => {
        const newData = [...prev];
        const index = newData.findIndex(item => item.symbol === lastMessage.data.symbol);
        
        if (index !== -1) {
          newData[index] = lastMessage.data;
        } else {
          newData.push(lastMessage.data);
        }
        
        return newData;
      });
    }
  }, [lastMessage]);

  const getSignalBadge = (symbol: string, change: number) => {
    if (change > 2) {
      return <Badge className="signal-buy">BUY</Badge>;
    } else if (change < -2) {
      return <Badge className="signal-sell">SELL</Badge>;
    } else {
      return <Badge className="signal-hold">HOLD</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2" size={20} />
            Real-time Market Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded loading-shimmer" />
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
          <Activity className="mr-2" size={20} />
          Real-time Market Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground text-sm">
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">Volume</th>
                <th className="pb-3">Signal</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((item) => (
                <tr key={item.symbol} className="border-b border-border">
                  <td className="py-3 font-medium">{item.symbol}</td>
                  <td className="py-3">${item.price.toFixed(4)}</td>
                  <td className={cn(
                    "py-3",
                    item.changePercent24h > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {item.changePercent24h > 0 ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                  </td>
                  <td className="py-3">{(item.volume / 1000).toFixed(0)}K</td>
                  <td className="py-3">
                    {getSignalBadge(item.symbol, item.changePercent24h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
