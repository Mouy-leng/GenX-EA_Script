import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TradingBots() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBot, setNewBot] = useState({
    name: "",
    strategy: "",
    symbol: "",
    accountId: 1,
    config: {}
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bots, isLoading } = useQuery({
    queryKey: ['/api/bots'],
    refetchInterval: 10000,
  });

  const { data: accounts } = useQuery({
    queryKey: ['/api/accounts'],
  });

  const createBotMutation = useMutation({
    mutationFn: (botData: any) => apiRequest('POST', '/api/bots', botData),
    onSuccess: () => {
      toast({
        title: "Bot Created",
        description: "Trading bot has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      setIsCreateDialogOpen(false);
      setNewBot({ name: "", strategy: "", symbol: "", accountId: 1, config: {} });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create trading bot",
        variant: "destructive",
      });
    },
  });

  const manageBotMutation = useMutation({
    mutationFn: ({ botId, action }: { botId: number; action: string }) => 
      apiRequest('POST', `/api/bots/${botId}/${action}`),
    onSuccess: (_, { action }) => {
      toast({
        title: "Bot Updated",
        description: `Trading bot has been ${action}ed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to manage trading bot",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-success';
      case 'paused':
        return 'text-warning';
      case 'stopped':
        return 'text-error';
      default:
        return 'text-textSecondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return 'fa-play';
      case 'paused':
        return 'fa-pause';
      case 'stopped':
        return 'fa-stop';
      default:
        return 'fa-question';
    }
  };

  if (isLoading) {
    return (
      <div className="col-span-6 bg-surface rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Trading Bots</h3>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-6 bg-surface rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Trading Bots</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-600">
              <i className="fas fa-plus mr-2"></i>New Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle>Create Trading Bot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-textSecondary">Bot Name</label>
                <Input
                  value={newBot.name}
                  onChange={(e) => setNewBot(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Scalping Bot"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textSecondary">Strategy</label>
                <Select 
                  value={newBot.strategy} 
                  onValueChange={(value) => setNewBot(prev => ({ ...prev, strategy: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scalping">Scalping</SelectItem>
                    <SelectItem value="grid">Grid Trading</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="arbitrage">Arbitrage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-textSecondary">Symbol</label>
                <Input
                  value={newBot.symbol}
                  onChange={(e) => setNewBot(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="e.g., EURUSD"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textSecondary">Trading Account</label>
                <Select 
                  value={newBot.accountId.toString()} 
                  onValueChange={(value) => setNewBot(prev => ({ ...prev, accountId: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.platform} - {account.accountId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createBotMutation.mutate(newBot)}
                disabled={!newBot.name || !newBot.strategy || !newBot.symbol || createBotMutation.isPending}
                className="w-full bg-primary hover:bg-blue-600"
              >
                Create Bot
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {!bots || bots.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">
            <i className="fas fa-robot text-3xl mb-2"></i>
            <p>No trading bots configured</p>
            <p className="text-xs mt-1">Create your first bot to start automated trading</p>
          </div>
        ) : (
          bots.map((bot: any) => {
            const dailyPnL = parseFloat(bot.dailyPnl || "0");
            const winRate = parseFloat(bot.winRate || "0");
            
            return (
              <div key={bot.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`}></div>
                    <h4 className="font-medium">{bot.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {bot.strategy}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bot.status !== 'running' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => manageBotMutation.mutate({ botId: bot.id, action: 'start' })}
                        disabled={manageBotMutation.isPending}
                        className="p-1 h-8 w-8 hover:bg-gray-700"
                      >
                        <i className="fas fa-play text-success"></i>
                      </Button>
                    )}
                    {bot.status === 'running' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => manageBotMutation.mutate({ botId: bot.id, action: 'pause' })}
                        disabled={manageBotMutation.isPending}
                        className="p-1 h-8 w-8 hover:bg-gray-700"
                      >
                        <i className="fas fa-pause text-warning"></i>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => manageBotMutation.mutate({ botId: bot.id, action: 'stop' })}
                      disabled={manageBotMutation.isPending}
                      className="p-1 h-8 w-8 hover:bg-gray-700"
                    >
                      <i className="fas fa-stop text-error"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-8 w-8 hover:bg-gray-700"
                    >
                      <i className="fas fa-cog text-textSecondary"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-textSecondary text-xs">P&L Today</p>
                    <p className={`font-mono ${dailyPnL >= 0 ? 'text-success' : 'text-error'}`}>
                      ${dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-textSecondary text-xs">Trades</p>
                    <p className="font-mono">{bot.tradesCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-textSecondary text-xs">Win Rate</p>
                    <p className="font-mono">{winRate.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary">
                      Symbol: {bot.symbol} | Strategy: {bot.strategy}
                    </span>
                    <span className={`${getStatusColor(bot.status)} flex items-center space-x-1`}>
                      <i className={`fas ${getStatusIcon(bot.status)}`}></i>
                      <span className="capitalize">{bot.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
