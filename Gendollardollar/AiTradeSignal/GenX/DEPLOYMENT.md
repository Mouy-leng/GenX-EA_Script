
# GenZ Trading Bot Pro - Deployment Guide

## Overview
This guide covers deployment of the consolidated GenZ Trading Bot Pro application with full Discord/Telegram integration, AI-powered trading signals, and advanced pattern recognition.

## Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 16+
- Redis (optional, for caching)
- All required API keys and environment variables

## Environment Variables Setup

### Required API Keys
```bash
# Trading Platform APIs
BYBIT_API_KEY=your_bybit_api_key
BYBIT_API_SECRET=your_bybit_secret
CAPITAL_API_KEY=your_capital_api_key
CAPITAL_API_SECRET=your_capital_secret

# Market Data APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FRED_API_KEY=your_fred_key
TRADING_ECONOMICS_API_KEY=your_trading_economics_key
FINANCIAL_MODELING_PREP_API_KEY=your_fmp_key

# AI Services
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Notification Services
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token

# Database
DATABASE_URL=postgresql://user:password@host:port/database
```

### Setting Up API Keys in Replit
1. Open your Repl workspace
2. Click on the "Secrets" tab in the left sidebar
3. Add each environment variable with its corresponding value
4. Secrets are automatically injected into your application environment

## Database Setup

### 1. Create PostgreSQL Database
```bash
# Initialize database with schema
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 2. Optional: Use Neon Database (Recommended)
- Create a Neon PostgreSQL database
- Copy the connection string to DATABASE_URL
- Run migrations: `npm run db:migrate`

## Build Process

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r python/requirements.txt
```

### 2. Build Application
```bash
npm run build
```

### 3. Type Check
```bash
npm run type-check
```

## Deployment Options

### Option 1: Replit Deployment (Recommended)

#### Configure Replit Deployment
The `.replit` file is pre-configured for optimal autoscale deployment:
```toml
modules = ["nodejs-20", "web", "postgresql-16", "python-3.11"]
run = "npm run dev"

[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

[[ports]]
localPort = 5000
externalPort = 80
```

#### Deploy Steps
1. Configure all environment variables in Replit Secrets
2. Ensure database is set up and migrated
3. Build the application: `npm run build`
4. Click "Deploy" button and select "Autoscale Deployment"
5. Configure deployment settings and deploy

### Option 2: Docker Deployment

#### Single Container
```bash
# Build and run
docker build -t genz-trading-bot .
docker run -p 5000:5000 --env-file .env genz-trading-bot
```

#### Docker Compose (Full Stack)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f genz-app

# Stop services
docker-compose down
```

#### Production with SSL
```bash
# Use production profile with Nginx
docker-compose --profile production up -d
```

### Option 3: Manual VPS Deployment

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-pip

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis (optional)
sudo apt install -y redis-server
```

#### Deploy Application
```bash
# Clone and setup
git clone <repository-url>
cd GenZ-main

# Install dependencies
npm install
pip install -r python/requirements.txt

# Setup database
sudo -u postgres createdb genz_trading
npm run db:migrate

# Build application
npm run build

# Setup systemd service
sudo cp deployment/genz-trading.service /etc/systemd/system/
sudo systemctl enable genz-trading
sudo systemctl start genz-trading
```

## Post-Deployment Verification

### 1. Application Health Checks
```bash
# Basic health check
curl https://your-app.replit.app/api/health

# Database connectivity
curl https://your-app.replit.app/api/analytics/portfolio

# Trading platform connectivity
curl https://your-app.replit.app/api/accounts

# Discord bot status
curl https://your-app.replit.app/api/discord/status
```

### 2. API Endpoints Verification
Test all critical endpoints:
```bash
# Portfolio and analytics
curl https://your-app.replit.app/api/analytics/portfolio
curl https://your-app.replit.app/api/positions/active

# Trading functionality
curl https://your-app.relit.app/api/bots
curl https://your-app.replit.app/api/accounts

# Market data
curl https://your-app.replit.app/api/market
curl https://your-app.replit.app/api/market/watchlist

# News and notifications
curl https://your-app.replit.app/api/news
curl https://your-app.replit.app/api/notifications

# Discord integration
curl https://your-app.replit.app/api/discord/analytics
```

### 3. WebSocket Connections
- Open browser developer tools
- Check for WebSocket connections at `wss://your-app.replit.app/ws`
- Verify real-time data updates

### 4. Discord Bot Verification
- Invite bot to Discord server using OAuth2 URL
- Test slash commands: `/help`, `/market`, `/analyze`
- Verify webhook notifications are working

### 5. Telegram Bot Verification
- Start conversation with bot using `/start`
- Test commands: `/help`, `/status`, `/signals`
- Verify notifications are being sent

## Monitoring and Logs

### Application Logs
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log

# View Discord bot logs
tail -f logs/discord.log

# View trading bot logs
tail -f logs/trading_bot.log
```

### Health Monitoring
```bash
# Monitor system resources
htop

# Check database connections
SELECT * FROM pg_stat_activity WHERE datname = 'genz_trading';

# Monitor Redis (if used)
redis-cli info
```

## Scaling and Performance

### Replit Autoscale Configuration
- **Machine Power**: Start with 1 vCPU, 2GB RAM
- **Max Instances**: Configure based on expected traffic
- **Auto-scaling**: Handles traffic spikes automatically

### Performance Optimization
1. **Database Optimization**
   - Enable connection pooling
   - Add appropriate indexes
   - Use Redis for caching

2. **API Rate Limiting**
   - Configure rate limits per endpoint
   - Implement proper error handling

3. **WebSocket Optimization**
   - Use connection pooling
   - Implement heartbeat mechanism

## Security Considerations

### API Key Management
- Use environment variables for all secrets
- Rotate API keys regularly
- Enable 2FA on all trading accounts

### Database Security
- Use SSL connections
- Implement proper backup strategy
- Regular security updates

### Network Security
- Enable HTTPS/SSL
- Configure firewall rules
- Use reverse proxy (Nginx) for production

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database connectivity
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **API Rate Limiting**
   ```bash
   # Check API usage
   curl -H "Authorization: Bearer $API_KEY" https://api.provider.com/usage
   ```

3. **Discord Bot Not Responding**
   ```bash
   # Check bot permissions and tokens
   curl -H "Authorization: Bot $DISCORD_BOT_TOKEN" https://discord.com/api/users/@me
   ```

4. **Memory Issues**
   ```bash
   # Monitor memory usage
   free -h
   ps aux --sort=-%mem | head
   ```

### Log Analysis
```bash
# Search for errors
grep -i error logs/app.log

# Monitor real-time logs
tail -f logs/app.log | grep -i "trading\|signal\|discord"
```

## Backup and Recovery

### Database Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

### Configuration Backups
```bash
# Backup environment variables
cp .env .env.backup.$(date +%Y%m%d)

# Backup trading bot configurations
tar -czf bot_configs_$(date +%Y%m%d).tar.gz data/
```

## Support and Maintenance

### Regular Maintenance Tasks
1. Update dependencies monthly
2. Review and rotate API keys quarterly
3. Monitor system performance weekly
4. Backup database daily
5. Review trading bot performance weekly

### Getting Help
- Check application logs first
- Review API documentation
- Test individual components
- Contact support with specific error messages

---

**Deployment Complete! 🚀**

Your GenZ Trading Bot Pro is now live with full Discord/Telegram integration, AI-powered analysis, and real-time trading capabilities.
