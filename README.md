# 🚀 GenX Trading Platform - Advanced AI-Powered Trading System

<div align="left">
  <a href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.remote-server" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/VS%20Code-Install%20Server-blue?style=flat" alt="VS Code Install Server">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ms-vscode.remote-server-insiders" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/VS%20Code%20Insiders-Install%20Server-green?style=flat" alt="VS Code Insiders Install Server">
  </a>
</div>

[![Open in VS Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/Mouy-leng/GenX-EA_Script)

[![Open in VS Code Insiders](https://open.vscode.dev/badges/open-in-vscode-insiders.svg)](https://open.vscode.dev/Mouy-leng/GenX-EA_Script)

[![GitHub License](https://img.shields.io/github/license/Mouy-leng/GenX-EA_Script)](https://github.com/Mouy-leng/GenX-EA_Script/blob/main/LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-green)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-red)](https://fastapi.tiangolo.com/)
[![AI](https://img.shields.io/badge/AI-Gemini%20Powered-orange)](https://ai.google.dev/)

A comprehensive AI-powered trading platform that leverages machine learning, social sentiment analysis, multi-source news aggregation, and real-time market data to generate intelligent trading signals and execute trades across multiple exchanges.

## ✨ Key Features

### 🤖 **AI-Powered Analysis**
- **Gemini AI Integration**: Advanced market sentiment analysis and signal generation
- **Ensemble ML Models**: Multiple machine learning algorithms for robust predictions
- **Pattern Recognition**: Advanced candlestick and harmonic pattern detection
- **Real-time Training**: Continuous model improvement with live market data

### 📱 **Social Sentiment Analysis**
- **Reddit Integration**: Monitor 12+ trading subreddits including WSB, r/investing, r/cryptocurrency
- **Trending Tickers**: Real-time extraction of trending stocks and crypto mentions
- **Sentiment Scoring**: Advanced sentiment analysis with emoji tracking (🚀, 💎, 📈)
- **Social Signals**: Convert social media buzz into actionable trading signals

### 📰 **Multi-Source News Aggregation**
- **5+ News Sources**: NewsAPI, Alpha Vantage, Finnhub, NewsData.io, FMP
- **Real-time Monitoring**: Continuous financial news monitoring and filtering
- **Sentiment Analysis**: AI-powered news sentiment scoring
- **Market Impact**: Correlate news events with market movements

### 📡 **Real-Time Market Data**
- **WebSocket Streams**: Live data from Bybit, Binance, Coinbase
- **Multi-Exchange**: Unified data interface across multiple exchanges
- **Auto-Reconnection**: Robust connection handling with retry logic
- **Data Normalization**: Consistent data format across all sources

### 🔧 **Professional Infrastructure**
- **FastAPI Backend**: High-performance async API with comprehensive endpoints
- **Production Docker**: Multi-service containerized deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **DigitalOcean Ready**: One-click VPS deployment scripts

## 🏗️ Architecture

```
GenX-EA_Script/
├── 🤖 ai_models/               # AI models and ensemble learning
│   ├── ensemble_model.py       # Multi-algorithm ensemble model
│   ├── market_predictor.py     # Market prediction models
│   └── *.joblib               # Trained model files
├── 🌐 api/                    # FastAPI backend
│   ├── routers/               # API endpoints
│   ├── services/              # Business logic services
│   │   ├── gemini_service.py  # Gemini AI integration
│   │   ├── reddit_service.py  # Reddit social signals
│   │   ├── news_service.py    # Multi-source news
│   │   └── websocket_service.py # Real-time market data
│   ├── models/                # Pydantic models
│   └── middleware/            # Auth and security
├── 🧠 core/                   # Trading logic
│   ├── indicators/            # Technical indicators
│   ├── patterns/              # Pattern recognition
│   ├── strategies/            # Trading strategies
│   └── risk_management.py     # Risk management
├── 📊 expert-advisors/        # MT5 Expert Advisors
│   └── mt5_ea/               # Professional MT5 EAs
├── 🔧 services/               # Background services
│   ├── ai_trainer.py         # Continuous model training
│   ├── discord_bot.py        # Discord notifications
│   └── telegram_bot.py       # Telegram notifications
├── 🚀 deploy/                 # Deployment scripts
│   ├── digitalocean.yml      # DigitalOcean App Platform
│   └── setup-vps.sh          # VPS setup script
└── 📋 amp-plugins/            # AMP plugin definitions
    ├── gemini-integration.md  # Gemini AI plugin
    ├── reddit-signals.md     # Reddit plugin
    ├── news-aggregator.md    # News plugin
    └── websocket-streams.md  # WebSocket plugin
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/Mouy-leng/GenX-EA_Script.git
cd GenX-EA_Script
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your API keys (see configuration section below)
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Development Server
```bash
# Local development
python -m uvicorn api.main:app --reload

# Or with Docker
docker-compose up -d
```

### 5. Access Services
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔑 Configuration

### Required API Keys

#### AI & Analysis
```bash
# Gemini AI (Primary)
GEMINI_API_KEY=your-gemini-api-key

# News Sources
NEWSDATA_API_KEY=your-newsdata-key
ALPHAVANTAGE_API_KEY=your-alphavantage-key
NEWSAPI_ORG_KEY=your-newsapi-key
FINNHUB_API_KEY=your-finnhub-key
FMP_API_KEY=your-fmp-key

# Reddit Integration
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USERNAME=your-reddit-username
REDDIT_PASSWORD=your-reddit-password
```

#### Trading & Notifications
```bash
# Exchange APIs
BYBIT_API_KEY=your-bybit-api-key
BYBIT_API_SECRET=your-bybit-api-secret

# Notifications
DISCORD_TOKEN=your-discord-token
TELEGRAM_TOKEN=your-telegram-token
```

### Feature Flags
```bash
# Enable/Disable Features
ENABLE_NEWS_ANALYSIS=true
ENABLE_REDDIT_ANALYSIS=true
ENABLE_WEBSOCKET_FEED=true
API_PROVIDER=gemini
```

## 📡 API Endpoints

### AI & Analysis
- `POST /api/v1/predictions/` - Generate AI predictions
- `GET /api/v1/predictions/model/metrics` - Model performance metrics
- `POST /api/v1/predictions/model/retrain` - Trigger model retraining

### Social Sentiment
- `GET /api/v1/reddit/crypto-sentiment` - Crypto sentiment from Reddit
- `GET /api/v1/reddit/stock-sentiment` - Stock sentiment analysis
- `GET /api/v1/reddit/wsb-sentiment` - WSB-specific sentiment & tickers

### News & Market Data
- `GET /api/v1/news/crypto` - Cryptocurrency news
- `GET /api/v1/news/stocks/{symbol}` - Stock-specific news
- `GET /api/v1/news/sentiment` - News sentiment analysis

### Trading
- `GET /api/v1/trading/signals` - Active trading signals
- `POST /api/v1/trading/orders` - Place trading orders
- `GET /api/v1/trading/portfolio` - Portfolio status

### WebSocket
- `GET /api/v1/websocket/status` - Connection status
- `POST /api/v1/websocket/subscribe` - Subscribe to symbol
- `DELETE /api/v1/websocket/unsubscribe` - Unsubscribe from symbol

## 🎯 AMP Integration Commands

### Complete Update Command
```bash
amp update \
  --env .env \
  --set api_provider=gemini \
  --add-dependency google-generativeai \
  --add-dependency praw \
  --add-dependency newsapi-python \
  --add-dependency alpha-vantage \
  --add-dependency finnhub-python \
  --add-env GEMINI_API_KEY=$GEMINI_API_KEY \
  --add-env NEWSDATA_API_KEY=$NEWSDATA_API_KEY \
  --add-env ALPHAVANTAGE_API_KEY=$ALPHAVANTAGE_API_KEY \
  --add-env REDDIT_CLIENT_ID=$REDDIT_CLIENT_ID \
  --add-env REDDIT_CLIENT_SECRET=$REDDIT_CLIENT_SECRET \
  --add-env REDDIT_USERNAME=$REDDIT_USERNAME \
  --add-env REDDIT_PASSWORD=$REDDIT_PASSWORD \
  --description "Complete AI & data integration with Gemini, Reddit, News & WebSocket"
```

### Individual Plugin Commands
```bash
# Gemini AI Integration
amp plugin install gemini-integration --source genx-trading --enable-service gemini_service

# Reddit Social Signals
amp plugin install reddit-signals --source genx-trading --enable-service reddit_service

# Multi-Source News
amp plugin install news-aggregator --source genx-trading --enable-service news_service

# WebSocket Market Streams
amp plugin install websocket-streams --source genx-trading --enable-service websocket_service
```

## 🚢 Production Deployment

### DigitalOcean VPS (Recommended)
```bash
# On your DigitalOcean droplet
git clone https://github.com/Mouy-leng/GenX-EA_Script.git
cd GenX-EA_Script
sudo bash deploy/setup-vps.sh
```

### Docker Compose
```bash
# Production deployment
docker-compose -f docker-compose.production.yml up -d
```

### DigitalOcean App Platform
```bash
# Deploy using App Platform spec
doctl apps create --spec deploy/digitalocean.yml
```

## 📊 Monitoring & Health

### Health Checks
```bash
# API Health
curl http://localhost:8000/health

# Service Status
curl http://localhost:8000/api/v1/system/status

# Metrics
curl http://localhost:8000/api/v1/system/metrics
```

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Nginx**: Load balancing & SSL termination
- **Logging**: Structured logging with rotation

## 🧪 Testing

### Run Tests
```bash
# All tests
python run_tests.py

# Specific test categories
pytest tests/test_api.py -v
pytest tests/test_services.py -v

# Integration tests
pytest tests/test_integration.py -v
```

### Test Coverage
- API endpoints testing
- Service integration testing
- AI model validation
- WebSocket connection testing
- Error handling validation

## 🔒 Security Features

- **JWT Authentication**: Secure API access
- **API Rate Limiting**: Prevent abuse
- **Input Validation**: Pydantic models
- **HTTPS/SSL**: Secure communication
- **Secret Management**: Environment-based secrets
- **Security Headers**: CORS, CSP, etc.

## 📈 Performance

- **Async Architecture**: High-performance async operations
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis-based caching layer
- **Load Balancing**: Nginx load balancer
- **Auto-scaling**: Kubernetes/Docker Swarm ready

## 📚 Documentation

- **API Documentation**: Available at `/docs` endpoint
- **Integration Guide**: See `INTEGRATION_GUIDE.md`
- **AMP Plugins**: Individual plugin documentation in `amp-plugins/`
- **Deployment Guide**: See `DEPLOYMENT.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Mouy-leng/GenX-EA_Script/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mouy-leng/GenX-EA_Script/discussions)
- **Documentation**: [Full Documentation](https://github.com/Mouy-leng/GenX-EA_Script/wiki)

## 🎉 What's New in v2.0

✅ **Gemini AI Integration** - Advanced market analysis with Google's AI  
✅ **Reddit Social Signals** - WSB sentiment & trending ticker extraction  
✅ **Multi-Source News** - 5+ financial news APIs integrated  
✅ **WebSocket Streams** - Real-time data from multiple exchanges  
✅ **Production Ready** - Complete Docker deployment with monitoring  
✅ **AMP Integration** - Plugin-based architecture with AMP commands  

---

## CLI

This project includes a command-line interface (CLI) to help with development and automation. For more information, please see the [GenX CLI README](genx-cli/README.md).

---

**⚡ GenX Trading Platform - Where AI meets Trading Excellence**

*Built with ❤️ by the GenX Trading Team*
