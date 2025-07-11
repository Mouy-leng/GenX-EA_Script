import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trading accounts table
export const tradingAccounts = pgTable("trading_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(), // "bybit", "capital_com", "mt4", "mt5"
  accountId: text("account_id").notNull(),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  isActive: boolean("is_active").default(true).notNull(),
  balance: decimal("balance", { precision: 15, scale: 8 }).default("0").notNull(),
  equity: decimal("equity", { precision: 15, scale: 8 }).default("0").notNull(),
  marginUsed: decimal("margin_used", { precision: 15, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Positions table
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => tradingAccounts.id).notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // "LONG", "SHORT"
  size: decimal("size", { precision: 15, scale: 8 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 15, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 8 }),
  pnl: decimal("pnl", { precision: 15, scale: 8 }).default("0").notNull(),
  pnlPercent: decimal("pnl_percent", { precision: 10, scale: 4 }).default("0").notNull(),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 8 }),
  openTime: timestamp("open_time").defaultNow().notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
});

// Trading bots table
export const tradingBots = pgTable("trading_bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => tradingAccounts.id).notNull(),
  name: text("name").notNull(),
  strategy: text("strategy").notNull(), // "scalping", "grid", "momentum", etc.
  symbol: text("symbol").notNull(),
  status: text("status").notNull().default("stopped"), // "running", "paused", "stopped"
  config: jsonb("config").notNull(),
  dailyPnl: decimal("daily_pnl", { precision: 15, scale: 8 }).default("0").notNull(),
  totalPnl: decimal("total_pnl", { precision: 15, scale: 8 }).default("0").notNull(),
  tradesCount: integer("trades_count").default(0).notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastRun: timestamp("last_run"),
});

// Market data table
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(), // "1m", "5m", "1h", "1d", etc.
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 15, scale: 8 }).notNull(),
  high: decimal("high", { precision: 15, scale: 8 }).notNull(),
  low: decimal("low", { precision: 15, scale: 8 }).notNull(),
  close: decimal("close", { precision: 15, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 8 }).default("0").notNull(),
});

// Economic news table
export const economicNews = pgTable("economic_news", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  summary: text("summary"),
  source: text("source").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  impact: text("impact").notNull(), // "HIGH", "MEDIUM", "LOW"
  currency: text("currency"),
  category: text("category"),
  url: text("url"),
  sentiment: decimal("sentiment", { precision: 3, scale: 2 }), // AI-analyzed sentiment
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // "trade", "risk", "news", "bot"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  priority: text("priority").notNull().default("medium"), // "high", "medium", "low"
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Watchlist table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  description: text("description"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Trades table
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => tradingAccounts.id).notNull(),
  botId: integer("bot_id").references(() => tradingBots.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 8 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 15, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 15, scale: 8 }),
  pnl: decimal("pnl", { precision: 15, scale: 8 }),
  commission: decimal("commission", { precision: 15, scale: 8 }).default("0").notNull(),
  openTime: timestamp("open_time").defaultNow().notNull(),
  closeTime: timestamp("close_time"),
  status: text("status").notNull().default("open"), // "open", "closed", "cancelled"
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTradingAccountSchema = createInsertSchema(tradingAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  openTime: true,
});

export const insertTradingBotSchema = createInsertSchema(tradingBots).omit({
  id: true,
  createdAt: true,
  lastRun: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
});

export const insertEconomicNewsSchema = createInsertSchema(economicNews).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  openTime: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type TradingBot = typeof tradingBots.$inferSelect;
export type InsertTradingBot = z.infer<typeof insertTradingBotSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type EconomicNews = typeof economicNews.$inferSelect;
export type InsertEconomicNews = z.infer<typeof insertEconomicNewsSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;