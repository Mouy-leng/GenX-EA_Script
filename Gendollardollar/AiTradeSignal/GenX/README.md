
# GenZ Trading Bot Pro 🚀

A next-generation AI-powered trading bot application with multi-platform support, real-time market data processing, Discord/Telegram integration, and comprehensive trading automation.

## 🌟 Features

### 🤖 AI-Powered Trading
- **OpenAI GPT-4o Integration**: Advanced market sentiment analysis and trading signal generation
- **Gemini AI Enhanced**: Google's Gemini AI for pattern recognition and market insights
- **Smart News Analysis**: Automated economic news impact assessment with sentiment scoring
- **Intelligent Bot Optimization**: AI-driven trading parameter adjustments based on performance

### 📊 Multi-Platform Support
- **Bybit**: Cryptocurrency and derivatives trading
- **Capital.com**: CFD and forex trading platform
- **MT4/MT5**: MetaTrader platform integration
- **Real-time Account Management**: Live balance and position tracking

### 🔄 Real-time Data Processing
- **WebSocket Streaming**: Live market price updates
- **Economic Calendar**: Real-time economic events and news
- **Alpha Vantage Integration**: Forex and commodity data
- **FRED API**: Federal Reserve economic indicators

### 🛡️ Advanced Trading Features
- **Automated Trading Bots**: Multiple strategy support (Scalping, Grid, Momentum, Arbitrage)
- **Risk Management**: Stop-loss, take-profit, and position sizing
- **Portfolio Analytics**: Performance tracking with Sharpe ratio, drawdown analysis
- **Position Management**: Real-time P&L calculation and monitoring
- **Pattern Recognition**: Advanced candlestick patterns, SMC, FVG, and Order Block detection

### 🔔 Smart Notifications
- **Discord Integration**: Trading alerts, bot status updates, and slash commands
- **Telegram Bot**: Command-based interaction and notifications
- **Real-time Alerts**: Position changes, profit targets, risk warnings
- **Multi-channel Support**: Webhook broadcasting and direct API access

## 🏗️ Architecture

### Backend Stack
- **Node.js 20+** with TypeScript and ES modules
- **Express.js** REST API with comprehensive error handling
- **WebSocket** real-time bidirectional communication
- **PostgreSQL 16** with Drizzle ORM for type-safe database operations
- **Session Management** with PostgreSQL-backed storage
- **AI Services** with OpenAI GPT-4o and Gemini integration

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** lightning-fast build system and HMR
- **TanStack Query** for server state management and caching
- **shadcn/ui** with Radix UI primitives for accessible components
- **Tailwind CSS** with CSS variables for consistent theming
- **WebSocket Client** for real-time updates

### Python Pattern Engine
- **Advanced Pattern Detection**: Candlestick patterns, reversals, and market structure
- **Fair Value Gaps (FVG)**: Automated gap detection and analysis
- **Order Block Detection**: Smart money concepts implementation
- **Multi-timeframe Analysis**: 12M, 6M, 3M, 1M, 1W trend confirmation

### External Integrations
- **Trading APIs**: Bybit, Capital.com, MT4/MT5
- **Market Data**: Alpha Vantage, FRED, Financial Modeling Prep
- **AI Services**: OpenAI GPT-4o, Google Gemini
- **Notifications**: Discord, Telegram with webhook support
- **Economic Data**: Trading Economics, News APIs

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)
- Python 3.11+
- API keys for trading platforms and data providers

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   pip install -r python/requirements.txt
   ```

2. **Set up Environment Variables**
   Create a `.env` file with your API keys:
   ```bash
   # Trading Platforms
   BYBIT_API_KEY=your_bybit_api_key
   BYBIT_API_SECRET=your_bybit_secret
   CAPITAL_API_KEY=your_capital_api_key
   CAPITAL_API_SECRET=your_capital_secret
   
   # Market Data
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   FRED_API_KEY=your_fred_key
   TRADING_ECONOMICS_API_KEY=your_trading_economics_key
   
   # AI Services
   OPENAI_API_KEY=your_openai_key
   GEMINI_API_KEY=your_gemini_key
   
   # Notifications
   DISCORD_BOT_TOKEN=your_discord_token
   TELEGRAM_BOT_TOKEN=your_telegram_token
   
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. **Initialize Database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api
   - Discord Dashboard: http://localhost:5000/discord

## 🔑 API Keys Required

### Trading Platforms
- `BYBIT_API_KEY` & `BYBIT_API_SECRET`
- `CAPITAL_API_KEY` & `CAPITAL_API_SECRET`

