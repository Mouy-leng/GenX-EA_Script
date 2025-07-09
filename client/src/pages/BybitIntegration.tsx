import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '../components/Header';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BybitIntegration() {
  const { data: healthData, refetch } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 10000,
  });

  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000,
  });

  const isConnected = healthData?.services?.bybit;

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Bybit Integration"
        subtitle="Real-time cryptocurrency data and WebSocket connections"
      />
      
      <main className="p-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Connection Status</p>
                  <p className={cn("text-2xl font-bold", isConnected ? "text-green-500" : "text-red-500")}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <Wifi size={24} className={isConnected ? "text-green-500" : "text-red-500"} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {isConnected ? 'WebSocket active' : 'WebSocket disconnected'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Streams</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {marketData?.length || 0}
                  </p>
                </div>
                <Activity size={24} className="text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Market data feeds</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">API Status</p>
                  <p className="text-2xl font-bold text-green-500">Healthy</p>
                </div>
                <AlertCircle size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">All endpoints responding</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">WebSocket URL</label>
                  <p className="text-sm text-muted-foreground">wss://stream.bybit.com/v5/public/spot</p>
                </div>
                <div>
                  <label className="text-sm font-medium">API Base URL</label>
                  <p className="text-sm text-muted-foreground">https://api.bybit.com</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subscribed Symbols</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'BNBUSDT'].map(symbol => (
                    <Badge key={symbol} variant="secondary">{symbol}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Status
                </Button>
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Data Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Live Market Data</CardTitle>
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
                    <th className="pb-3">High</th>
                    <th className="pb-3">Low</th>
                    <th className="pb-3">Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData?.map((item: any) => (
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
                      <td className="py-3">${item.high24h.toFixed(4)}</td>
                      <td className="py-3">${item.low24h.toFixed(4)}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
