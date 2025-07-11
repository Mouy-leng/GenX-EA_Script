import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useEffect } from "react";

interface TopBarProps {
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
}

export default function TopBar({ selectedPlatform, onPlatformChange }: TopBarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { marketPrices } = useMarketData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketSentiment, setMarketSentiment] = useState<'bullish' | 'bearish' | 'neutral'>('neutral');

  const { data: marketStatus, isLoading } = useQuery({
    queryKey: ['/api/market/status'],
    refetchInterval: 30000,
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate market sentiment based on price changes
  useEffect(() => {
    if (marketPrices.length > 0) {
      const positiveChanges = marketPrices.filter(p => p.changePercent > 0).length;
      const totalPairs = marketPrices.length;
      const positiveRatio = positiveChanges / totalPairs;
      
      if (positiveRatio > 0.6) {
        setMarketSentiment('bullish');
      } else if (positiveRatio < 0.4) {
        setMarketSentiment('bearish');
      } else {
        setMarketSentiment('neutral');
      }
    }
  }, [marketPrices]);

  const syncDataMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/market/sync'),
    onSuccess: () => {
      toast({
        title: "Data Synced",
        description: "Market data has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/market'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync market data",
        variant: "destructive",
      });
    },
  });

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSentimentColor = () => {
    switch (marketSentiment) {
      case 'bullish': return 'text-success';
      case 'bearish': return 'text-error';
      default: return 'text-warning';
    }
  };

  const getSentimentIcon = () => {
    switch (marketSentiment) {
      case 'bullish': return 'fa-arrow-trend-up';
      case 'bearish': return 'fa-arrow-trend-down';
      default: return 'fa-minus';
    }
  };

  const getOverallMarketChange = () => {
    if (marketPrices.length === 0) return 0;
    const avgChange = marketPrices.reduce((sum, p) => sum + p.changePercent, 0) / marketPrices.length;
    return avgChange;
  };

  return (
    <div className="bg-surface border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-semibold">Trading Dashboard</h2>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-textSecondary">Market Open</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <i className={`fas ${getSentimentIcon()} ${getSentimentColor()}`}></i>
              <span className="text-sm text-textSecondary">Market Sentiment:</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getSentimentColor()} border-current`}
              >
                {marketSentiment.charAt(0).toUpperCase() + marketSentiment.slice(1)}
              </Badge>
              <span className={`text-xs font-mono ${getOverallMarketChange() >= 0 ? 'text-success' : 'text-error'}`}>
                {getOverallMarketChange() >= 0 ? '+' : ''}{getOverallMarketChange().toFixed(2)}%
              </span>
            </div>
            
            <div className="text-sm text-textSecondary">
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock text-xs"></i>
                <span>Live Time:</span>
                <span className="text-textPrimary font-mono font-medium">{getCurrentTime()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-textSecondary">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <span>WebSocket</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
              <span>API</span>
            </div>
          </div>
          
          <Select value={selectedPlatform} onValueChange={onPlatformChange}>
            <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bybit">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Bybit</span>
                </div>
              </SelectItem>
              <SelectItem value="Capital.com">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Capital.com</span>
                </div>
              </SelectItem>
              <SelectItem value="MT4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>MT4</span>
                </div>
              </SelectItem>
              <SelectItem value="MT5">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>MT5</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => syncDataMutation.mutate()}
            disabled={syncDataMutation.isPending}
            className="bg-primary hover:bg-blue-600 transition-all duration-200"
          >
            <i className={`fas fa-sync-alt mr-2 ${syncDataMutation.isPending ? 'fa-spin' : ''}`}></i>
            {syncDataMutation.isPending ? "Syncing..." : "Sync Data"}
          </Button>
        </div>
      </div>
    </div>
  );
}