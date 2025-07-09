
-- GenZ Trading Bot Pro Database Initialization

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE trade_status AS ENUM ('open', 'closed', 'pending', 'cancelled');
CREATE TYPE bot_status AS ENUM ('active', 'inactive', 'paused', 'error');
CREATE TYPE signal_type AS ENUM ('buy', 'sell', 'hold', 'exit');
CREATE TYPE notification_type AS ENUM ('trade', 'alert', 'news', 'bot_status');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Trading accounts table
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    environment VARCHAR(10) DEFAULT 'demo',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading bots table
CREATE TABLE IF NOT EXISTS trading_bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    strategy VARCHAR(50) NOT NULL,
    status bot_status DEFAULT 'inactive',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run_at TIMESTAMP WITH TIME ZONE
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES trading_bots(id) ON DELETE SET NULL,
    account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    size DECIMAL(18, 8) NOT NULL,
    entry_price DECIMAL(18, 8) NOT NULL,
    current_price DECIMAL(18, 8),
    exit_price DECIMAL(18, 8),
    stop_loss DECIMAL(18, 8),
    take_profit DECIMAL(18, 8),
    pnl DECIMAL(18, 8) DEFAULT 0,
    pnl_percentage DECIMAL(8, 4) DEFAULT 0,
    status trade_status DEFAULT 'open',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    open_price DECIMAL(18, 8) NOT NULL,
    high_price DECIMAL(18, 8) NOT NULL,
    low_price DECIMAL(18, 8) NOT NULL,
    close_price DECIMAL(18, 8) NOT NULL,
    volume DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, timeframe, timestamp)
);

-- Trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    signal_type signal_type NOT NULL,
    strength INTEGER CHECK (strength >= 1 AND strength <= 10),
    price DECIMAL(18, 8) NOT NULL,
    stop_loss DECIMAL(18, 8),
    take_profit DECIMAL(18, 8),
    reasoning TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Economic news table
CREATE TABLE IF NOT EXISTS economic_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    source VARCHAR(100),
    url VARCHAR(500),
    sentiment_score DECIMAL(4, 3),
    impact_rating INTEGER CHECK (impact_rating >= 1 AND impact_rating <= 5),
    symbols VARCHAR(100)[],
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    sent_discord BOOLEAN DEFAULT false,
    sent_telegram BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discord bot interactions table
CREATE TABLE IF NOT EXISTS discord_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL,
    guild_id VARCHAR(50),
    channel_id VARCHAR(50) NOT NULL,
    command VARCHAR(100) NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern analysis table
CREATE TABLE IF NOT EXISTS pattern_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL,
    confidence DECIMAL(4, 3) NOT NULL,
    prediction VARCHAR(20) NOT NULL,
    target_price DECIMAL(18, 8),
    analysis_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timeframe ON market_data(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at);
CREATE INDEX IF NOT EXISTS idx_economic_news_published_at ON economic_news(published_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_interactions_user_id ON discord_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_analysis_symbol ON pattern_analysis(symbol, timeframe);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON trading_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON trading_bots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, preferences) VALUES 
('admin', 'admin@genz-trading.com', '$2b$10$rHzQQQQQQQQQQQQQQQQQQu', '{"theme": "dark", "notifications": true}'::jsonb)
ON CONFLICT (username) DO NOTHING;

COMMIT;
