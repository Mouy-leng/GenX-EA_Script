
import { Express } from 'express';
import { db } from './db.js';
import { users, tradingAccounts, positions, notifications, educationalResources } from '../shared/schema.js';
import { eq, desc, and, or, ilike, count } from 'drizzle-orm';

export function registerRoutes(app: Express) {
  
  // Test route
  app.get('/api/test', async (req, res) => {
    try {
      res.json({ 
        message: 'API is working!', 
        timestamp: new Date().toISOString(),
        database: 'Connected'
      });
    } catch (error) {
      console.error('Test route error:', error);
      res.status(500).json({ error: 'Test route failed' });
    }
  });

  // Database health check
  app.get('/api/db-health', async (req, res) => {
    try {
      const result = await db.select({ count: count() }).from(users);
      res.json({ 
        status: 'healthy', 
        userCount: result[0].count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database health check failed:', error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });

  // Educational Resources Routes
  app.get('/api/educational-resources', async (req, res) => {
    try {
      const { page = '1', limit = '10', search = '', skillLevel, category } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereConditions = [];
      
      if (search) {
        whereConditions.push(
          or(
            ilike(educationalResources.title, `%${search}%`),
            ilike(educationalResources.description, `%${search}%`)
          )
        );
      }
      
      if (skillLevel) {
        whereConditions.push(eq(educationalResources.skillLevel, skillLevel as string));
      }
      
      if (category) {
        whereConditions.push(eq(educationalResources.category, category as string));
      }

      const resources = await db
        .select()
        .from(educationalResources)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(educationalResources.createdAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      const totalCount = await db
        .select({ count: count() })
        .from(educationalResources)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      res.json({
        resources,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0].count,
          totalPages: Math.ceil(totalCount[0].count / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching educational resources:', error);
      res.status(500).json({ error: 'Failed to fetch educational resources' });
    }
  });

  // Trading accounts routes
  app.get('/api/trading-accounts', async (req, res) => {
    try {
      const accounts = await db
        .select()
        .from(tradingAccounts)
        .orderBy(desc(tradingAccounts.createdAt));
      
      res.json({ accounts });
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
      res.status(500).json({ error: 'Failed to fetch trading accounts' });
    }
  });

  // Positions routes
  app.get('/api/positions', async (req, res) => {
    try {
      const activePositions = await db
        .select()
        .from(positions)
        .where(eq(positions.status, 'open'))
        .orderBy(desc(positions.openTime));
      
      res.json({ positions: activePositions });
    } catch (error) {
      console.error('Error fetching positions:', error);
      res.status(500).json({ error: 'Failed to fetch positions' });
    }
  });

  // Notifications routes
  app.get('/api/notifications', async (req, res) => {
    try {
      const recentNotifications = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      res.json({ notifications: recentNotifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // System stats
  app.get('/api/stats', async (req, res) => {
    try {
      const [usersCount, accountsCount, positionsCount, notificationsCount] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(tradingAccounts),
        db.select({ count: count() }).from(positions).where(eq(positions.status, 'open')),
        db.select({ count: count() }).from(notifications)
      ]);

      res.json({
        users: usersCount[0].count,
        tradingAccounts: accountsCount[0].count,
        activePositions: positionsCount[0].count,
        notifications: notificationsCount[0].count,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });
}
