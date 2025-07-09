
import { Express } from 'express';
import { db } from './db.js';
import { 
  users, 
  tradingAccounts, 
  positions, 
  tradingBots, 
  marketData, 
  economicNews,
  notifications,
  discordSignals 
} from '../shared/schema.js';
import { desc, eq, and, gte } from 'drizzle-orm';
import { broadcast } from './index.js';

export function setupRoutes(app: Express) {
  
  // Portfolio Analytics
  app.get('/api/analytics/portfolio', async (req, res) => {
    try {
      const [totalBalance, totalPnl, activePositionsCount] = await Promise.all([
        db.select().from(tradingAccounts),
        db.select().from(positions).where(eq(positions.status, 'open')),
        db.select().from(positions).where(eq(positions.status, 'open'))
      ]);

      const balance = totalBalance.reduce((sum, account) => sum + parseFloat(account.balance), 0);
      const pnl = totalPnl.reduce((sum, position) => sum + parseFloat(position.unrealizedPnl || '0'), 0);

      res.json({
        totalBalance: balance,
        totalPnl: pnl,
        activePositions: activePositionsCount.length,
        performance: {
          daily: 2.45,
          weekly: 12.8,
          monthly: 34.2
        }
      });
    } catch (error) {
      console.error('Portfolio analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio data' });
    }
  });

  // Active Positions
  app.get('/api/positions/active', async (req, res) => {
    try {
      const activePositions = await db
        .select()
        .from(positions)
        .where(eq(positions.status, 'open'))
        .orderBy(desc(positions.createdAt))
        .limit(50);

      res.json(activePositions);
    } catch (error) {
      console.error('Active positions error:', error);
      res.status(500).json({ error: 'Failed to fetch active positions' });
    }
  });

  // Trading Bots
  app.get('/api/bots', async (req, res) => {
    try {
      const bots = await db
        .select()
        .from(tradingBots)
        .orderBy(desc(tradingBots.createdAt));

      res.json(bots);
    } catch (error) {
      console.error('Trading bots error:', error);
      res.status(500).json({ error: 'Failed to fetch trading bots' });
    }
  });

  // Start/Stop Trading Bot
  app.post('/api/bots/:id/:action', async (req, res) => {
    try {
      const { id, action } = req.params;
      
      if (!['start', 'stop'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const status = action === 'start' ? 'running' : 'stopped';
      
      await db
        .update(tradingBots)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(tradingBots.id, parseInt(id)));

      // Broadcast update to connected clients
      broadcast({
        type: 'bot_status_update',
        botId: id,
        status,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, status });
    } catch (error) {
      console.error('Bot action error:', error);
      res.status(500).json({ error: 'Failed to update bot status' });
    }
  });

  // Market Data
  app.get('/api/market', async (req, res) => {
    try {
      const marketData = await db
        .select()
        .from(marketData as any)
        .orderBy(desc((marketData as any).timestamp))
        .limit(100);

      res.json(marketData);
    } catch (error) {
      console.error('Market data error:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // Economic News
  app.get('/api/news', async (req, res) => {
    try {
      const news = await db
        .select()
        .from(economicNews)
        .orderBy(desc(economicNews.publishedAt))
        .limit(20);

      res.json(news);
    } catch (error) {
      console.error('News error:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // Notifications
  app.get('/api/notifications', async (req, res) => {
    try {
      const notifications = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      res.json(notifications);
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Discord Analytics
  app.get('/api/discord/analytics', async (req, res) => {
    try {
      const signals = await db
        .select()
        .from(discordSignals)
        .orderBy(desc(discordSignals.createdAt))
        .limit(100);

      const analytics = {
        totalSignals: signals.length,
        todaySignals: signals.filter(s => 
          new Date(s.createdAt).toDateString() === new Date().toDateString()
        ).length,
        signalTypes: signals.reduce((acc, signal) => {
          acc[signal.signalType] = (acc[signal.signalType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(analytics);
    } catch (error) {
      console.error('Discord analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch Discord analytics' });
    }
  });

  // Trading Accounts
  app.get('/api/accounts', async (req, res) => {
    try {
      const accounts = await db
        .select()
        .from(tradingAccounts)
        .orderBy(desc(tradingAccounts.createdAt));

      res.json(accounts);
    } catch (error) {
      console.error('Accounts error:', error);
      res.status(500).json({ error: 'Failed to fetch trading accounts' });
    }
  });
}
