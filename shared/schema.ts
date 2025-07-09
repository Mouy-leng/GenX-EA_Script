import { pgTable, serial, text, timestamp, real, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Trading signals table
export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  signal: text("signal").notNull(), // BUY, SELL, HOLD
  confidence: real("confidence").notNull(),
  entryPrice: real("entry_price").notNull(),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  status: text("status").notNull().default("pending"), // pending, executed, cancelled
  aiReasoning: text("ai_reasoning"),
  technicalIndicators: jsonb("technical_indicators"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Market data table for real-time Bybit data
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  price: real("price").notNull(),
  volume: real("volume").notNull(),
  change24h: real("change_24h").notNull(),
  changePercent24h: real("change_percent_24h").notNull(),
  high24h: real("high_24h").notNull(),
  low24h: real("low_24h").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// System logs table
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), // INFO, DEBUG, WARN, ERROR
  message: text("message").notNull(),
  service: text("service").notNull(), // bybit, discord, telegram, mt45, ai
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Bot status table
export const botStatus = pgTable("bot_status", {
  id: serial("id").primaryKey(),
  botName: text("bot_name").notNull().unique(),
  status: text("status").notNull(), // active, inactive, error, limited
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

// MT4/5 EA connections table
export const mt45Connections = pgTable("mt45_connections", {
  id: serial("id").primaryKey(),
  eaName: text("ea_name").notNull(),
  connectionId: text("connection_id").notNull(),
  status: text("status").notNull(), // connected, disconnected, error
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

// Signal transmission log
export const signalTransmissions = pgTable("signal_transmissions", {
  id: serial("id").primaryKey(),
  signalId: integer("signal_id").references(() => tradingSignals.id),
  destination: text("destination").notNull(), // discord, telegram, mt45
  destinationId: text("destination_id"), // channel ID, chat ID, EA ID
  status: text("status").notNull(), // sent, failed, pending
  response: text("response"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Relations
export const tradingSignalsRelations = relations(tradingSignals, ({ many }) => ({
  transmissions: many(signalTransmissions),
}));

export const signalTransmissionsRelations = relations(signalTransmissions, ({ one }) => ({
  signal: one(tradingSignals, {
    fields: [signalTransmissions.signalId],
    references: [tradingSignals.id],
  }),
}));

// Zod schemas
export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  timestamp: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).omit({
  id: true,
  lastHeartbeat: true,
});

export const insertMT45ConnectionSchema = createInsertSchema(mt45Connections).omit({
  id: true,
  lastActivity: true,
});

export const insertSignalTransmissionSchema = createInsertSchema(signalTransmissions).omit({
  id: true,
  sentAt: true,
});

// Types
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;

export type BotStatus = typeof botStatus.$inferSelect;
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;

export type MT45Connection = typeof mt45Connections.$inferSelect;
export type InsertMT45Connection = z.infer<typeof insertMT45ConnectionSchema>;

export type SignalTransmission = typeof signalTransmissions.$inferSelect;
export type InsertSignalTransmission = z.infer<typeof insertSignalTransmissionSchema>;
