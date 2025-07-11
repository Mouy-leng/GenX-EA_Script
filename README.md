
# GenZ Trading Platform

A comprehensive AI-powered trading platform with multi-platform support, real-time data processing, automated trading capabilities, and advanced pattern recognition algorithms.

## 🚀 Features

- **Multi-platform Trading**: Bybit, Capital.com, MT4/MT5 integration
- **AI-powered Analysis**: OpenAI GPT-4o for market sentiment and signals
- **Real-time Data**: WebSocket-based price streaming and updates
- **Pattern Recognition**: Advanced technical analysis algorithms using Python
- **Notification System**: Discord and Telegram bot integration
- **Educational Resources**: Learning materials and tutorials
- **Live Trading Signals**: Automated signal generation and distribution

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Radix UI + shadcn/ui)
│   │   ├── pages/          # Page components for different features
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── types/          # TypeScript type definitions
├── server/                 # Node.js backend API
│   ├── shared/             # Database schema definitions
│   ├── db.ts              # Neon PostgreSQL configuration
│   ├── index.ts           # Express server entry point
│   ├── routes.ts          # API routes
│   └── debug.ts           # Debugging middleware
├── shared/                 # Shared TypeScript types and schemas
├── python/                 # Python trading algorithms and ML models
│   ├── pattern_engine/     # Advanced pattern detection algorithms
│   │   ├── pattern_detector.py    # Technical pattern recognition
│   │   ├── signal_analyzer.py     # Trading signal analysis
│   │   └── market_predictor.py    # Market prediction models
│   ├── models/            # ML model storage
│   ├── main.py            # Python service entry point
│   └── requirements.txt   # Python dependencies
└── scripts/               # Build and deployment scripts
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Node.js, Express, Socket.io, TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **AI/ML**: Python, OpenAI API, NumPy, Pandas
- **Real-time**: WebSocket connections for live data
- **UI Components**: Comprehensive component library with dark/light themes

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL database (Neon recommended)

### Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r python/requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Configure your database URL, API keys, and other secrets.

4. **Initialize the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

This will start both the React frontend (port 5173) and Node.js backend concurrently.

## 📊 Core Modules

### Trading Integrations
- **Bybit Integration**: Real-time market data and trading execution
- **MT4/MT5 Signals**: Professional trading signal integration
- **Capital.com**: Additional trading platform support

### AI & Analytics
- **Pattern Recognition**: Advanced technical analysis using Python
- **Market Prediction**: ML-based market forecasting
- **Signal Analysis**: Automated trading signal generation
- **AI Services**: OpenAI integration for market sentiment

### Communication
- **Discord Bot**: Rich trading signals with embeds
- **Telegram Bot**: Real-time signal distribution
- **Real-time Dashboard**: Live trading data visualization

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start both client and server
npm run client          # Start only React frontend
npm run server          # Start only Node.js backend

# Database
npm run db:generate     # Generate database migrations
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Drizzle Studio

# Build & Deploy
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## 🐍 Python Services

The Python services handle advanced trading algorithms and pattern recognition:

```bash
# Run Python pattern recognition
cd python && python main.py

# Install Python dependencies
pip install -r python/requirements.txt
```

## 🌐 API Endpoints

- `GET /api/health` - Health check
- `GET /api/trading-bots` - List trading bots
- `POST /api/trading-bots` - Create new bot
- `GET /api/patterns` - Pattern analysis results
- `WebSocket /ws` - Real-time data stream

## 🎨 UI Components

Built with a comprehensive component library including:
- Forms, Tables, Charts, Dialogs
- Navigation, Sidebars, Tabs
- Cards, Badges, Buttons, Inputs
- Toast notifications, Loading states
- Responsive design with mobile support

## 📈 Trading Features

- **Real-time Market Data**: Live price feeds from multiple exchanges
- **Automated Trading Bots**: Customizable trading strategies
- **Risk Management**: Built-in stop-loss and take-profit mechanisms
- **Portfolio Tracking**: Real-time portfolio performance monitoring
- **Signal Distribution**: Multi-channel signal broadcasting

## 🔒 Security

- Environment variable management for API keys
- Secure database connections
- Input validation and sanitization
- Rate limiting and error handling

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private trading platform. For development questions or feature requests, please contact the development team.

---

**Note**: This platform is designed for educational and development purposes. Always conduct thorough testing before using with real trading accounts.
