# GenZ Trading Bot Pro - Next Generation

This repository is now scaffolded for next-generation features as described in the README:
- Modular Python pattern engine (`python/pattern_engine/`)
- Modern React/Vite/TypeScript frontend (`client/`)
- Node.js backend (`server/`)
- Shared types/schemas (`shared/`)
- Docker and docker-compose for multi-service deployment
- Example .env for all required secrets and configuration

## Next Steps
- Implement pattern detection logic in Python modules
- Connect backend to Python via REST or process
- Build out broker integrations and notification services
- Expand frontend dashboard and analytics

See README.md for full details and usage instructions.

# GenZ Trading Bot Pro - Deployment Guide

## Overview
This guide covers deployment of the GenZ Trading Bot Pro application on Replit's autoscale platform.

## Prerequisites
- Replit account with deployment access
- All required API keys and environment variables
- PostgreSQL database (Neon recommended)

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

# AI Services
OPENAI_API_KEY=your_openai_key

# Notification Services
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token

# Database
DATABASE_URL=postgresql://user:pass@host:port/database
```

## Database Setup

### 1. Create Neon Database
```bash
# Create database
npm run db:generate
npm run db:migrate
```

### 2. Seed Initial Data
```bash
# Optional: seed with demo data
npm run db:seed
```

## Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
npm run build
```

### 3. Type Check
```bash
npm run type-check
```

## Deployment Steps

### 1. Configure Replit Deployment
The `.replit` file is already configured for autoscale deployment:
```toml
run = "npm run dev"
modules = ["nodejs-20", "web"]

[[ports]]
localPort = 5000
externalPort = 80

[deployment]
run = ["npm", "run", "start"]
deploymentTarget = "autoscale"
```

### 2. Environment Variables
Set all required environment variables in the Replit Secrets tab.

### 3. Deploy
Click the "Deploy" button in Replit or use the CLI:
```bash
replit deploy
```

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-app.replit.app/api/market/status
```

### 2. WebSocket Connection
Verify real-time data is working by checking the dashboard.

### 3. API Endpoints
Test key endpoints:
- `/api/analytics/portfolio`
- `/api/positions/active`
- `/api/bots`
- `/api/market`

## Monitoring

### Application Logs
Monitor logs through Replit's dashboard or:
```bash
replit logs
```

### Performance Metrics
- Response times
- Memory usage
- Active WebSocket connections
- Trading bot performance

## Security Considerations

### API Key Management
- Store all keys in Replit Secrets
- Never commit keys to version control
- Rotate keys regularly

### Database Security
- Use SSL connections
- Implement proper access controls
- Regular backups

### Rate Limiting
- Monitor API usage
- Implement request throttling
- Handle rate limit errors gracefully

## Scaling

### Autoscale Configuration
Replit autoscale automatically handles:
- Traffic spikes
- Resource allocation
- Load balancing

### Performance Optimization
- Database query optimization
- WebSocket connection pooling
- Caching strategies

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Verify DATABASE_URL
   - Check network connectivity
   - Ensure database is running

2. **API Key Errors**
   - Verify all keys are set
   - Check key permissions
   - Monitor rate limits

3. **WebSocket Issues**
   - Check port configuration
   - Verify firewall settings
   - Monitor connection counts

### Debug Mode
Enable debug logging:
```bash
NODE_ENV=development npm start
```

## Backup and Recovery

### Database Backups
```bash
# Automated backups through Neon
# Manual backup
pg_dump $DATABASE_URL > backup.sql
```

### Configuration Backup
- Export environment variables
- Backup deployment configuration
- Document API integrations

## Support

### Resources
- [Replit Deployment Docs](https://docs.replit.com/hosting/deployments)
- [Neon Database Docs](https://neon.tech/docs)
- [Project Documentation](./README.md)

### Contact
- GitHub Issues for bugs
- Discord community for support
- Email: support@genztradingbot.pro