import axios from "axios";
import { storage } from "../storage.js";
import { type InsertPosition, type InsertTrade } from "../../shared/schema.js";

export interface PlatformConfig {
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
  environment?: string;
}

export interface OrderRequest {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface OrderResponse {
  orderId: string;
  status: "pending" | "filled" | "cancelled" | "rejected";
  executedPrice?: number;
  executedQuantity?: number;
}

export class TradingService {
  private platforms: Map<string, PlatformConfig> = new Map();

  setPlatformConfig(platform: string, config: PlatformConfig) {
    this.platforms.set(platform, config);
  }

  async placeOrder(platform: string, accountId: number, userId: number, order: OrderRequest): Promise<OrderResponse> {
    const config = this.platforms.get(platform);
    if (!config) {
      throw new Error(`Platform ${platform} not configured`);
    }

    try {
      let response: OrderResponse;

      switch (platform) {
        case "bybit":
          response = await this.placeBybitOrder(config, order);
          break;
        case "capital_com":
          response = await this.placeCapitalOrder(config, order);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Create position record
      if (response.status === "filled" && response.executedPrice && response.executedQuantity) {
        await storage.createPosition({
          userId,
          accountId,
          symbol: order.symbol,
          side: order.side.toUpperCase(),
          size: response.executedQuantity.toString(),
          entryPrice: response.executedPrice.toString(),
          stopLoss: order.stopLoss?.toString(),
          takeProfit: order.takeProfit?.toString(),
          isOpen: true
        });

        // Create trade record
        await storage.createTrade({
          userId,
          accountId,
          symbol: order.symbol,
          side: order.side.toUpperCase(),
          quantity: response.executedQuantity.toString(),
          entryPrice: response.executedPrice.toString(),
          status: "open"
        });
      }

      return response;
    } catch (error) {
      console.error(`Failed to place order on ${platform}:`, error);
      throw new Error(`Order placement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async placeBybitOrder(config: PlatformConfig, order: OrderRequest): Promise<OrderResponse> {
    // Mock implementation for demonstration
    // In production, integrate with actual Bybit API
    const mockPrice = 1.0876 + (Math.random() - 0.5) * 0.001;
    
    return {
      orderId: `bybit_${Date.now()}`,
      status: "filled",
      executedPrice: mockPrice,
      executedQuantity: order.quantity
    };
  }

  private async placeCapitalOrder(config: PlatformConfig, order: OrderRequest): Promise<OrderResponse> {
    // Mock implementation for demonstration
    // In production, integrate with actual Capital.com API
    const mockPrice = 1.0876 + (Math.random() - 0.5) * 0.001;
    
    return {
      orderId: `capital_${Date.now()}`,
      status: "filled",
      executedPrice: mockPrice,
      executedQuantity: order.quantity
    };
  }

  async closePosition(platform: string, positionId: number): Promise<OrderResponse> {
    const position = await storage.getPosition(positionId);
    if (!position || !position.isOpen) {
      throw new Error("Position not found or already closed");
    }

    const config = this.platforms.get(platform);
    if (!config) {
      throw new Error(`Platform ${platform} not configured`);
    }

    try {
      // Reverse the original order
      const closeOrder: OrderRequest = {
        symbol: position.symbol,
        side: position.side === "LONG" ? "sell" : "buy",
        quantity: parseFloat(position.size)
      };

      const response = await this.placeOrder(platform, position.accountId, position.userId, closeOrder);

      if (response.status === "filled" && response.executedPrice) {
        // Update position
        const entryPrice = parseFloat(position.entryPrice);
        const exitPrice = response.executedPrice;
        const size = parseFloat(position.size);
        const pnl = position.side === "LONG" 
          ? (exitPrice - entryPrice) * size
          : (entryPrice - exitPrice) * size;

        await storage.updatePosition(positionId, {
          isOpen: false,
          currentPrice: exitPrice.toString(),
          pnl: pnl.toString(),
          pnlPercent: ((pnl / (entryPrice * size)) * 100).toString()
        });

        // Update trade record
        const trades = await storage.getTrades(position.userId);
        const relatedTrade = trades.find(t => 
          t.symbol === position.symbol && 
          t.accountId === position.accountId && 
          t.status === "open"
        );

        if (relatedTrade) {
          await storage.updateTrade(relatedTrade.id, {
            status: "closed",
            exitPrice: exitPrice.toString(),
            pnl: pnl.toString(),
            closeTime: new Date()
          });
        }
      }

      return response;
    } catch (error) {
      console.error(`Failed to close position ${positionId}:`, error);
      throw new Error(`Position close failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccountBalance(platform: string, accountId: number): Promise<{ balance: number; equity: number; marginUsed: number }> {
    const config = this.platforms.get(platform);
    if (!config) {
      throw new Error(`Platform ${platform} not configured`);
    }

    try {
      switch (platform) {
        case "bybit":
          return await this.getBybitBalance(config);
        case "capital_com":
          return await this.getCapitalBalance(config);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to get balance for ${platform}:`, error);
      // Return mock data if API fails
      return {
        balance: 10000 + Math.random() * 1000,
        equity: 10000 + Math.random() * 1000,
        marginUsed: Math.random() * 1000
      };
    }
  }

  private async getBybitBalance(config: PlatformConfig): Promise<{ balance: number; equity: number; marginUsed: number }> {
    // Mock implementation - replace with actual Bybit API call
    return {
      balance: 10000 + Math.random() * 1000,
      equity: 10000 + Math.random() * 1000,
      marginUsed: Math.random() * 1000
    };
  }

  private async getCapitalBalance(config: PlatformConfig): Promise<{ balance: number; equity: number; marginUsed: number }> {
    // Mock implementation - replace with actual Capital.com API call
    return {
      balance: 10000 + Math.random() * 1000,
      equity: 10000 + Math.random() * 1000,
      marginUsed: Math.random() * 1000
    };
  }

  async updatePositionPnL(positionId: number, currentPrice: number): Promise<void> {
    const position = await storage.getPosition(positionId);
    if (!position || !position.isOpen) return;

    const entryPrice = parseFloat(position.entryPrice);
    const size = parseFloat(position.size);
    const pnl = position.side === "LONG" 
      ? (currentPrice - entryPrice) * size
      : (entryPrice - currentPrice) * size;
    const pnlPercent = (pnl / (entryPrice * size)) * 100;

    await storage.updatePosition(positionId, {
      currentPrice: currentPrice.toString(),
      pnl: pnl.toString(),
      pnlPercent: pnlPercent.toString()
    });
  }

  async checkStopLossAndTakeProfit(positionId: number, currentPrice: number): Promise<boolean> {
    const position = await storage.getPosition(positionId);
    if (!position || !position.isOpen) return false;

    const shouldClose = 
      (position.stopLoss && 
        ((position.side === "LONG" && currentPrice <= parseFloat(position.stopLoss)) ||
         (position.side === "SHORT" && currentPrice >= parseFloat(position.stopLoss)))) ||
      (position.takeProfit && 
        ((position.side === "LONG" && currentPrice >= parseFloat(position.takeProfit)) ||
         (position.side === "SHORT" && currentPrice <= parseFloat(position.takeProfit))));

    if (shouldClose) {
      // Get the account to determine platform
      const account = await storage.getTradingAccount(position.accountId);
      if (account) {
        await this.closePosition(account.platform, positionId);
        return true;
      }
    }

    return false;
  }
}

export const tradingService = new TradingService();