### Market Data
- `ALPHA_VANTAGE_API_KEY` - Market data and forex rates
- `FRED_API_KEY` - Federal Reserve economic data
- `FINANCIAL_MODELING_PREP_API_KEY` - Financial data

### AI Services
- `OPENAI_API_KEY` - GPT-4o for market analysis
- `GEMINI_API_KEY` - Google Gemini AI

### Notifications
- `DISCORD_BOT_TOKEN` - Discord integration
- `TELEGRAM_BOT_TOKEN` - Telegram bot
- `NEWS_API_KEY` - Economic news

## 📱 Usage

### Dashboard Overview
- **Portfolio Management**: Track total balance, P&L, and performance metrics
- **Active Positions**: Monitor open trades with real-time updates
- **Market Watch**: Live price feeds for major currency pairs and commodities
- **Economic News**: AI-analyzed news with impact ratings

### Trading Bots
- **Create Bots**: Set up automated trading strategies
- **Monitor Performance**: Track bot P&L, win rates, and trade counts
- **Manage Execution**: Start, pause, or stop bots with one click

### Discord Integration
- **Slash Commands**: `/help`, `/market`, `/analyze`, `/alert`, and more
- **Real-time Notifications**: Trading signals and market updates
- **Portfolio Tracking**: Monitor positions and performance
- **Educational Resources**: Learning materials and market insights

### Analytics
- **Performance Metrics**: Sharpe ratio, max drawdown, win rates
- **Trade History**: Detailed transaction records
- **Risk Analysis**: Portfolio exposure and risk assessment

## 🛠️ Development

### Project Structure
```
GenZ/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and configurations
├── server/                # Node.js backend
│   ├── services/          # Business logic
│   │   ├── ai.ts         # OpenAI integration
│   │   ├── gemini.ts     # Gemini AI integration
│   │   ├── trading.ts    # Trading operations
│   │   ├── marketData.ts # Market data processing
│   │   └── notifications.ts # Alert system
│   ├── routes.ts         # API endpoints
│   └── storage.ts        # Database operations
├── python/               # Python pattern engine
│   ├── pattern_engine/   # Advanced pattern detection
│   ├── main.py          # Trading bot entry point
│   └── requirements.txt # Python dependencies
├── shared/               # Shared types and schemas
├── discord/              # Discord bot integration
├── telegram/             # Telegram bot integration
└── docs/                # Documentation
```

### Database Schema
- **Users**: Authentication and user management
- **Trading Accounts**: Platform connections and credentials
- **Positions**: Active and historical trades
- **Trading Bots**: Automated strategy configurations
- **Market Data**: Price history and candlestick data
- **Economic News**: News articles with AI analysis
- **Notifications**: Alert system and user preferences
- **Discord Signals**: Discord bot interaction logs

### API Endpoints
- `GET /api/portfolio` - Portfolio overview
- `POST /api/positions` - Create new position
- `GET /api/bots` - List trading bots
- `POST /api/bots/:id/start` - Start trading bot
- `GET /api/market/:symbol/price` - Real-time prices
- `GET /api/news` - Economic news feed
- `GET /api/discord/analytics` - Discord bot analytics
- `POST /api/signals/send` - Send trading signals

## 🚀 Deployment

### Replit Deployment (Recommended)
1. **Environment Configuration**
   - Add all required API keys to Replit Secrets
   - Configure database connection (Neon PostgreSQL recommended)

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Deploy with Autoscale**
   - Use Replit's autoscale deployment for optimal performance
   - Handles traffic spikes automatically
   - Built-in SSL and domain management

### Manual Deployment
```bash
# Build frontend and backend
npm run build

# Start production server
npm run start
```

## 📊 Performance

- **Real-time Updates**: Sub-second market data processing
- **Concurrent Trading**: Multiple bot execution
- **Scalable Architecture**: Handles thousands of positions
- **Optimized Queries**: Efficient database operations
- **Pattern Recognition**: Advanced technical analysis algorithms

## 🔒 Security

- **API Key Encryption**: Secure storage of trading credentials
- **Rate Limiting**: API protection and request throttling
- **Input Validation**: Comprehensive data sanitization
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete transaction history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Discord**: Join our trading community
- **Telegram**: @GenZTradingBot
- **Email**: support@genztradingbot.pro

## ⚠️ Disclaimer

This software is for educational and research purposes only. Trading involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results. Use at your own risk.

---

**Built with ❤️ by the GenZ Trading Team**
