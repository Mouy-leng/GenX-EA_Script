import express, { type Express, type Request, type Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { marketDataService } from "./services/marketData.js";
import { aiService } from "./services/ai.js";
import { tradingService } from "./services/trading.js";
import { notificationService } from "./services/notifications.js";
import { 
  insertTradingAccountSchema, 
  insertPositionSchema, 
  insertTradingBotSchema,
  insertWatchlistSchema,
  insertTradeSchema 
} from "../shared/schema.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // User routes
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      // Demo user for testing
      const user = await storage.getUser(1);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Trading Accounts routes
  app.get("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getTradingAccounts(1); // Demo user
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTradingAccountSchema.parse({
        ...req.body,
        userId: 1 // Demo user
      });
      const account = await storage.createTradingAccount(validatedData);
      res.json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create account" });
    }
  });

  // Positions routes
  app.get("/api/positions", async (req: Request, res: Response) => {
    try {
      const positions = await storage.getPositions(1); // Demo user
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.get("/api/positions/active", async (req: Request, res: Response) => {
    try {
      const positions = await storage.getActivePositions(1); // Demo user
      res.json(positions);
    } catch (error) {
      console.error("Error fetching active positions:", error);
      res.status(500).json({ error: "Failed to fetch active positions" });
    }
  });

  app.post("/api/positions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPositionSchema.parse({
        ...req.body,
        userId: 1 // Demo user
      });
      const position = await storage.createPosition(validatedData);
      broadcast({ type: 'position_created', data: position });
      res.json(position);
    } catch (error) {
      console.error("Error creating position:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create position" });
    }
  });

  app.patch("/api/positions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const position = await storage.updatePosition(id, req.body);
      if (position) {
        broadcast({ type: 'position_updated', data: position });
        res.json(position);
      } else {
        res.status(404).json({ error: "Position not found" });
      }
    } catch (error) {
      console.error("Error updating position:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update position" });
    }
  });

  // Trading Bots routes
  app.get("/api/bots", async (req: Request, res: Response) => {
    try {
      const bots = await storage.getTradingBots(1); // Demo user
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.post("/api/bots", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTradingBotSchema.parse({
        ...req.body,
        userId: 1 // Demo user
      });
      const bot = await storage.createTradingBot(validatedData);
      res.json(bot);
    } catch (error) {
      console.error("Error creating bot:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create bot" });
    }
  });

  app.patch("/api/bots/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const bot = await storage.updateTradingBot(id, req.body);
      if (bot) {
        broadcast({ type: 'bot_updated', data: bot });
        res.json(bot);
      } else {
        res.status(404).json({ error: "Bot not found" });
      }
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update bot" });
    }
  });

  app.post("/api/bots/:id/start", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const bot = await storage.updateTradingBot(id, { 
        status: "running", 
        lastRun: new Date() 
      });
      if (bot) {
        await notificationService.sendBotStatusAlert(bot.userId, bot.name, "started");
        broadcast({ type: 'bot_started', data: bot });
        res.json(bot);
      } else {
        res.status(404).json({ error: "Bot not found" });
      }
    } catch (error) {
      console.error("Error starting bot:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to start bot" });
    }
  });

  app.post("/api/bots/:id/stop", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const bot = await storage.updateTradingBot(id, { status: "stopped" });
      if (bot) {
        await notificationService.sendBotStatusAlert(bot.userId, bot.name, "stopped");
        broadcast({ type: 'bot_stopped', data: bot });
        res.json(bot);
      } else {
        res.status(404).json({ error: "Bot not found" });
      }
    } catch (error) {
      console.error("Error stopping bot:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to stop bot" });
    }
  });

  // Market Data routes
  app.get("/api/market", async (req: Request, res: Response) => {
    try {
      const prices = marketDataService.getDefaultWatchlistPrices();
      res.json(prices);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/market/:symbol/candles", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const { timeframe = "1h", limit = "100" } = req.query;
      const candles = await marketDataService.getCandlestickData(
        symbol, 
        timeframe as string, 
        parseInt(limit as string)
      );
      res.json(candles);
    } catch (error) {
      console.error("Error fetching candlestick data:", error);
      res.status(500).json({ error: "Failed to fetch candlestick data" });
    }
  });

  app.get("/api/market/status", async (req: Request, res: Response) => {
    try {
      res.json({
        status: "open",
        timestamp: new Date(),
        nextUpdate: new Date(Date.now() + 60000) // Next update in 1 minute
      });
    } catch (error) {
      console.error("Error fetching market status:", error);
      res.status(500).json({ error: "Failed to fetch market status" });
    }
  });

  // Economic News routes
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const { limit = "20" } = req.query;
      const news = await storage.getEconomicNews(parseInt(limit as string));
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Watchlist routes
  app.get("/api/market/watchlist", async (req: Request, res: Response) => {
    try {
      const watchlist = await storage.getWatchlist(1); // Demo user
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/market/watchlist", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWatchlistSchema.parse({
        ...req.body,
        userId: 1 // Demo user
      });
      const item = await storage.addToWatchlist(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to add to watchlist" });
    }
  });

  app.delete("/api/market/watchlist/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      await storage.removeFromWatchlist(1, symbol); // Demo user
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to remove from watchlist" });
    }
  });

  // Trades routes
  app.get("/api/trades", async (req: Request, res: Response) => {
    try {
      const { limit = "100" } = req.query;
      const trades = await storage.getTrades(1, parseInt(limit as string)); // Demo user
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  app.post("/api/trades", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTradeSchema.parse({
        ...req.body,
        userId: 1 // Demo user
      });
      const trade = await storage.createTrade(validatedData);
      broadcast({ type: 'trade_created', data: trade });
      res.json(trade);
    } catch (error) {
      console.error("Error creating trade:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create trade" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/portfolio", async (req: Request, res: Response) => {
    try {
      const positions = await storage.getActivePositions(1); // Demo user
      const accounts = await storage.getTradingAccounts(1);
      
      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      const totalEquity = accounts.reduce((sum, acc) => sum + parseFloat(acc.equity), 0);
      const totalPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.pnl), 0);
      const totalPnLPercent = totalBalance > 0 ? (totalPnL / totalBalance) * 100 : 0;

      res.json({
        totalBalance,
        totalEquity,
        totalPnL,
        totalPnLPercent,
        openPositions: positions.length,
        dayChange: totalPnL, // Simplified for demo
        dayChangePercent: totalPnLPercent
      });
    } catch (error) {
      console.error("Error fetching portfolio analytics:", error);
      res.status(500).json({ error: "Failed to fetch portfolio analytics" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const { limit = "50" } = req.query;
      const notifications = await notificationService.getNotifications(1, parseInt(limit as string)); // Demo user
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await notificationService.markAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to mark notification as read" });
    }
  });

  // AI Analysis routes
  app.post("/api/ai/analyze-market", async (req: Request, res: Response) => {
    try {
      const { marketData, economicNews } = req.body;
      const analysis = await aiService.analyzeMarketSentiment(marketData || [], economicNews || []);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing market:", error);
      res.status(500).json({ error: "Failed to analyze market" });
    }
  });

  app.post("/api/ai/generate-signal", async (req: Request, res: Response) => {
    try {
      const { symbol, marketData, indicators } = req.body;
      const signal = await aiService.generateTradingSignal(symbol, marketData || [], indicators || {});
      res.json(signal);
    } catch (error) {
      console.error("Error generating signal:", error);
      res.status(500).json({ error: "Failed to generate signal" });
    }
  });

  // Real-time market data updates
  setInterval(async () => {
    try {
      const prices = marketDataService.getDefaultWatchlistPrices();
      broadcast({ type: 'market_update', data: prices });
    } catch (error) {
      console.error("Error broadcasting market updates:", error);
    }
  }, 5000); // Update every 5 seconds

  return httpServer;
}