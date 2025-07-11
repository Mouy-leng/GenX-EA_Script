import {
  users, tradingAccounts, positions, tradingBots, marketData,
  economicNews, notifications, watchlist, trades,
  type User, type InsertUser, type TradingAccount, type InsertTradingAccount,
  type Position, type InsertPosition, type TradingBot, type InsertTradingBot,
  type MarketData, type InsertMarketData, type EconomicNews, type InsertEconomicNews,
  type Notification, type InsertNotification, type Watchlist, type InsertWatchlist,
  type Trade, type InsertTrade
} from "../shared/schema.js";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trading Accounts
  getTradingAccounts(userId: number): Promise<TradingAccount[]>;
  getTradingAccount(id: number): Promise<TradingAccount | undefined>;
  createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount>;
  updateTradingAccount(id: number, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined>;

  // Positions
  getPositions(userId: number): Promise<Position[]>;
  getActivePositions(userId: number): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, updates: Partial<Position>): Promise<Position | undefined>;

  // Trading Bots
  getTradingBots(userId: number): Promise<TradingBot[]>;
  getTradingBot(id: number): Promise<TradingBot | undefined>;
  createTradingBot(bot: InsertTradingBot): Promise<TradingBot>;
  updateTradingBot(id: number, updates: Partial<TradingBot>): Promise<TradingBot | undefined>;

  // Market Data
  getMarketData(symbol: string, timeframe: string, limit?: number): Promise<MarketData[]>;
  insertMarketData(data: InsertMarketData): Promise<MarketData>;
  getLatestPrice(symbol: string): Promise<MarketData | undefined>;

  // Economic News
  getEconomicNews(limit?: number): Promise<EconomicNews[]>;
  insertEconomicNews(news: InsertEconomicNews): Promise<EconomicNews>;

  // Notifications
  getNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;

  // Watchlist
  getWatchlist(userId: number): Promise<Watchlist[]>;
  addToWatchlist(item: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, symbol: string): Promise<void>;

  // Trades
  getTrades(userId: number, limit?: number): Promise<Trade[]>;
  getTradesByBot(botId: number): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, updates: Partial<Trade>): Promise<Trade | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tradingAccounts: Map<number, TradingAccount> = new Map();
  private positions: Map<number, Position> = new Map();
  private tradingBots: Map<number, TradingBot> = new Map();
  private marketData: Map<string, MarketData[]> = new Map();
  private economicNews: Map<number, EconomicNews> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private watchlist: Map<number, Watchlist> = new Map();
  private trades: Map<number, Trade> = new Map();
  
  private currentUserId = 1;
  private currentAccountId = 1;
  private currentPositionId = 1;
  private currentBotId = 1;
  private currentDataId = 1;
  private currentNewsId = 1;
  private currentNotificationId = 1;
  private currentWatchlistId = 1;
  private currentTradeId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with demo user
    const demoUser: User = {
      id: 1,
      username: "demo",
      password: "demo",
      email: "demo@tradingbot.pro",
      plan: "pro",
      createdAt: new Date(),
    };
    this.users.set(1, demoUser);
    this.currentUserId = 2;

    // Initialize demo trading account
    const demoAccount: TradingAccount = {
      id: 1,
      userId: 1,
      platform: "bybit",
      accountId: "demo_account",
      apiKey: null,
      apiSecret: null,
      isActive: true,
      balance: "10000.00",
      equity: "10000.00",
      marginUsed: "0.00",
      createdAt: new Date(),
    };
    this.tradingAccounts.set(1, demoAccount);
    this.currentAccountId = 2;

    // Initialize demo economic news
    const demoNews: EconomicNews[] = [
      {
        id: 1,
        headline: "Fed Officials Signal Potential Rate Cuts in Q2 2024",
        summary: "Federal Reserve officials hint at possible interest rate reductions following inflation data",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 2 * 60 * 1000),
        impact: "HIGH",
        currency: "USD",
        category: "Monetary Policy",
        url: null,
        sentiment: "0.3",
      },
      {
        id: 2,
        headline: "European Markets Rally on Positive GDP Data",
        summary: "European equities surge as eurozone GDP beats expectations",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 15 * 60 * 1000),
        impact: "MEDIUM",
        currency: "EUR",
        category: "Economic Growth",
        url: null,
        sentiment: "0.7",
      },
      {
        id: 3,
        headline: "Oil Prices Steady Ahead of OPEC+ Meeting",
        summary: "Crude oil futures remain stable as traders await production decisions",
        source: "MarketWatch",
        publishedAt: new Date(Date.now() - 32 * 60 * 1000),
        impact: "LOW",
        currency: null,
        category: "Commodities",
        url: null,
        sentiment: "0.1",
      },
    ];

    demoNews.forEach(news => this.economicNews.set(news.id, news));
    this.currentNewsId = 4;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      plan: "free",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Trading Accounts
  async getTradingAccounts(userId: number): Promise<TradingAccount[]> {
    return Array.from(this.tradingAccounts.values()).filter(acc => acc.userId === userId);
  }

  async getTradingAccount(id: number): Promise<TradingAccount | undefined> {
    return this.tradingAccounts.get(id);
  }

  async createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount> {
    const id = this.currentAccountId++;
    const newAccount: TradingAccount = { 
      ...account, 
      id,
      balance: account.balance || "0",
      equity: account.equity || "0", 
      marginUsed: account.marginUsed || "0",
      isActive: account.isActive ?? true,
      createdAt: new Date()
    };
    this.tradingAccounts.set(id, newAccount);
    return newAccount;
  }

  async updateTradingAccount(id: number, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined> {
    const account = this.tradingAccounts.get(id);
    if (!account) return undefined;
    const updated = { ...account, ...updates };
    this.tradingAccounts.set(id, updated);
    return updated;
  }

  // Positions
  async getPositions(userId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(pos => pos.userId === userId);
  }

  async getActivePositions(userId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(pos => pos.userId === userId && pos.isOpen);
  }

  async getPosition(id: number): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const id = this.currentPositionId++;
    const newPosition: Position = { 
      ...position,
      id, 
      currentPrice: position.currentPrice || null,
      pnl: position.pnl || "0",
      pnlPercent: position.pnlPercent || "0",
      stopLoss: position.stopLoss || null,
      takeProfit: position.takeProfit || null,
      openTime: new Date(),
      isOpen: position.isOpen ?? true 
    };
    this.positions.set(id, newPosition);
    return newPosition;
  }

  async updatePosition(id: number, updates: Partial<Position>): Promise<Position | undefined> {
    const position = this.positions.get(id);
    if (!position) return undefined;
    const updated = { ...position, ...updates };
    this.positions.set(id, updated);
    return updated;
  }

  // Trading Bots
  async getTradingBots(userId: number): Promise<TradingBot[]> {
    return Array.from(this.tradingBots.values()).filter(bot => bot.userId === userId);
  }

  async getTradingBot(id: number): Promise<TradingBot | undefined> {
    return this.tradingBots.get(id);
  }

  async createTradingBot(bot: InsertTradingBot): Promise<TradingBot> {
    const id = this.currentBotId++;
    const newBot: TradingBot = { 
      ...bot,
      id,
      status: bot.status || "stopped",
      dailyPnl: bot.dailyPnl || "0",
      totalPnl: bot.totalPnl || "0",
      tradesCount: bot.tradesCount || 0,
      winRate: bot.winRate || "0",
      maxDrawdown: bot.maxDrawdown || "0",
      createdAt: new Date(),
      lastRun: null 
    };
    this.tradingBots.set(id, newBot);
    return newBot;
  }

  async updateTradingBot(id: number, updates: Partial<TradingBot>): Promise<TradingBot | undefined> {
    const bot = this.tradingBots.get(id);
    if (!bot) return undefined;
    const updated = { ...bot, ...updates };
    this.tradingBots.set(id, updated);
    return updated;
  }

  // Market Data
  async getMarketData(symbol: string, timeframe: string, limit = 100): Promise<MarketData[]> {
    const key = `${symbol}-${timeframe}`;
    const data = this.marketData.get(key) || [];
    return data.slice(-limit);
  }

  async insertMarketData(data: InsertMarketData): Promise<MarketData> {
    const id = this.currentDataId++;
    const newData: MarketData = { 
      ...data, 
      id,
      volume: data.volume || "0"
    };
    const key = `${data.symbol}-${data.timeframe}`;
    const existing = this.marketData.get(key) || [];
    existing.push(newData);
    this.marketData.set(key, existing);
    return newData;
  }

  async getLatestPrice(symbol: string): Promise<MarketData | undefined> {
    const data = await this.getMarketData(symbol, "1m", 1);
    return data[0];
  }

  // Economic News
  async getEconomicNews(limit = 20): Promise<EconomicNews[]> {
    const news = Array.from(this.economicNews.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    return news.slice(0, limit);
  }

  async insertEconomicNews(news: InsertEconomicNews): Promise<EconomicNews> {
    const id = this.currentNewsId++;
    const newNews: EconomicNews = { 
      ...news, 
      id,
      summary: news.summary || null,
      currency: news.currency || null,
      category: news.category || null,
      url: news.url || null,
      sentiment: news.sentiment || null
    };
    this.economicNews.set(id, newNews);
    return newNews;
  }

  // Notifications
  async getNotifications(userId: number, limit = 50): Promise<Notification[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return userNotifications.slice(0, limit);
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId && !notif.isRead);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = { 
      ...notification,
      id,
      isRead: notification.isRead ?? false,
      priority: notification.priority || "medium",
      data: notification.data || null,
      createdAt: new Date() 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  // Watchlist
  async getWatchlist(userId: number): Promise<Watchlist[]> {
    return Array.from(this.watchlist.values()).filter(item => item.userId === userId);
  }

  async addToWatchlist(item: InsertWatchlist): Promise<Watchlist> {
    const id = this.currentWatchlistId++;
    const newItem: Watchlist = { 
      ...item,
      id,
      description: item.description || null,
      addedAt: new Date() 
    };
    this.watchlist.set(id, newItem);
    return newItem;
  }

  async removeFromWatchlist(userId: number, symbol: string): Promise<void> {
    const item = Array.from(this.watchlist.values())
      .find(w => w.userId === userId && w.symbol === symbol);
    if (item) {
      this.watchlist.delete(item.id);
    }
  }

  // Trades
  async getTrades(userId: number, limit = 100): Promise<Trade[]> {
    const userTrades = Array.from(this.trades.values())
      .filter(trade => trade.userId === userId)
      .sort((a, b) => b.openTime.getTime() - a.openTime.getTime());
    return userTrades.slice(0, limit);
  }

  async getTradesByBot(botId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(trade => trade.botId === botId);
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const id = this.currentTradeId++;
    const newTrade: Trade = { 
      ...trade,
      id,
      exitPrice: trade.exitPrice || null,
      pnl: trade.pnl || null,
      commission: trade.commission || "0",
      closeTime: trade.closeTime || null,
      status: trade.status || "open",
      openTime: new Date() 
    };
    this.trades.set(id, newTrade);
    return newTrade;
  }

  async updateTrade(id: number, updates: Partial<Trade>): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade) return undefined;
    const updated = { ...trade, ...updates };
    this.trades.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();