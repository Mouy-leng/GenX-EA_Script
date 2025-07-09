import { Express } from "express";
import { createServer } from "http";
import { db } from "./db";
import { storage } from "./storage";
import { bybitService } from "./services/bybit";
import { aiService } from "./services/ai";
import { discordService } from "./services/discord";
import { telegramService } from "./services/telegram";
import { mt45Service } from "./services/mt45";
import { initializeWebSocketService } from "./services/websocket";

export function registerRoutes(app: Express) {
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize WebSocket service
  initializeWebSocketService(server);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        bybit: bybitService.isConnected(),
        discord: discordService.isOnline(),
        telegram: telegramService.isOnline(),
      }
    });
  });

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const [marketData, signals, logs, stats, botStatuses] = await Promise.all([
        storage.getLatestMarketData(),
        storage.getTradingSignals(10),
        storage.getSystemLogs(20),
        storage.getDashboardStats(),
        storage.getBotStatuses(),
      ]);

      res.json({
        marketData,
        signals,
        logs,
        stats,
        botStatuses,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Market data endpoints
  app.get("/api/market-data", async (req, res) => {
    try {
      const data = await storage.getLatestMarketData();
      res.json(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const data = await storage.getMarketDataBySymbol(symbol);
      res.json(data);
    } catch (error) {
      console.error('Error fetching market data for symbol:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Trading signals endpoints
  app.get("/api/signals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const signals = await storage.getTradingSignals(limit);
      res.json(signals);
    } catch (error) {
      console.error('Error fetching signals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/signals", async (req, res) => {
    try {
      const signal = await storage.createTradingSignal(req.body);
      
      // Send signal to all platforms
      await Promise.all([
        discordService.sendTradingSignal(signal),
        telegramService.sendTradingSignal(signal),
        mt45Service.sendSignalToEA(signal),
      ]);

      res.json(signal);
    } catch (error) {
      console.error('Error creating signal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put("/api/signals/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const signal = await storage.updateTradingSignalStatus(parseInt(id), status);
      res.json(signal);
    } catch (error) {
      console.error('Error updating signal status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // System logs endpoints
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Bot status endpoints
  app.get("/api/bot-status", async (req, res) => {
    try {
      const statuses = await storage.getBotStatuses();
      res.json(statuses);
    } catch (error) {
      console.error('Error fetching bot statuses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // MT4/5 connections endpoints
  app.get("/api/mt45/connections", async (req, res) => {
    try {
      const connections = await storage.getMT45Connections();
      res.json(connections);
    } catch (error) {
      console.error('Error fetching MT4/5 connections:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Signal transmissions endpoints
  app.get("/api/transmissions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const transmissions = await storage.getSignalTransmissions(limit);
      res.json(transmissions);
    } catch (error) {
      console.error('Error fetching transmissions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // AI analysis endpoints
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const marketData = await storage.getLatestMarketData();
      const signals = await aiService.analyzeMarketData(marketData);
      
      // Save generated signals
      const savedSignals = await Promise.all(
        signals.map(signal => storage.createTradingSignal(signal))
      );

      res.json(savedSignals);
    } catch (error) {
      console.error('Error running AI analysis:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/ai/patterns", async (req, res) => {
    try {
      const marketData = await storage.getLatestMarketData();
      const analysis = await aiService.analyzePatterns(marketData);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return server;
}
