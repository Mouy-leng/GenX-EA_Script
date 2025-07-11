import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useEffect, useRef } from "react";

interface TradingChartProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

export default function TradingChart({ symbol, onSymbolChange }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("1H");
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const { latestPrice } = useMarketData(symbol);
  const previousPriceRef = useRef<number | null>(null);

  const { data: candleData, isLoading } = useQuery({
    queryKey: ['/api/market', symbol, 'candles', { timeframe: timeframe.toLowerCase() }],
    refetchInterval: 30000,
  });

  const timeframes = ["1H", "4H", "1D", "1W"];
  
  const currentPrice = latestPrice?.price || 1.0876;
  const priceChange = latestPrice?.change || 0.0031;
  const isPositive = priceChange >= 0;

  // Track price changes for visual effects
  useEffect(() => {
    if (previousPriceRef.current !== null && previousPriceRef.current !== currentPrice) {
      const direction = currentPrice > previousPriceRef.current ? 'up' : 'down';
      setPriceDirection(direction);
      
      // Reset direction after animation
      setTimeout(() => {
        setPriceDirection('neutral');
      }, 1500);
    }
    previousPriceRef.current = currentPrice;
  }, [currentPrice]);

  const getPriceDisplayClass = () => {
    let baseClass = "text-3xl font-mono font-bold transition-all duration-500";
    
    if (priceDirection === 'up') {
      baseClass += " price-flash-up";
    } else if (priceDirection === 'down') {
      baseClass += " price-flash-down";
    }
    
    return baseClass;
  };

  const getChangeDisplayClass = () => {
    let baseClass = `flex items-center space-x-1 transition-all duration-500 ${isPositive ? 'text-success' : 'text-error'}`;
    
    if (priceDirection !== 'neutral') {
      baseClass += " scale-110";
    }
    
    return baseClass;
  };

  return (
    <Card className="bg-surface border-gray-700 h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{symbol}</h3>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-success' : 'bg-error'} animate-pulse`}></div>
              <span className="text-xs text-textSecondary">LIVE</span>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className={getPriceDisplayClass()}>
              {currentPrice.toFixed(4)}
            </span>
            <div className={getChangeDisplayClass()}>
              <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs`}></i>
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{priceChange.toFixed(4)}
              </span>
              <span className="text-xs opacity-75">
                ({isPositive ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                size="sm"
                variant="ghost"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  timeframe === tf 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'hover:bg-gray-600 text-textSecondary'
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-700">
            <i className="fas fa-expand text-textSecondary"></i>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="h-80">
        {isLoading ? (
          <div className="h-full bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-textSecondary">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="h-full bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-600"></div>
                ))}
              </div>
            </div>
            
            <div className="text-center z-10">
              <i className="fas fa-chart-line text-4xl text-primary mb-4 animate-pulse"></i>
              <p className="text-textSecondary text-lg font-medium">Real-time Chart Integration</p>
              <p className="text-xs text-textSecondary mt-2">TradingView / Chart.js Implementation</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <Badge variant="outline" className="text-xs mb-2 border-primary text-primary">
                    Current Price
                  </Badge>
                  <div className="text-lg font-mono font-bold">
                    {currentPrice.toFixed(4)}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <Badge variant="outline" className="text-xs mb-2 border-secondary text-secondary">
                    Timeframe
                  </Badge>
                  <div className="text-lg font-medium">
                    {timeframe}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <Badge variant="outline" className="text-xs mb-2 border-accent text-accent">
                    Data Points
                  </Badge>
                  <div className="text-lg font-medium">
                    {candleData?.length || 0}
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <Badge variant="outline" className={`text-xs mb-2 ${isPositive ? 'border-success text-success' : 'border-error text-error'}`}>
                    24h Change
                  </Badge>
                  <div className={`text-lg font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                    {isPositive ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}