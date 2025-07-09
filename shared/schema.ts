
import { pgTable, text, integer, decimal, timestamp, boolean, jsonb, varchar, serial } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Trading Accounts
export const tradingAccounts = pgTable('trading_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  platform: varchar('platform', { length: 50 }).notNull(), // 'bybit', 'capital', 'mt4', 'mt5'
  accountId: varchar('account_id', { length: 100 }).notNull(),
  accountName: varchar('account_name', { length: 200 }),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  isActive: boolean('is_active').default(true),
  apiKey: text('api_key'), // Encrypted
  apiSecret: text('api_secret'), // Encrypted
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Trading Positions
export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').references(() => tradingAccounts.id),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  side: varchar('side', { length: 10 }).notNull(), // 'BUY', 'SELL'
  size: decimal('size', { precision: 15, scale: 8 }).notNull(),
  entryPrice: decimal('entry_price', { precision: 15, scale: 8 }).notNull(),
  currentPrice: decimal('current_price', { precision: 15, scale: 8 }),
  stopLoss: decimal('stop_loss', { precision: 15, scale: 8 }),
  takeProfit: decimal('take_profit', { precision: 15, scale: 8 }),
  unrealizedPnl: decimal('unrealized_pnl', { precision: 15, scale: 2 }),
  realizedPnl: decimal('realized_pnl', { precision: 15, scale: 2 }),
  status: varchar('status', { length: 20 }).default('open'), // 'open', 'closed', 'cancelled'
  platformPositionId: varchar('platform_position_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  closedAt: timestamp('closed_at')
});

// Trading Bots
export const tradingBots = pgTable('trading_bots', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  accountId: integer('account_id').references(() => tradingAccounts.id),
  name: varchar('name', { length: 200 }).notNull(),
  strategy: varchar('strategy', { length: 100 }).notNull(), // 'scalping', 'grid', 'momentum', 'arbitrage'
  symbols: jsonb('symbols').notNull(), // Array of trading symbols
  parameters: jsonb('parameters').notNull(), // Bot-specific parameters
  status: varchar('status', { length: 20 }).default('stopped'), // 'running', 'stopped', 'paused'
  performance: jsonb('performance'), // Performance metrics
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Market Data
export const marketData = pgTable('market_data', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  timeframe: varchar('timeframe', { length: 10 }).notNull(), // '1m', '5m', '1h', '1d'
  open: decimal('open', { precision: 15, scale: 8 }).notNull(),
  high: decimal('high', { precision: 15, scale: 8 }).notNull(),
  low: decimal('low', { precision: 15, scale: 8 }).notNull(),
  close: decimal('close', { precision: 15, scale: 8 }).notNull(),
  volume: decimal('volume', { precision: 20, scale: 8 }),
  timestamp: timestamp('timestamp').notNull()
});

// Economic News
export const economicNews = pgTable('economic_news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  source: varchar('source', { length: 100 }),
  category: varchar('category', { length: 50 }),
  impact: varchar('impact', { length: 20 }), // 'high', 'medium', 'low'
  sentiment: varchar('sentiment', { length: 20 }), // 'positive', 'negative', 'neutral'
  aiAnalysis: jsonb('ai_analysis'), // AI-generated analysis
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // 'trade_signal', 'position_update', 'system_alert'
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  data: jsonb('data'), // Additional notification data
  isRead: boolean('is_read').default(false),
  priority: varchar('priority', { length: 20 }).default('normal'), // 'high', 'normal', 'low'
  createdAt: timestamp('created_at').defaultNow()
});

// Discord Signals
export const discordSignals = pgTable('discord_signals', {
  id: serial('id').primaryKey(),
  guildId: varchar('guild_id', { length: 50 }).notNull(),
  channelId: varchar('channel_id', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 50 }),
  command: varchar('command', { length: 100 }),
  signalType: varchar('signal_type', { length: 50 }), // 'buy', 'sell', 'analysis'
  symbol: varchar('symbol', { length: 20 }),
  data: jsonb('data'), // Signal data and parameters
  response: text('response'), // Bot response
  createdAt: timestamp('created_at').defaultNow()
});

// Educational Resources (from your existing system)
export const educationalResources = pgTable('educational_resources', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  url: varchar('url', { length: 1000 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'video', 'article', 'course', 'tutorial'
  skillLevel: varchar('skill_level', { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags'), // Array of tags
  rating: decimal('rating', { precision: 3, scale: 2 }),
  views: integer('views').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
