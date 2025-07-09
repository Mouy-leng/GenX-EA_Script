import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '../components/Header';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Users,
  MessageSquare,
  Bot,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

export default function TelegramBot() {
  const [testMessage, setTestMessage] = useState('');
  const { toast } = useToast();

  const { data: healthData } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 10000,
  });

  const { data: botStatuses } = useQuery({
    queryKey: ['/api/bot-status'],
    refetchInterval: 10000,
  });

  const { data: transmissions } = useQuery({
    queryKey: ['/api/transmissions'],
    refetchInterval: 5000,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 5000,
  });

  const testBotMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/telegram/test', {
        method: 'POST',
        body: JSON.stringify({ message: testMessage }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Test message sent successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send test message',
        variant: 'destructive',
      });
    },
  });

  const telegramBot = botStatuses?.find((bot: any) => bot.botName === 'telegram');
  const telegramTransmissions = transmissions?.filter((t: any) => t.destination === 'telegram') || [];
  const isOnline = healthData?.services?.telegram;

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Telegram Bot"
        subtitle="Private trading signal notifications and alerts"
      />
      
      <main className="p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Bot Status</p>
                  <p className={cn("text-2xl font-bold", isOnline ? "text-green-500" : "text-red-500")}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
                <Phone size={24} className={isOnline ? "text-green-500" : "text-red-500"} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {telegramBot?.status || 'Unknown'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Messages Sent</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {telegramTransmissions.length}
                  </p>
                </div>
                <MessageSquare size={24} className="text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total signals sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-500">
                    {telegramTransmissions.length > 0 
                      ? `${Math.round((telegramTransmissions.filter((t: any) => t.status === 'sent').length / telegramTransmissions.length) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Successful deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Last Activity</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {telegramBot?.lastHeartbeat 
                      ? new Date(telegramBot.lastHeartbeat).toLocaleTimeString()
                      : 'Never'
                    }
                  </p>
                </div>
                <Users size={24} className="text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Last heartbeat</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" size={20} />
              Bot Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bot Token Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-sm">
                      {process.env.TELEGRAM_BOT_TOKEN ? 'Token configured' : 'Token missing'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Chat Configuration</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", process.env.TELEGRAM_CHAT_ID ? "bg-green-500" : "bg-yellow-500")} />
                    <span className="text-sm">
                      {process.env.TELEGRAM_CHAT_ID ? 'Chat ID configured' : 'Default chat'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Notification Settings</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">Trading Signals</Badge>
                  <Badge variant="secondary">Market Alerts</Badge>
                  <Badge variant="secondary">System Status</Badge>
                  <Badge variant="secondary">Error Reports</Badge>
                </div>
              </div>

              <div>
                <Label>Message Format</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>• HTML formatted messages</p>
                  <p>• Emoji indicators for signal types</p>
                  <p>• Inline keyboards for interaction</p>
                  <p>• Real-time delivery status</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2" size={20} />
              Test Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testMessage">Message Content</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Enter test message to send to Telegram..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={() => testBotMutation.mutate()}
                disabled={!testMessage.trim() || testBotMutation.isPending || !isOnline}
              >
                <Send size={16} className="mr-2" />
                {testBotMutation.isPending ? 'Sending...' : 'Send Test Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Signals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Recent Signal Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground text-sm">
                    <th className="pb-3">Signal ID</th>
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Signal Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Response</th>
                    <th className="pb-3">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {telegramTransmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No Telegram notifications sent yet
                      </td>
                    </tr>
                  ) : (
                    telegramTransmissions.map((transmission: any) => {
                      const signal = signals?.find((s: any) => s.id === transmission.signalId);
                      return (
                        <tr key={transmission.id} className="border-b border-border">
                          <td className="py-3 font-medium">#{transmission.signalId}</td>
                          <td className="py-3">{signal?.symbol || 'Unknown'}</td>
                          <td className="py-3">
                            <Badge className={cn(
                              signal?.signal === 'BUY' ? 'signal-buy' :
                              signal?.signal === 'SELL' ? 'signal-sell' :
                              'signal-hold'
                            )}>
                              {signal?.signal || 'Unknown'}
                            </Badge>
                          </td>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bot Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Telegram Bot Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Available Commands</h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">/start</code>
                      <span className="text-sm text-muted-foreground">Start bot interaction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">/status</code>
                      <span className="text-sm text-muted-foreground">Check system status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">/signals</code>
                      <span className="text-sm text-muted-foreground">View recent signals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">/help</code>
                      <span className="text-sm text-muted-foreground">Show help message</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Signal Format</h4>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>🟢 <strong>BUY Signal Format:</strong></p>
                    <p className="ml-4">Symbol, Entry Price, Target, Stop Loss</p>
                    <p className="mt-2">🔴 <strong>SELL Signal Format:</strong></p>
                    <p className="ml-4">Symbol, Entry Price, Target, Stop Loss</p>
                    <p className="mt-2">🟡 <strong>HOLD Signal Format:</strong></p>
                    <p className="ml-4">Symbol, Current Price, Analysis</p>
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
