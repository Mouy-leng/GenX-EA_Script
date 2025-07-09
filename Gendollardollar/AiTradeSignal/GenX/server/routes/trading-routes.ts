import { Router } from "express";
import { TradingService } from "../services/trading-service";
import { AIService } from "../services/ai-service";
import { TradingSignal } from "@shared/trading-schema";

const router = Router();
const tradingService = new TradingService();
const aiService = new AIService();

// Get dashboard stats
router.get("/api/dashboard/stats", async (req, res) => {
  try {
    const account = await tradingService.getAccountBalance();
    const positions = await tradingService.getOpenPositions();
    const history = await tradingService.getTradingHistory(100);
    
    const stats = {
      totalSignals: history.length,
      successfulTrades: history.filter(p => p.profit > 0).length,
      totalProfit: history.reduce((sum, p) => sum + p.profit, 0),
      winRate: history.length > 0 ? (history.filter(p => p.profit > 0).length / history.length) * 100 : 0,
      activePositions: positions.length,
      totalBalance: account?.balance || 0,
      todaysPnL: positions.reduce((sum, p) => sum + p.profit, 0),
      alertsCount: 0
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Get market data for a symbol
router.get("/api/market/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const marketData = await tradingService.getMarketData(symbol);
    
    if (!marketData) {
      return res.status(404).json({ error: "Market data not found" });
    }
    
    res.json(marketData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

// Get trading signals
router.get("/api/signals", async (req, res) => {
  try {
    // Mock trading signals for now
    const signals: TradingSignal[] = [
      {
        id: "signal-1",
        symbol: "BTCUSDT",
        action: "BUY",
        price: 45000,
        confidence: 0.85,
        stopLoss: 44000,
        takeProfit: 47000,
        lotSize: 0.1,
        timestamp: new Date(),
        source: "AI",
        reasoning: "Strong bullish momentum with positive market sentiment",
        platform: "BYBIT",
        status: "PENDING"
      },
      {
        id: "signal-2",
        symbol: "ETHUSDT",
        action: "SELL",
        price: 3100,
        confidence: 0.72,
        stopLoss: 3150,
        takeProfit: 3000,
        lotSize: 0.5,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        source: "TECHNICAL",
        reasoning: "Resistance level reached, expect correction",
        platform: "BYBIT",
        status: "EXECUTED"
      }
    ];
    
    res.json(signals);
  } catch (error) {
    console.error("Error fetching signals:", error);
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

// Generate new trading signal
router.post("/api/signals/generate", async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }
    
    const marketData = await tradingService.getMarketData(symbol);
    if (!marketData) {
      return res.status(404).json({ error: "Market data not found for symbol" });
    }
    
    // Mock news data - in real implementation, this would come from news API
    const newsData = [
      {
        id: "news-1",
        title: "Bitcoin shows strong momentum",
        description: "Bitcoin continues to show bullish patterns with institutional adoption",
        url: "https://example.com/news1",
        source: "CryptoNews",
        publishedAt: new Date(),
        sentiment: "POSITIVE" as const,
        impactScore: 0.7,
        relevantSymbols: [symbol]
      }
    ];
    
    const signal = await aiService.generateTradingSignal(symbol, marketData, newsData);
    
    if (!signal) {
      return res.status(500).json({ error: "Failed to generate signal" });
    }
    
    res.json(signal);
  } catch (error) {
    console.error("Error generating signal:", error);
    res.status(500).json({ error: "Failed to generate signal" });
  }
});

// Get account information
router.get("/api/account", async (req, res) => {
  try {
    const account = await tradingService.getAccountBalance();
    res.json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ error: "Failed to fetch account information" });
  }
});

// Get open positions
router.get("/api/positions", async (req, res) => {
  try {
    const positions = await tradingService.getOpenPositions();
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// Get trading history
router.get("/api/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await tradingService.getTradingHistory(limit);
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch trading history" });
  }
});

// Execute a trade
router.post("/api/trade/execute", async (req, res) => {
  try {
    const signal: TradingSignal = req.body;
    
    if (!signal.symbol || !signal.action || !signal.price) {
      return res.status(400).json({ error: "Invalid signal data" });
    }
    
    const success = await tradingService.executeTrade(signal);
    
    if (success) {
      res.json({ success: true, message: "Trade executed successfully" });
    } else {
      res.status(500).json({ error: "Failed to execute trade" });
    }
  } catch (error) {
    console.error("Error executing trade:", error);
    res.status(500).json({ error: "Failed to execute trade" });
  }
});

// MT4/MT5 signal endpoint for EA integration
router.get("/api/mt4-signal", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    
    if (apiKey !== process.env.GENZ_API_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Return latest signal in MT4/MT5 format
    const signal = {
      symbol: "XAUUSD",
      action: "BUY",
      lotSize: 0.1,
      stopLoss: 100,
      takeProfit: 200,
      timestamp: new Date().toISOString()
    };
    
    res.json(signal);
  } catch (error) {
    console.error("Error fetching MT4 signal:", error);
    res.status(500).json({ error: "Failed to fetch signal" });
  }
});

// Market sentiment analysis
router.get("/api/sentiment/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Mock news data - in real implementation, this would come from news API
    const newsData = [
      {
        id: "news-1",
        title: "Market shows positive trends",
        description: "Recent analysis shows bullish momentum in the market",
        url: "https://example.com/news1",
        source: "MarketNews",
        publishedAt: new Date(),
        sentiment: "POSITIVE" as const,
        impactScore: 0.6,
        relevantSymbols: [symbol]
      }
    ];
    
    const sentiment = await aiService.analyzeMarketSentiment(newsData);
    res.json(sentiment);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

export default router;