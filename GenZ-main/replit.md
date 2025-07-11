# Overview

**GenZ Trading Bot Pro** is a next-generation multi-platform trading bot application with AI-powered analysis, real-time market data processing, and comprehensive trading automation. The system integrates multiple trading platforms (Bybit, Capital.com, MT4/MT5), economic data sources, AI analysis, and communication channels (Telegram, Discord) with sophisticated risk management and portfolio analytics.

**Latest Status**: Complete project reorganization completed with clean GenZ folder structure, enhanced documentation, and production-ready deployment configuration.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite build system
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Real-time Communication**: WebSocket connections for live market data

## Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **WebSocket**: Native WebSocket server for real-time data broadcasting
- **Session Management**: PostgreSQL session storage

## Database Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Connection**: Neon Database serverless driver
- **Schema**: Centralized schema definition in `/shared` directory
- **Migrations**: Automated migration system via Drizzle Kit

# Key Components

## Trading Services
- **Multi-platform Support**: Bybit, Capital.com, MT4/MT5 integration
- **Order Management**: Market, limit, and stop orders with risk management
- **Position Tracking**: Real-time P&L calculation and position monitoring
- **Automated Trading**: Bot-based strategies with customizable parameters

## Market Data Services
- **Data Sources**: Alpha Vantage for forex, FRED for economic indicators
- **Real-time Feeds**: WebSocket-based price streaming
- **Historical Data**: Candlestick data storage and retrieval
- **Economic Calendar**: News impact analysis and event tracking

## AI-Powered Analysis
- **Sentiment Analysis**: OpenAI GPT-4o integration for market sentiment
- **Trading Signals**: AI-generated buy/sell recommendations
- **News Analysis**: Automated economic news impact assessment
- **Risk Assessment**: Intelligent risk level categorization

## Notification System
- **Discord Integration**: Trading alerts and bot status updates
- **Telegram Bot**: Command-based interaction and notifications
- **Real-time Alerts**: Position changes, profit targets, and risk warnings

## Authentication & Security
- **User Management**: Username/password authentication
- **API Key Storage**: Encrypted trading platform credentials
- **Session Security**: Secure session management with PostgreSQL storage

# Data Flow

## Trading Flow
1. User configures trading account with platform credentials
2. Market data services fetch real-time prices and economic news
3. AI services analyze market conditions and generate signals
4. Trading bots execute strategies based on configured parameters
5. Position updates broadcast via WebSocket to frontend
6. Notifications sent through Discord/Telegram channels

## Real-time Data Flow
1. Market data services poll external APIs for price updates
2. Updates stored in PostgreSQL database
3. WebSocket server broadcasts changes to connected clients
4. Frontend receives updates and refreshes UI components
5. AI analysis runs continuously on new data

## User Interaction Flow
1. User authenticates and accesses dashboard
2. Configures trading accounts and bot parameters
3. Monitors real-time positions and market data
4. Receives AI-generated insights and recommendations
5. Manages risk through stop-loss and take-profit settings

# External Dependencies

## Market Data APIs
- **Alpha Vantage**: Forex exchange rates and historical data
- **FRED API**: Economic indicators and macroeconomic data
- **News API**: Economic news articles and sentiment data

## Trading Platform APIs
- **Bybit API**: Cryptocurrency and derivatives trading
- **Capital.com API**: CFD and forex trading platform
- **MetaTrader**: MT4/MT5 platform integration

## AI Services
- **OpenAI API**: GPT-4o model for market analysis and news sentiment
- **Custom Analysis**: Support/resistance level detection algorithms

## Communication Services
- **Discord API**: Bot integration for trading notifications
- **Telegram Bot API**: Interactive command-based notifications

## Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket**: Real-time bidirectional communication
- **Express Session**: Session management with PostgreSQL store

# Deployment Strategy

## Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Local PostgreSQL or Neon cloud instance
- **Environment Variables**: API keys and database credentials

## Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Port Configuration**: Single port (5000) for unified serving
- **Static Assets**: Built frontend served from `/dist/public`

## Configuration Management
- **Environment Variables**: API keys, database URLs, bot tokens
- **Schema Management**: Drizzle migrations for database updates
- **Session Storage**: PostgreSQL-backed session management

# Changelog
- June 22, 2025: Complete project reorganization into GenZ folder structure
  - Created comprehensive README.md with features, architecture, and setup guide
  - Organized clean project structure with separated client/server/shared directories
  - Enhanced database schema with proper TypeScript types and validation
  - Implemented complete backend services (AI, trading, market data, notifications)
  - Built professional trading dashboard with real-time WebSocket updates
  - Added deployment configuration and environment setup
  - Removed duplicate files and cleaned up project structure
- June 22, 2025: Initial project setup

# User Preferences

Preferred communication style: Simple, everyday language.