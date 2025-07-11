import axios from "axios";
import { storage } from "../storage.js";
import { type InsertMarketData } from "../../shared/schema.js";

export interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface CandlestickData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataService {
  private alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.AV_API_KEY || "";
  private fredKey = process.env.FRED_API_KEY || "";

  async getForexData(symbol: string): Promise<MarketPrice | null> {
    if (!this.alphaVantageKey) {
      console.warn("Alpha Vantage API key not configured, using mock data");
      return this.generateMockPrice(symbol, this.getBasePrice(symbol));
    }

    try {
      const fromCurrency = symbol.substring(0, 3);
      const toCurrency = symbol.substring(3, 6);
      
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: fromCurrency,
          to_currency: toCurrency,
          apikey: this.alphaVantageKey
        }
      });

      const data = response.data['Realtime Currency Exchange Rate'];
      if (!data) {
        console.warn(`No data returned for ${symbol}, using mock data`);
        return this.generateMockPrice(symbol, this.getBasePrice(symbol));
      }

      return {
        symbol,
        price: parseFloat(data['5. Exchange Rate']),
        change: 0, // Calculate from previous price
        changePercent: 0,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Failed to fetch forex data for ${symbol}:`, error);
      return this.generateMockPrice(symbol, this.getBasePrice(symbol));
    }
  }

  async getCommodityData(symbol: string): Promise<MarketPrice | null> {
    if (!this.alphaVantageKey) {
      console.warn("Alpha Vantage API key not configured, using mock data");
      return this.generateMockPrice(symbol, this.getBasePrice(symbol));
    }

    try {
      let apiSymbol = symbol;
      if (symbol === 'XAUUSD') apiSymbol = 'GOLD';
      if (symbol === 'XAGUSD') apiSymbol = 'SILVER';
      if (symbol === 'XTIUSD') apiSymbol = 'WTI';

      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: apiSymbol,
          apikey: this.alphaVantageKey
        }
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        console.warn(`No commodity data returned for ${symbol}, using mock data`);
        return this.generateMockPrice(symbol, this.getBasePrice(symbol));
      }

      const latestDate = Object.keys(timeSeries)[0];
      const latestData = timeSeries[latestDate];

      return {
        symbol,
        price: parseFloat(latestData['4. close']),
        change: 0,
        changePercent: 0,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Failed to fetch commodity data for ${symbol}:`, error);
      return this.generateMockPrice(symbol, this.getBasePrice(symbol));
    }
  }

  async getEconomicData(seriesId: string): Promise<any> {
    if (!this.fredKey) {
      console.warn("FRED API key not configured");
      return null;
    }

    try {
      const response = await axios.get(`https://api.stlouisfed.org/fred/series/observations`, {
        params: {
          series_id: seriesId,
          api_key: this.fredKey,
          file_type: 'json',
          limit: 10,
          sort_order: 'desc'
        }
      });

      return response.data.observations;
    } catch (error) {
      console.error(`Failed to fetch economic data for ${seriesId}:`, error);
      return null;
    }
  }

  async getCandlestickData(symbol: string, timeframe: string, limit = 100): Promise<CandlestickData[]> {
    try {
      // First try to get from storage
      const storedData = await storage.getMarketData(symbol, timeframe, limit);
      if (storedData.length > 0) {
        return storedData.map(d => ({
          timestamp: d.timestamp,
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          close: parseFloat(d.close),
          volume: parseFloat(d.volume)
        }));
      }

      // If not in storage and API key available, try external API
      if (this.alphaVantageKey) {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'FX_INTRADAY',
            from_symbol: symbol.substring(0, 3),
            to_symbol: symbol.substring(3, 6),
            interval: this.getAlphaVantageInterval(timeframe),
            apikey: this.alphaVantageKey,
            outputsize: 'compact'
          }
        });

        const timeSeries = response.data[`Time Series (${this.getAlphaVantageInterval(timeframe)})`];
        if (timeSeries) {
          const candlesticks: CandlestickData[] = [];
          const dates = Object.keys(timeSeries).slice(0, limit);

          for (const date of dates) {
            const data = timeSeries[date];
            const candlestick: CandlestickData = {
              timestamp: new Date(date),
              open: parseFloat(data['1. open']),
              high: parseFloat(data['2. high']),
              low: parseFloat(data['3. low']),
              close: parseFloat(data['4. close']),
              volume: parseFloat(data['5. volume'] || '0')
            };
            
            candlesticks.push(candlestick);

            // Store in local storage
            await storage.insertMarketData({
              symbol,
              timeframe,
              timestamp: candlestick.timestamp,
              open: candlestick.open.toString(),
              high: candlestick.high.toString(),
              low: candlestick.low.toString(),
              close: candlestick.close.toString(),
              volume: candlestick.volume.toString()
            });
          }

          return candlesticks.reverse(); // Return oldest first
        }
      }

      // Generate mock data if no API access
      return this.generateMockCandlesticks(symbol, timeframe, limit);
    } catch (error) {
      console.error(`Failed to fetch candlestick data for ${symbol}:`, error);
      return this.generateMockCandlesticks(symbol, timeframe, limit);
    }
  }

  private getAlphaVantageInterval(timeframe: string): string {
    const intervalMap: { [key: string]: string } = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '60min',
      '1d': 'daily'
    };
    return intervalMap[timeframe] || '1min';
  }

  async updateMarketPrices(symbols: string[]): Promise<MarketPrice[]> {
    const prices: MarketPrice[] = [];
    
    for (const symbol of symbols) {
      let price: MarketPrice | null = null;
      
      if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('JPY')) {
        price = await this.getForexData(symbol);
      } else if (symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('XTI')) {
        price = await this.getCommodityData(symbol);
      }
      
      if (price) {
        prices.push(price);
      }
    }
    
    return prices;
  }

  generateMockPrice(symbol: string, basePrice: number): MarketPrice {
    const change = (Math.random() - 0.5) * 0.02 * basePrice; // 2% max change
    const newPrice = basePrice + change;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price: newPrice,
      change,
      changePercent,
      timestamp: new Date()
    };
  }

  private getBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0876,
      'GBPUSD': 1.2634,
      'USDJPY': 149.85,
      'XAUUSD': 1948.67,
      'XAGUSD': 23.45,
      'USDCAD': 1.3721,
      'AUDUSD': 0.6587,
      'NZDUSD': 0.6123
    };
    return basePrices[symbol] || 1.0;
  }

  private generateMockCandlesticks(symbol: string, timeframe: string, limit: number): CandlestickData[] {
    const basePrice = this.getBasePrice(symbol);
    const candlesticks: CandlestickData[] = [];
    let currentPrice = basePrice;
    
    const timeframeMs = this.getTimeframeMs(timeframe);
    const now = new Date();
    
    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * timeframeMs);
      const volatility = basePrice * 0.001; // 0.1% volatility
      
      const open = currentPrice;
      const changeRange = volatility * 2;
      const high = open + Math.random() * changeRange;
      const low = open - Math.random() * changeRange;
      const close = low + Math.random() * (high - low);
      const volume = 1000 + Math.random() * 9000;
      
      candlesticks.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
      
      currentPrice = close;
    }
    
    return candlesticks;
  }

  private getTimeframeMs(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || 60 * 1000;
  }

  getDefaultWatchlistPrices(): MarketPrice[] {
    return [
      this.generateMockPrice('EURUSD', 1.0876),
      this.generateMockPrice('GBPUSD', 1.2634),
      this.generateMockPrice('USDJPY', 149.85),
      this.generateMockPrice('XAUUSD', 1948.67),
      this.generateMockPrice('XAGUSD', 23.45),
      this.generateMockPrice('USDCAD', 1.3721),
      this.generateMockPrice('AUDUSD', 0.6587),
      this.generateMockPrice('NZDUSD', 0.6123)
    ];
  }
}

export const marketDataService = new MarketDataService();