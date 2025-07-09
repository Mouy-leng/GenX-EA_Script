import { z } from "zod";

// Trading Signal Schema
export const tradingSignalSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  action: z.enum(["BUY", "SELL", "HOLD"]),
  price: z.number(),
  confidence: z.number().min(0).max(1),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  lotSize: z.number().positive(),
  timestamp: z.date(),
  source: z.enum(["AI", "TECHNICAL", "FUNDAMENTAL", "NEWS"]),
  reasoning: z.string(),
  platform: z.enum(["BYBIT", "CAPITAL_COM", "MT4", "MT5"]),
  status: z.enum(["PENDING", "EXECUTED", "CANCELLED", "EXPIRED"]).default("PENDING"),
});

export type TradingSignal = z.infer<typeof tradingSignalSchema>;

// Market Data Schema
export const marketDataSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number(),
  high: z.number(),
  low: z.number(),
  open: z.number(),
  timestamp: z.date(),
  source: z.enum(["ALPHA_VANTAGE", "BYBIT", "FRED", "TRADING_ECONOMICS"]),
});

export type MarketData = z.infer<typeof marketDataSchema>;

// News Item Schema
export const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  publishedAt: z.date(),
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  impactScore: z.number().min(0).max(1),
  relevantSymbols: z.array(z.string()),
});

export type NewsItem = z.infer<typeof newsItemSchema>;

// Trading Account Schema
export const tradingAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.enum(["BYBIT", "CAPITAL_COM", "MT4", "MT5"]),
  balance: z.number(),
  equity: z.number(),
  margin: z.number(),
  freeMargin: z.number(),
  marginLevel: z.number(),
  isActive: z.boolean(),
  lastUpdated: z.date(),
});

export type TradingAccount = z.infer<typeof tradingAccountSchema>;

// Position Schema
export const positionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  type: z.enum(["BUY", "SELL"]),
  volume: z.number(),
  openPrice: z.number(),
  currentPrice: z.number(),
  profit: z.number(),
  profitPercent: z.number(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  openTime: z.date(),
  platform: z.enum(["BYBIT", "CAPITAL_COM", "MT4", "MT5"]),
  status: z.enum(["OPEN", "CLOSED", "PARTIAL"]),
});

export type Position = z.infer<typeof positionSchema>;

// Bot Configuration Schema
export const botConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  maxRisk: z.number().min(0).max(1),
  maxPositions: z.number().positive(),
  allowedSymbols: z.array(z.string()),
  minConfidence: z.number().min(0).max(1),
  telegramNotifications: z.boolean(),
  discordNotifications: z.boolean(),
  autoTrade: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BotConfig = z.infer<typeof botConfigSchema>;

// Notification Schema
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(["SIGNAL", "TRADE", "ALERT", "ERROR"]),
  title: z.string(),
  message: z.string(),
  channel: z.enum(["TELEGRAM", "DISCORD", "EMAIL"]),
  sent: z.boolean(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

// API Response Schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  timestamp: z.date(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Dashboard Stats Schema
export const dashboardStatsSchema = z.object({
  totalSignals: z.number(),
  successfulTrades: z.number(),
  totalProfit: z.number(),
  winRate: z.number(),
  activePositions: z.number(),
  totalBalance: z.number(),
  todaysPnL: z.number(),
  alertsCount: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;