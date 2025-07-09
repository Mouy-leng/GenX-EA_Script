import { createServer, Server } from 'http';
import { storage } from '../storage';
import type { TradingSignal } from '@shared/schema';

export class MT45Service {
  private server: Server;
  private connections: Map<string, any> = new Map();
  private port = 8080;

  constructor() {
    this.server = createServer();
    this.initialize();
  }

  private async initialize() {
    try {
      // HTTP endpoint for MT4/5 EAs to connect
      this.server.on('request', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const url = new URL(req.url!, `http://${req.headers.host}`);
        
        try {
          if (url.pathname === '/api/mt45/connect' && req.method === 'POST') {
            await this.handleEAConnection(req, res);
          } else if (url.pathname === '/api/mt45/signals' && req.method === 'GET') {
            await this.handleGetSignals(req, res);
          } else if (url.pathname === '/api/mt45/heartbeat' && req.method === 'POST') {
            await this.handleHeartbeat(req, res);
          } else {
            res.writeHead(404);
            res.end('Not Found');
          }
        } catch (error) {
          console.error('MT4/5 API error:', error);
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      });

      this.server.listen(this.port, () => {
        console.log(`MT4/5 service listening on port ${this.port}`);
        this.logSystemEvent('INFO', `MT4/5 service started on port ${this.port}`);
      });
    } catch (error) {
      console.error('Error initializing MT4/5 service:', error);
      this.logSystemEvent('ERROR', `Failed to initialize MT4/5 service: ${error}`);
    }
  }

  private async handleEAConnection(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { eaName, connectionId } = JSON.parse(body);
        
        if (!eaName || !connectionId) {
          res.writeHead(400);
          res.end('Missing eaName or connectionId');
          return;
        }

        // Store connection
        this.connections.set(connectionId, {
          eaName,
          connectionId,
          lastActivity: new Date(),
        });

        // Save to database
        await storage.createMT45Connection({
          eaName,
          connectionId,
          status: 'connected',
          metadata: { ip: req.connection.remoteAddress },
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'EA connected successfully',
          connectionId 
        }));

        this.logSystemEvent('INFO', `MT4/5 EA connected: ${eaName} (${connectionId})`);
      } catch (error) {
        console.error('Error handling EA connection:', error);
        res.writeHead(400);
        res.end('Invalid request');
      }
    });
  }

  private async handleGetSignals(req: any, res: any) {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const connectionId = url.searchParams.get('connectionId');
      
      if (!connectionId || !this.connections.has(connectionId)) {
        res.writeHead(401);
        res.end('Unauthorized');
        return;
      }

      // Get pending signals
      const signals = await storage.getTradingSignals(10);
      const pendingSignals = signals.filter(s => s.status === 'pending');

      const mt45Signals = pendingSignals.map(signal => ({
        id: signal.id,
        symbol: signal.symbol,
        signal: signal.signal,
        entryPrice: signal.entryPrice,
        targetPrice: signal.targetPrice,
        stopLoss: signal.stopLoss,
        confidence: signal.confidence,
        timestamp: signal.createdAt,
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mt45Signals));

      // Update connection activity
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.lastActivity = new Date();
      }
    } catch (error) {
      console.error('Error getting signals for MT4/5:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }

  private async handleHeartbeat(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { connectionId, status } = JSON.parse(body);
        
        if (!connectionId || !this.connections.has(connectionId)) {
          res.writeHead(401);
          res.end('Unauthorized');
          return;
        }

        // Update connection
        const connection = this.connections.get(connectionId);
        if (connection) {
          connection.lastActivity = new Date();
          connection.status = status;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error('Error handling heartbeat:', error);
        res.writeHead(400);
        res.end('Invalid request');
      }
    });
  }

  async sendSignalToEA(signal: TradingSignal): Promise<boolean> {
    try {
      // Mark signal as sent to MT4/5
      await storage.createSignalTransmission({
        signalId: signal.id,
        destination: 'mt45',
        destinationId: 'all_eas',
        status: 'sent',
        response: 'Signal queued for MT4/5 EAs',
      });

      this.logSystemEvent('INFO', `Signal queued for MT4/5 EAs: ${signal.symbol}`);
      return true;
    } catch (error) {
      console.error('Error sending signal to MT4/5:', error);
      this.logSystemEvent('ERROR', `Failed to send signal to MT4/5: ${error}`);
      return false;
    }
  }

  public getConnectedEAs(): any[] {
    return Array.from(this.connections.values());
  }

  public isEAConnected(connectionId: string): boolean {
    return this.connections.has(connectionId);
  }

  private async logSystemEvent(level: string, message: string) {
    try {
      await storage.createSystemLog({
        level,
        message,
        service: 'mt45',
        metadata: null,
      });
    } catch (error) {
      console.error('Error logging MT4/5 system event:', error);
    }
  }

  public async disconnect() {
    if (this.server) {
      this.server.close();
      this.connections.clear();
    }
  }
}

export const mt45Service = new MT45Service();
