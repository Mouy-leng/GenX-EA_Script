# Overview

This is a comprehensive trading signal system that integrates with Bybit's real-time market data to generate AI-powered trading signals. The system broadcasts these signals to multiple platforms including Discord, Telegram, and MT4/5 Expert Advisors. It features real-time data processing, pattern recognition, and a modern web dashboard for monitoring and management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live market data and notifications

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules throughout the application
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: Native WebSocket server for live data streaming
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **API Design**: RESTful endpoints with comprehensive error handling and logging

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe queries
- **Connection**: Neon Database serverless driver (@neondatabase/serverless)
- **Schema**: Centralized schema definitions in `/shared` directory
- **Migrations**: Automated migration system via Drizzle Kit
- **Tables**: Comprehensive schema covering trading signals, market data, system logs, bot status, MT4/5 connections, and signal transmissions

# Key Components

## Trading Signal System
- **AI-Powered Analysis**: Integration with OpenAI GPT-4o and Google Gemini for market sentiment analysis
- **Signal Generation**: Automated buy/sell/hold recommendations based on technical analysis
- **Risk Management**: Confidence levels, stop-loss, and target price calculations
- **Multi-Platform Broadcasting**: Simultaneous signal distribution to Discord, Telegram, and MT4/5

## Market Data Integration
- **Bybit WebSocket**: Real-time cryptocurrency price feeds and market data
- **Data Storage**: Persistent storage of market data with historical tracking
- **Symbol Coverage**: Multiple trading pairs including BTCUSDT, ETHUSDT, ADAUSDT, SOLUSDT, BNBUSDT
- **Live Updates**: WebSocket-based real-time data streaming to frontend

## Bot Communication Services
- **Discord Integration**: Discord.js-based bot with rich embed notifications and slash commands
- **Telegram Bot**: Node-telegram-bot-api for command-based interactions and alerts
- **MT4/5 Expert Advisor**: HTTP API endpoint for MetaTrader platform integration
- **Status Monitoring**: Real-time bot health checking and heartbeat monitoring

## Pattern Recognition
- **Technical Analysis**: Advanced candlestick pattern detection and recognition
- **AI Enhancement**: Machine learning-based pattern analysis using OpenAI and Gemini
- **Signal Confidence**: Intelligent confidence scoring based on multiple indicators
- **Historical Performance**: Pattern success rate tracking and optimization

# Data Flow

## Real-time Market Data Flow
1. **WebSocket Connection**: Bybit WebSocket streams live market data
2. **Data Processing**: Raw market data is processed and validated
3. **Database Storage**: Market data is stored in PostgreSQL with timestamps
4. **WebSocket Broadcast**: Processed data is sent to connected frontend clients
5. **AI Analysis**: Market data triggers AI analysis for signal generation

## Signal Generation and Distribution
1. **AI Analysis**: OpenAI GPT-4o analyzes market data and generates trading signals
2. **Signal Validation**: Confidence levels and risk parameters are calculated
3. **Database Storage**: Signals are stored with full metadata and reasoning
4. **Multi-Platform Broadcast**: Signals are simultaneously sent to Discord, Telegram, and MT4/5
5. **Transmission Tracking**: All signal transmissions are logged for audit purposes

## Dashboard Real-time Updates
1. **WebSocket Server**: Backend maintains WebSocket connections with frontend
2. **Event Broadcasting**: New signals, market data, and logs are broadcast in real-time
3. **State Synchronization**: Frontend maintains synchronized state with backend
4. **Live Monitoring**: Real-time dashboard updates without page refresh

# External Dependencies

## AI Services
- **OpenAI API**: GPT-4o model for advanced market analysis and signal generation
- **Google Gemini**: Backup AI service for pattern recognition and sentiment analysis
- **API Key Management**: Secure environment variable storage for API credentials

## Trading Platform APIs
- **Bybit WebSocket API**: Real-time market data streaming and order book updates
- **Authentication**: API key and secret management for secure connections
- **Rate Limiting**: Proper handling of API rate limits and connection management

## Communication Services
- **Discord API**: Bot integration using Discord.js with full guild permissions
- **Telegram Bot API**: Command-based bot interactions and message broadcasting
- **WebSocket Protocol**: Real-time bidirectional communication between client and server

## Database and Storage
- **PostgreSQL**: Primary database for persistent data storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Session Storage**: PostgreSQL-backed session management for user state

# Deployment Strategy

## Development Environment
- **Local Development**: Vite dev server with Express backend
- **TypeScript Compilation**: Real-time TypeScript compilation with error reporting
- **Hot Module Replacement**: Instant frontend updates during development
- **Database Migrations**: Automated schema updates using Drizzle Kit

## Production Deployment
- **Build Process**: Vite builds optimized frontend assets, esbuild bundles backend
- **Static Assets**: Frontend assets served from `/dist/public` directory
- **Process Management**: Node.js production server with proper error handling
- **Environment Variables**: Secure API key and database credential management

## Database Management
- **Schema Migrations**: Automated database schema updates via `drizzle-kit push`
- **Connection Pooling**: Efficient database connection management
- **Backup Strategy**: Regular database backups and disaster recovery planning
- **Performance Monitoring**: Query performance tracking and optimization

## Monitoring and Logging
- **System Logs**: Comprehensive logging system with different log levels
- **Error Tracking**: Centralized error handling and reporting
- **Performance Metrics**: Real-time system performance monitoring
- **Bot Health Monitoring**: Automated bot status checking and alerting