import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '../components/Header';
import { Badge } from '@/components/ui/badge';
import { Bot, Link, Activity, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MT45Signals() {
  const { data: connections } = useQuery({
    queryKey: ['/api/mt45/connections'],
    refetchInterval: 10000,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 5000,
  });

  const { data: transmissions } = useQuery({
    queryKey: ['/api/transmissions'],
    refetchInterval: 5000,
  });

  const mt45Transmissions = transmissions?.filter((t: any) => t.destination === 'mt45') || [];

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="MT4/5 Expert Advisor Signals"
        subtitle="Real-time signal transmission to MetaTrader platforms"
      />
      
      <main className="p-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Connected EAs</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {connections?.length || 0}
                  </p>
                </div>
                <Bot size={24} className="text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Active connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Signals Sent</p>
                  <p className="text-2xl font-bold text-green-500">
                    {mt45Transmissions.length}
                  </p>
                </div>
                <Activity size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total transmissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Service Status</p>
                  <p className="text-2xl font-bold text-green-500">Active</p>
                </div>
                <AlertCircle size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Listening on port 8080</p>
            </CardContent>
          </Card>
        </div>

        {/* EA Connections */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="mr-2" size={20} />
              Expert Advisor Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connections?.length === 0 ? (
              <div className="text-center py-8">
                <Bot size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No Expert Advisors connected</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure your MT4/5 EA to connect to http://localhost:8080
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections?.map((conn: any) => (
                  <div key={conn.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Bot size={20} className="text-blue-400" />
                      <div>
                        <p className="font-medium">{conn.eaName}</p>
                        <p className="text-sm text-muted-foreground">ID: {conn.connectionId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={cn(
                        conn.status === 'connected' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      )}>
                        {conn.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(conn.lastActivity).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signal Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Signal Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Signal Format</label>
                  <p className="text-sm text-muted-foreground">JSON with entry, target, and stop loss</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Transmission Method</label>
                  <p className="text-sm text-muted-foreground">HTTP REST API polling</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Supported Pairs</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'BNBUSDT'].map(symbol => (
                    <Badge key={symbol} variant="secondary">{symbol}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" size="sm">
                  Test Signal
                </Button>
                <Button variant="outline" size="sm">
                  Download EA Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Signals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signal Transmissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground text-sm">
                    <th className="pb-3">Signal ID</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Response</th>
                    <th className="pb-3">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {mt45Transmissions.map((transmission: any) => (
                    <tr key={transmission.id} className="border-b border-border">
                      <td className="py-3 font-medium">#{transmission.signalId}</td>
                      <td className="py-3">{transmission.destinationId || 'All EAs'}</td>
                      <td className="py-3">
                        <Badge className={cn(
                          transmission.status === 'sent' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        )}>
                          {transmission.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {transmission.response || 'No response'}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(transmission.sentAt).toLocaleString()}
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
