# Bybit Trading Signal System

A comprehensive trading signal system that integrates with Bybit's real-time data to generate AI-powered trading signals for MT4/5 Expert Advisors, Discord, and Telegram bots.

## Features

### Core Functionality
- **Real-time Bybit Integration**: WebSocket connections for live market data
- **AI-Powered Signal Generation**: OpenAI GPT-4o and Google Gemini integration
- **Multi-Platform Broadcasting**: Discord, Telegram, and MT4/5 EA support
- **Pattern Recognition**: Advanced technical analysis and pattern detection
- **Comprehensive Logging**: Real-time system monitoring and error tracking

### Dashboard Features
- Real-time market data visualization
- Active signal monitoring
- Bot status tracking
- Recent activity feeds
- System logs with filtering
- Performance metrics and statistics

## Tech Stack

### Backend
- **Node.js & Express**: Server framework
- **TypeScript**: Type safety
- **PostgreSQL**: Database with Drizzle ORM
- **WebSocket**: Real-time communication
- **Bybit API**: Cryptocurrency market data
- **OpenAI API**: AI signal generation
- **Google Gemini API**: Fallback AI service
- **Discord.js**: Discord bot integration
- **Telegram Bot API**: Telegram notifications

### Frontend
- **React 18**: Modern UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling framework
- **shadcn/ui**: Component library
- **Tanstack Query**: Data fetching and caching
- **Wouter**: Lightweight routing
- **WebSocket**: Real-time updates

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-signal-system
   ```

2. **Install dependencies**
   ```bash
   npm install