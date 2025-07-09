import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// Mock trading signal data - in real app this would call AI services
const generateMockSignal = (symbol: string) => {
  const prices = {
    XAUUSD: 2043.50,
    BTCUSDT: 45000,
    ETHUSDT: 3100,
    EURUSD: 1.0950,
    GBPUSD: 1.2750,
    USDJPY: 148.50,
    AAPL: 185.50,
    TSLA: 245.80,
    GOOGL: 139.20,
    MSFT: 374.60
  };

  const actions = ["BUY", "SELL"];
  const sources = ["AI", "TECHNICAL", "FUNDAMENTAL"];
  const platforms = ["BYBIT", "CAPITAL_COM", "MT4", "MT5"];
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  const price = prices[symbol as keyof typeof prices] || 100;
  const confidence = 0.6 + Math.random() * 0.35; // 60-95% confidence
  const lotSize = symbol.includes("USD") ? 0.1 : (Math.random() * 0.5 + 0.1);
  
  // Calculate stop loss and take profit based on action
  const stopLoss = action === "BUY" 
    ? price * (1 - 0.02 - Math.random() * 0.03) // 2-5% below entry
    : price * (1 + 0.02 + Math.random() * 0.03); // 2-5% above entry
    
  const takeProfit = action === "BUY" 
    ? price * (1 + 0.03 + Math.random() * 0.05) // 3-8% above entry
    : price * (1 - 0.03 - Math.random() * 0.05); // 3-8% below entry

  const reasonings = {
    BUY: [
      "Strong bullish momentum detected with positive market sentiment",
      "Technical indicators showing oversold conditions with reversal potential",
      "Breaking above key resistance level with high volume confirmation",
      "Positive economic news driving upward price action",
      "RSI showing bullish divergence with price making new lows"
    ],
    SELL: [
      "Bearish momentum accelerating with negative market sentiment",
      "Technical indicators showing overbought conditions",
      "Breaking below key support level with high volume",
      "Negative economic news impacting price action",
      "RSI showing bearish divergence with price making new highs"
    ]
  };

  const reasoning = reasonings[action as keyof typeof reasonings][
    Math.floor(Math.random() * reasonings[action as keyof typeof reasonings].length)
  ];

  return {
    id: `signal-${Date.now()}`,
    symbol,
    action,
    price: Math.round(price * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    lotSize: Math.round(lotSize * 100) / 100,
    timestamp: new Date(),
    source: sources[Math.floor(Math.random() * sources.length)],
    reasoning,
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    status: "PENDING"
  };
};

// Generate trading signal
router.post("/api/signals/generate", (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }
    
    const signal = generateMockSignal(symbol);
    
    console.log(`Generated signal for ${symbol}:`, signal);
    
    res.json(signal);
  } catch (error) {
    console.error("Error generating signal:", error);
    res.status(500).json({ error: "Failed to generate signal" });
  }
});

// Get recent signals
router.get("/api/signals", (req: Request, res: Response) => {
  try {
    const signals = [
      generateMockSignal("XAUUSD"),
      generateMockSignal("BTCUSDT"),
      generateMockSignal("ETHUSDT")
    ];
    
    res.json(signals);
  } catch (error) {
    console.error("Error fetching signals:", error);
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

// MT4/MT5 signal endpoint
router.get("/api/mt4-signal", (req: Request, res: Response) => {
  try {
    const apiKey = req.headers["x-api-key"];
    
    if (apiKey !== process.env.GENZ_API_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
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

// Market data endpoint
router.get("/api/market/:symbol", (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    const marketData = {
      symbol,
      price: 2043.50,
      change: 12.30,
      changePercent: 0.61,
      volume: 125000,
      high: 2055.80,
      low: 2038.20
    };
    
    res.json(marketData);
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

export default router;