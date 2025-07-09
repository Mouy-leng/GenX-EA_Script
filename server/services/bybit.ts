import WebSocket from 'ws';
import { storage } from '../storage';
import { createHash, createHmac } from 'crypto';

export class BybitService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.bybit.com';
  private wsUrl = 'wss://stream.bybit.com/v5/public/spot';
  private symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'BNBUSDT'];

  constructor() {
    this.apiKey = process.env.BYBIT_API_KEY || '';
    this.apiSecret = process.env.BYBIT_API_SECRET || '';
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        console.log('Bybit WebSocket connected');
        this.subscribeToTickers();
        this.logSystemEvent('INFO', 'Bybit WebSocket connection established');
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('Bybit WebSocket disconnected');
        this.logSystemEvent('WARN', 'Bybit WebSocket connection lost');
        setTimeout(() => this.initializeWebSocket(), 5000);
      });

      this.ws.on('error', (error) => {
        console.error('Bybit WebSocket error:', error);
        this.logSystemEvent('ERROR', `Bybit WebSocket error: ${error.message}`);
      });
    } catch (error) {
      console.error('Error initializing Bybit WebSocket:', error);
      this.logSystemEvent('ERROR', `Failed to initialize Bybit WebSocket: ${error}`);
    }
  }

  private subscribeToTickers() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscribeMessage = {
      op: 'subscribe',
      args: this.symbols.map(symbol => `tickers.${symbol}`)
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  private async handleMessage(message: any) {
    if (message.topic && message.topic.startsWith('tickers.')) {
      const symbol = message.topic.split('.')[1];
      const data = message.data;
      
      if (data && data.lastPrice) {
        await this.updateMarketData(symbol, data);
      }
    }
  }

  private async updateMarketData(symbol: string, data: any) {
    try {
      await storage.createMarketData({
        symbol,
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume24h || 0),
        change24h: parseFloat(data.price24hChg || 0),
        changePercent24h: parseFloat(data.price24hPcnt || 0) * 100,
        high24h: parseFloat(data.highPrice24h || 0),
        low24h: parseFloat(data.lowPrice24h || 0),
      });
    } catch (error) {
      console.error('Error updating market data:', error);
    }
  }

  private async logSystemEvent(level: string, message: string) {
    try {
      await storage.createSystemLog({
        level,
        message,
        service: 'bybit',
        metadata: null,
      });
    } catch (error) {
      console.error('Error logging system event:', error);
    }
  }

  public async getAccountInfo() {
    try {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature(timestamp, 'GET', '/v5/account/info', '');
      
      const response = await fetch(`${this.baseUrl}/v5/account/info`, {
        headers: {
          'X-BAPI-API-KEY': this.apiKey,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': '5000',
          'X-BAPI-SIGN': signature,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  private generateSignature(timestamp: string, method: string, path: string, params: string): string {
    const message = timestamp + this.apiKey + '5000' + params;
    return createHmac('sha256', this.apiSecret).update(message).digest('hex');
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const bybitService = new BybitService();
