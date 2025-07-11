import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { useMarketData } from "@/hooks/useMarketData";

interface MarketWatchProps {
  onSymbolSelect: (symbol: string) => void;
}

interface PriceChangeState {
  [symbol: string]: {
    lastPrice: number;
    direction: 'up' | 'down' | 'neutral';
    timestamp: number;
  };
}

export default function MarketWatch({ onSymbolSelect }: MarketWatchProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [priceChanges, setPriceChanges] = useState<PriceChangeState>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { marketPrices } = useMarketData();
  const previousPricesRef = useRef<{[symbol: string]: number}>({});

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['/api/market/watchlist'],
    refetchInterval: 10000,
  });

  // Track price changes for visual effects
  useEffect(() => {
    marketPrices.forEach(price => {
      const previousPrice = previousPricesRef.current[price.symbol];
      if (previousPrice !== undefined && previousPrice !== price.price) {
        const direction = price.price > previousPrice ? 'up' : 'down';
        setPriceChanges(prev => ({
          ...prev,
          [price.symbol]: {
            lastPrice: price.price,
            direction,
            timestamp: Date.now()
          }
        }));
        
        // Clear the effect after 2 seconds
        setTimeout(() => {
          setPriceChanges(prev => ({
            ...prev,
            [price.symbol]: {
              ...prev[price.symbol],
              direction: 'neutral'
            }
          }));
        }, 2000);
      }
      previousPricesRef.current[price.symbol] = price.price;
    });
  }, [marketPrices]);

  const addToWatchlistMutation = useMutation({
    mutationFn: (data: { symbol: string; description?: string }) => 
      apiRequest('POST', '/api/market/watchlist', data),
    onSuccess: () => {
      toast({
        title: "Symbol Added",
        description: "Symbol has been added to your watchlist",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/market/watchlist'] });
      setIsAddDialogOpen(false);
      setNewSymbol("");
      setNewDescription("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add symbol to watchlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (symbol: string) => 
      apiRequest('DELETE', `/api/market/watchlist/${symbol}`),
    onSuccess: () => {
      toast({
        title: "Symbol Removed",
        description: "Symbol has been removed from your watchlist",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/market/watchlist'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove symbol from watchlist",
        variant: "destructive",
      });
    },
  });

  const getSymbolPrice = (symbol: string) => {
    return marketPrices.find(p => p.symbol === symbol) || {
      price: 0,
      change: 0,
      changePercent: 0
    };
  };

  const generateSparklineData = (symbol: string) => {
    // Generate mock sparkline data - in real app, this would come from historical data
    const basePrice = getSymbolPrice(symbol).price || 1;
    const points = [];
    let currentPrice = basePrice * 0.999; // Start slightly below current
    
    for (let i = 0; i < 20; i++) {
      const change = (Math.random() - 0.5) * 0.002 * basePrice;
      currentPrice += change;
      points.push(currentPrice);
    }
    
    // Ensure last point matches current price
    points[points.length - 1] = basePrice;
    return points;
  };

  const renderSparkline = (symbol: string) => {
    const data = generateSparklineData(symbol);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const width = 60;
    const height = 20;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    const isPositive = data[data.length - 1] > data[0];
    
    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
          strokeWidth="1.5"
          className="opacity-70"
        />
      </svg>
    );
  };

  const getPriceChangeClass = (symbol: string) => {
    const change = priceChanges[symbol];
    if (!change || change.direction === 'neutral') return '';
    
    return change.direction === 'up' 
      ? 'price-flash-up' 
      : 'price-flash-down';
  };

  const defaultSymbols = [
    { symbol: "EURUSD", description: "Euro/US Dollar" },
    { symbol: "GBPUSD", description: "British Pound/US Dollar" },
    { symbol: "USDJPY", description: "US Dollar/Japanese Yen" },
    { symbol: "XAUUSD", description: "Gold/US Dollar" },
  ];

  const displaySymbols = watchlist && watchlist.length > 0 ? watchlist : defaultSymbols;

  return (
    <Card className="bg-surface border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
          Market Watch
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
              <i className="fas fa-plus mr-1"></i>Add Symbol
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-gray-700">
            <DialogHeader>
              <DialogTitle>Add Symbol to Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-textSecondary">Symbol</label>
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., EURUSD"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textSecondary">Description (Optional)</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g., Euro/US Dollar"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <Button
                onClick={() => addToWatchlistMutation.mutate({
                  symbol: newSymbol,
                  description: newDescription || undefined
                })}
                disabled={!newSymbol || addToWatchlistMutation.isPending}
                className="w-full bg-primary hover:bg-blue-600"
              >
                Add to Watchlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {displaySymbols.map((item: any) => {
          const priceData = getSymbolPrice(item.symbol);
          const isPositive = priceData.changePercent >= 0;
          const priceChangeClass = getPriceChangeClass(item.symbol);
          
          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between py-3 hover:bg-gray-800 rounded px-3 -mx-3 cursor-pointer transition-all duration-200 border-l-2 border-transparent hover:border-primary"
              onClick={() => onSymbolSelect(item.symbol)}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{item.symbol}</p>
                  <div className="flex items-center space-x-2">
                    {renderSparkline(item.symbol)}
                    <div className={`text-right transition-all duration-300 ${priceChangeClass}`}>
                      <p className="font-mono text-sm font-medium">
                        {priceData.price > 0 ? priceData.price.toFixed(4) : "--"}
                      </p>
                      <p className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                        {priceData.changePercent !== 0 ? 
                          `${isPositive ? '+' : ''}${priceData.changePercent.toFixed(2)}%` : 
                          "--"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-textSecondary">{item.description}</p>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-textSecondary">
            <span>Live Data</span>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}