import { 
  tradingSignals, 
  marketData, 
  systemLogs, 
  botStatus, 
  mt45Connections, 
  signalTransmissions,
  type TradingSignal,
  type InsertTradingSignal,
  type MarketData,
  type InsertMarketData,
  type SystemLog,
  type InsertSystemLog,
  type BotStatus,
  type InsertBotStatus,
  type MT45Connection,
  type InsertMT45Connection,
  type SignalTransmission,
  type InsertSignalTransmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Trading signals
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  getTradingSignals(limit?: number): Promise<TradingSignal[]>;
  updateTradingSignalStatus(id: number, status: string): Promise<TradingSignal>;
  
  // Market data
  createMarketData(data: InsertMarketData): Promise<MarketData>;
  getLatestMarketData(): Promise<MarketData[]>;
  getMarketDataBySymbol(symbol: string): Promise<MarketData[]>;
  
  // System logs
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  
  // Bot status
  updateBotStatus(status: InsertBotStatus): Promise<BotStatus>;
  getBotStatuses(): Promise<BotStatus[]>;
  
  // MT4/5 connections
  createMT45Connection(connection: InsertMT45Connection): Promise<MT45Connection>;
  getMT45Connections(): Promise<MT45Connection[]>;
  updateMT45ConnectionStatus(id: number, status: string): Promise<MT45Connection>;
  
  // Signal transmissions
  createSignalTransmission(transmission: InsertSignalTransmission): Promise<SignalTransmission>;
  getSignalTransmissions(limit?: number): Promise<SignalTransmission[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalSignals: number;
    signalsToday: number;
    successRate: number;
    activeBots: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const [result] = await db
      .insert(tradingSignals)
      .values(signal)
      .returning();
    return result;
  }

  async getTradingSignals(limit: number = 50): Promise<TradingSignal[]> {
    return await db
      .select()
      .from(tradingSignals)
      .orderBy(desc(tradingSignals.createdAt))
      .limit(limit);
  }

  async updateTradingSignalStatus(id: number, status: string): Promise<TradingSignal> {
    const [result] = await db
      .update(tradingSignals)
      .set({ status, updatedAt: new Date() })
      .where(eq(tradingSignals.id, id))
      .returning();
    return result;
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    const [result] = await db
      .insert(marketData)
      .values(data)
      .returning();
    return result;
  }

  async getLatestMarketData(): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .orderBy(desc(marketData.timestamp))
      .limit(20);
  }

  async getMarketDataBySymbol(symbol: string): Promise<MarketData[]> {
    return await db
      .select()
      .from(marketData)
      .where(eq(marketData.symbol, symbol))
      .orderBy(desc(marketData.timestamp))
      .limit(100);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [result] = await db
      .insert(systemLogs)
      .values(log)
      .returning();
    return result;
  }

  async getSystemLogs(limit: number = 50): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  async updateBotStatus(status: InsertBotStatus): Promise<BotStatus> {
    const [result] = await db
      .insert(botStatus)
      .values(status)
      .onConflictDoUpdate({
        target: botStatus.botName,
        set: {
          status: status.status,
          lastHeartbeat: new Date(),
          metadata: status.metadata,
        },
      })
      .returning();
    return result;
  }

  async getBotStatuses(): Promise<BotStatus[]> {
    return await db
      .select()
      .from(botStatus)
      .orderBy(botStatus.botName);
  }

  async createMT45Connection(connection: InsertMT45Connection): Promise<MT45Connection> {
    const [result] = await db
      .insert(mt45Connections)
      .values(connection)
      .returning();
    return result;
  }

  async getMT45Connections(): Promise<MT45Connection[]> {
    return await db
      .select()
      .from(mt45Connections)
      .orderBy(desc(mt45Connections.lastActivity));
  }

  async updateMT45ConnectionStatus(id: number, status: string): Promise<MT45Connection> {
    const [result] = await db
      .update(mt45Connections)
      .set({ status, lastActivity: new Date() })
      .where(eq(mt45Connections.id, id))
      .returning();
    return result;
  }

  async createSignalTransmission(transmission: InsertSignalTransmission): Promise<SignalTransmission> {
    const [result] = await db
      .insert(signalTransmissions)
      .values(transmission)
      .returning();
    return result;
  }

  async getSignalTransmissions(limit: number = 50): Promise<SignalTransmission[]> {
    return await db
      .select()
      .from(signalTransmissions)
      .orderBy(desc(signalTransmissions.sentAt))
      .limit(limit);
  }

  async getDashboardStats(): Promise<{
    totalSignals: number;
    signalsToday: number;
    successRate: number;
    activeBots: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSignalsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tradingSignals);

    const [signalsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tradingSignals)
      .where(sql`${tradingSignals.createdAt} >= ${today}`);

    const [successRateResult] = await db
      .select({ 
        total: sql<number>`count(*)`,
        successful: sql<number>`count(case when status = 'executed' then 1 end)`
      })
      .from(tradingSignals);

    const [activeBotsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(botStatus)
      .where(eq(botStatus.status, 'active'));

    const successRate = successRateResult.total > 0 
      ? (successRateResult.successful / successRateResult.total) * 100 
      : 0;

    return {
      totalSignals: totalSignalsResult.count,
      signalsToday: signalsTodayResult.count,
      successRate: parseFloat(successRate.toFixed(1)),
      activeBots: activeBotsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
