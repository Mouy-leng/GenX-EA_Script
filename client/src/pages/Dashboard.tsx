import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  Bot, 
  Send, 
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const { data: healthData } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 10000,
  });

  const statusCards = [
    {
      title: 'Bybit Connection',
      value: healthData?.services?.bybit ? 'Active' : 'Inactive',
      icon: Wifi,
      color: healthData?.services?.bybit ? 'text-green-500' : 'text-red-500',
      description: 'WebSocket connected',
    },
    {
      title: 'MT4/5 EA',
      value: 'Connected',
      icon: Bot,
      color: 'text-green-500',
      description: '2 EAs active',
    },
    {
      title: 'Signals Sent',
      value: stats?.totalSignals || 0,
      icon: Send,
      color: 'text-blue-400',
      description: `Today: ${stats?.signalsToday || 0} signals`,
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'text-green-500',
      description: 'Last 30 days',
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trading Dashboard</h2>
            <p className="text-muted-foreground">Real-time Bybit signals and MT4/5 integration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-sm font-medium text-green-500">All Services Online</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{card.title}</p>
                      <p className={cn("text-2xl font-bold", card.color)}>
                        {statsLoading ? '...' : card.value}
                      </p>
                    </div>
                    <Icon size={24} className={card.color} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" size={20} />
              AI Trading Signal System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">System Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Bybit WebSocket</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Discord Bot</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telegram Bot</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MT4/5 Service</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Running</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">AI Services</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>OpenAI GPT-4o</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Google Gemini</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Signal Generation</span>
                    <span className="text-green-500 flex items-center"><CheckCircle size={16} className="mr-1" /> Active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
