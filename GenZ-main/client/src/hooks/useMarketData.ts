import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export function useMarketData(symbol?: string) {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [latestPrice, setLatestPrice] = useState<MarketPrice | null>(null);
  const { lastMessage, isConnected } = useWebSocket();

  // Initialize with default prices
  useEffect(() => {
    const defaultPrices: MarketPrice[] = [
      { symbol: "EURUSD", price: 1.0876, change: 0.0031, changePercent: 0.28, timestamp: new Date() },
      { symbol: "GBPUSD", price: 1.2634, change: -0.0019, changePercent: -0.15, timestamp: new Date() },
      { symbol: "USDJPY", price: 149.85, change: 0.18, changePercent: 0.12, timestamp: new Date() },
      { symbol: "XAUUSD", price: 1948.67, change: 17.32, changePercent: 0.89, timestamp: new Date() },
      { symbol: "XAGUSD", price: 23.45, change: 0.12, changePercent: 0.51, timestamp: new Date() },
      { symbol: "USDCAD", price: 1.3721, change: -0.0045, changePercent: -0.33, timestamp: new Date() },
      { symbol: "AUDUSD", price: 0.6587, change: 0.0023, changePercent: 0.35, timestamp: new Date() },
      { symbol: "NZDUSD", price: 0.6123, change: -0.0012, changePercent: -0.20, timestamp: new Date() },
    ];
    
    setMarketPrices(defaultPrices);
    
    if (symbol) {
      const symbolPrice = defaultPrices.find(p => p.symbol === symbol);
      if (symbolPrice) {
        setLatestPrice(symbolPrice);
      }
    }
  }, [symbol]);

  // Handle WebSocket market data updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'marketData') {
      const newPrices = lastMessage.data as MarketPrice[];
      if (newPrices && Array.isArray(newPrices)) {
        setMarketPrices(newPrices);
        
        if (symbol) {
          const symbolPrice = newPrices.find(p => p.symbol === symbol);
          if (symbolPrice) {
            setLatestPrice(symbolPrice);
          }
        }
      }
    }
  }, [lastMessage, symbol]);

  // Simulate price updates when WebSocket is not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setMarketPrices(prevPrices => 
          prevPrices.map(price => {
            const changePercent = (Math.random() - 0.5) * 0.5; // 0.5% max change
            const change = (price.price * changePercent) / 100;
            const newPrice = price.price + change;
            
            return {
              ...price,
              price: newPrice,
              change,
              changePercent,
              timestamp: new Date()
            };
          })
        );
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Update latest price when market prices change and symbol is specified
  useEffect(() => {
    if (symbol && marketPrices.length > 0) {
      const symbolPrice = marketPrices.find(p => p.symbol === symbol);
      if (symbolPrice) {
        setLatestPrice(symbolPrice);
      }
    }
  }, [marketPrices, symbol]);

  const getSymbolPrice = (symbolName: string): MarketPrice | undefined => {
    return marketPrices.find(p => p.symbol === symbolName);
  };

  const subscribeToPriceUpdates = (symbols: string[]) => {
    // In a real implementation, this would send a subscription message to the WebSocket
    console.log('Subscribing to price updates for:', symbols);
  };

  return {
    marketPrices,
    latestPrice,
    isConnected,
    getSymbolPrice,
    subscribeToPriceUpdates
  };
}
