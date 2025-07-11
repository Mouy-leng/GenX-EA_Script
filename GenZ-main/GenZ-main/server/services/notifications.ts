import { storage } from "../storage.js";
import { type InsertNotification } from "../../shared/schema.js";

export interface NotificationChannel {
  type: "discord" | "telegram" | "email" | "webhook";
  config: any;
  enabled: boolean;
}

export interface NotificationRequest {
  userId: number;
  type: "trade" | "risk" | "news" | "bot" | "system";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  data?: any;
  channels?: string[];
}

export class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();

  addChannel(name: string, channel: NotificationChannel) {
    this.channels.set(name, channel);
  }

  async sendNotification(request: NotificationRequest): Promise<void> {
    try {
      // Store notification in database
      await storage.createNotification({
        userId: request.userId,
        type: request.type,
        title: request.title,
        message: request.message,
        priority: request.priority,
        data: request.data || null
      });

      // Send to external channels if specified
      if (request.channels) {
        for (const channelName of request.channels) {
          const channel = this.channels.get(channelName);
          if (channel && channel.enabled) {
            await this.sendToChannel(channel, request);
          }
        }
      }

      console.log(`Notification sent: ${request.title}`);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  private async sendToChannel(channel: NotificationChannel, request: NotificationRequest): Promise<void> {
    try {
      switch (channel.type) {
        case "discord":
          await this.sendDiscordNotification(channel.config, request);
          break;
        case "telegram":
          await this.sendTelegramNotification(channel.config, request);
          break;
        case "email":
          await this.sendEmailNotification(channel.config, request);
          break;
        case "webhook":
          await this.sendWebhookNotification(channel.config, request);
          break;
      }
    } catch (error) {
      console.error(`Failed to send notification via ${channel.type}:`, error);
    }
  }

  private async sendDiscordNotification(config: any, request: NotificationRequest): Promise<void> {
    if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CHANNEL_ID) {
      console.warn("Discord configuration missing, notification not sent");
      return;
    }

    // Mock Discord notification - replace with actual Discord.js implementation
    console.log(`Discord notification: ${request.title} - ${request.message}`);
  }

  private async sendTelegramNotification(config: any, request: NotificationRequest): Promise<void> {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_USER_ID) {
      console.warn("Telegram configuration missing, notification not sent");
      return;
    }

    // Mock Telegram notification - replace with actual Telegram Bot API
    console.log(`Telegram notification: ${request.title} - ${request.message}`);
  }

  private async sendEmailNotification(config: any, request: NotificationRequest): Promise<void> {
    // Mock email notification - replace with actual email service
    console.log(`Email notification: ${request.title} - ${request.message}`);
  }

  private async sendWebhookNotification(config: any, request: NotificationRequest): Promise<void> {
    // Mock webhook notification - replace with actual HTTP request
    console.log(`Webhook notification: ${request.title} - ${request.message}`);
  }

  async sendTradeAlert(userId: number, symbol: string, action: string, price: number, pnl?: number): Promise<void> {
    const title = `Trade Alert: ${symbol}`;
    const message = pnl 
      ? `${action} ${symbol} at ${price}. P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}`
      : `${action} ${symbol} at ${price}`;

    await this.sendNotification({
      userId,
      type: "trade",
      title,
      message,
      priority: "high",
      data: { symbol, action, price, pnl }
    });
  }

  async sendRiskAlert(userId: number, message: string, data?: any): Promise<void> {
    await this.sendNotification({
      userId,
      type: "risk",
      title: "Risk Alert",
      message,
      priority: "high",
      data
    });
  }

  async sendBotStatusAlert(userId: number, botName: string, status: string, data?: any): Promise<void> {
    await this.sendNotification({
      userId,
      type: "bot",
      title: `Bot Status: ${botName}`,
      message: `Trading bot ${botName} is now ${status}`,
      priority: "medium",
      data: { botName, status, ...data }
    });
  }

  async sendNewsAlert(userId: number, headline: string, impact: string, sentiment: number): Promise<void> {
    const title = `Market News - ${impact.toUpperCase()} Impact`;
    const sentimentText = sentiment > 0.3 ? "Positive" : sentiment < -0.3 ? "Negative" : "Neutral";
    const message = `${headline} (Sentiment: ${sentimentText})`;

    await this.sendNotification({
      userId,
      type: "news",
      title,
      message,
      priority: impact === "HIGH" ? "high" : "medium",
      data: { headline, impact, sentiment }
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    const unread = await storage.getUnreadNotifications(userId);
    return unread.length;
  }

  async markAsRead(notificationId: number): Promise<void> {
    await storage.markNotificationRead(notificationId);
  }

  async getNotifications(userId: number, limit = 50): Promise<any[]> {
    return await storage.getNotifications(userId, limit);
  }
}

export const notificationService = new NotificationService();

// Initialize default channels
if (process.env.DISCORD_BOT_TOKEN) {
  notificationService.addChannel("discord", {
    type: "discord",
    config: {
      token: process.env.DISCORD_BOT_TOKEN,
      channelId: process.env.DISCORD_CHANNEL_ID
    },
    enabled: true
  });
}

if (process.env.TELEGRAM_BOT_TOKEN) {
  notificationService.addChannel("telegram", {
    type: "telegram",
    config: {
      token: process.env.TELEGRAM_BOT_TOKEN,
      userId: process.env.TELEGRAM_USER_ID
    },
    enabled: true
  });
}