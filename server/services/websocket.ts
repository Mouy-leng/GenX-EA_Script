import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from '../storage';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected to WebSocket');
      this.clients.add(ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial data
      this.sendInitialData(ws);
    });
  }

  private async handleMessage(ws: WebSocket, data: any) {
    switch (data.type) {
      case 'subscribe':
        // Handle subscription requests
        break;
      case 'unsubscribe':
        // Handle unsubscription requests
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const [marketData, signals, logs, stats] = await Promise.all([
        storage.getLatestMarketData(),
        storage.getTradingSignals(10),
        storage.getSystemLogs(20),
        storage.getDashboardStats(),
      ]);

      ws.send(JSON.stringify({
        type: 'initial_data',
        data: {
          marketData,
          signals,
          logs,
          stats,
        },
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  public broadcastMarketData(data: any) {
    this.broadcast({
      type: 'market_data',
      data,
    });
  }

  public broadcastSignal(signal: any) {
    this.broadcast({
      type: 'new_signal',
      data: signal,
    });
  }

  public broadcastLog(log: any) {
    this.broadcast({
      type: 'new_log',
      data: log,
    });
  }

  public broadcastBotStatus(status: any) {
    this.broadcast({
      type: 'bot_status',
      data: status,
    });
  }

  private broadcast(message: any) {
    const messageString = JSON.stringify(message);
    
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageString);
      }
    });
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }
}

export let wsService: WebSocketService;

export function initializeWebSocketService(server: Server) {
  wsService = new WebSocketService(server);
}
