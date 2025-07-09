
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './db.js';
import { setupRoutes } from './routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// PostgreSQL session store
const PgSession = ConnectPgSimple(session);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'trading-bot-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// WebSocket setup
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('WebSocket client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast function for real-time updates
export const broadcast = (data: any) => {
  const message = JSON.stringify(data);
  clients.forEach((client: any) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Setup API routes
setupRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = join(__dirname, '../dist/public');
  app.use(express.static(clientDistPath));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(join(clientDistPath, 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT || '5000', 10);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GenZ Trading Bot Pro is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 WebSocket server ready for real-time connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
