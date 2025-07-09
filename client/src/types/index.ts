export interface MarketData {
  id: number;
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

export interface TradingSignal {
  id: number;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice?: number;
  stopLoss?: number;
  status: 'pending' | 'executed' | 'cancelled';
  aiReasoning?: string;
  technicalIndicators?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLog {
  id: number;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
  service: string;
  metadata?: any;
  timestamp: string;
}

export interface BotStatus {
  id: number;
  botName: string;
  status: 'active' | 'inactive' | 'error' | 'limited';
  lastHeartbeat: string;
  metadata?: any;
}

export interface MT45Connection {
  id: number;
  eaName: string;
  connectionId: string;
  status: 'connected' | 'disconnected' | 'error';
  lastActivity: string;
  metadata?: any;
}

export interface SignalTransmission {
  id: number;
  signalId: number;
  destination: 'discord' | 'telegram' | 'mt45';
  destinationId?: string;
  status: 'sent' | 'failed' | 'pending';
  response?: string;
  sentAt: string;
}

export interface DashboardStats {
  totalSignals: number;
  signalsToday: number;
  successRate: number;
  activeBots: number;
}

export interface WebSocketMessage {
  type: 'market_data' | 'new_signal' | 'new_log' | 'bot_status' | 'initial_data';
  data: any;
}
