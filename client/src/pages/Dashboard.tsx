
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, Bot } from 'lucide-react';

interface PortfolioData {
  totalBalance: number;
  totalPnl: number;
  activePositions: number;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

function Dashboard() {
  const { data: portfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/portfolio');
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      return response.json();
    }
  });

  const { data: bots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const response = await fetch('/api/bots');
      if (!response.ok) throw new Error('Failed to fetch bots');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">GenZ Trading Bot Pro</h1>
          <p className="text-muted-foreground">AI-Powered Trading Dashboard</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Activity className="w-4 h-4 mr-1" />
          Live
        </Badge>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolio?.totalBalance?.toLocaleString() || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              +{portfolio?.performance?.daily || 0}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {(portfolio?.totalPnl || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (portfolio?.totalPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${portfolio?.totalPnl?.toLocaleString() || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Unrealized P&L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio?.activePositions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Open trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bots?.filter((bot: any) => bot.status === 'running').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {bots?.length || 0} total bots
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Bots Section */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Bots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots?.map((bot: any) => (
              <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{bot.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Strategy: {bot.strategy} | Symbols: {bot.symbols?.join(', ')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={bot.status === 'running' ? 'default' : 'secondary'}>
                    {bot.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant={bot.status === 'running' ? 'destructive' : 'default'}
                    onClick={() => {
                      const action = bot.status === 'running' ? 'stop' : 'start';
                      fetch(`/api/bots/${bot.id}/${action}`, { method: 'POST' });
                    }}
                  >
                    {bot.status === 'running' ? 'Stop' : 'Start'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        GenZ Trading Bot Pro - Built for Replit Deployment
      </div>
    </div>
  );
}

export default Dashboard;
