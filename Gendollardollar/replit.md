# Overview

This is a comprehensive full-stack application with two main components:

1. **Educational Resource Hub** - A React-based platform for organizing educational content by skill level and category
2. **GenZ Trading Bot Pro** - An advanced AI-powered trading bot with multi-platform support, Discord/Telegram integration, and real-time market analysis

The application demonstrates a modern monorepo structure with shared TypeScript schemas, PostgreSQL database integration via Drizzle ORM, and comprehensive API endpoints for both educational resources and trading functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with ES modules and development optimizations

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules throughout
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time**: Native WebSocket server for live data streaming
- **Session Management**: PostgreSQL-backed session storage
- **API Design**: RESTful endpoints with comprehensive error handling

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon Database serverless driver (@neondatabase/serverless)
- **Schema**: Centralized schema definitions in `/shared` directory
- **Migrations**: Automated migration system via Drizzle Kit
- **Structure**: Separate tables for users, trading accounts, positions, market data, notifications, and educational resources

# Key Components

## Educational Platform
- **Resource Management**: CRUD operations for educational resources with filtering, search, and pagination
- **Content Organization**: Skill-based categorization (beginner, intermediate, advanced)
- **Resource Types**: Support for videos, articles, courses, and tutorials
- **User Experience**: Responsive design with loading states and error handling

## Trading Bot System
- **Multi-Platform Support**: Integration with Bybit, Capital.com, and MT4/MT5 platforms
- **AI Integration**: OpenAI GPT-4o and Google Gemini for market analysis and signal generation
- **Real-time Data**: WebSocket-based price streaming and market updates
- **Pattern Recognition**: Advanced technical analysis including FVG, Order Blocks, and candlestick patterns
- **Risk Management**: Automated stop-loss, take-profit, and position sizing

## Notification System
- **Discord Integration**: Comprehensive bot with slash commands, webhooks, and trading alerts
- **Telegram Support**: Bot-based notifications and command interface
- **Real-time Updates**: WebSocket broadcasting for live notifications
- **Multi-channel**: Support for multiple notification channels and user preferences

## AI Services
- **Market Analysis**: Sentiment analysis and trend prediction using OpenAI
- **News Processing**: Automated economic news impact assessment
- **Signal Generation**: AI-powered trading recommendations with confidence scoring
- **Pattern Detection**: Machine learning-based technical pattern recognition

# Data Flow

## Educational Resources
1. User interacts with React frontend components
2. TanStack React Query manages API calls and caching
3. Express routes handle CRUD operations
4. Drizzle ORM provides type-safe database queries
5. PostgreSQL stores resource data with full-text search capabilities

## Trading Operations
1. Market data fetchers collect real-time prices from multiple sources
2. AI services analyze data and generate trading signals
3. Trading services execute orders through platform APIs
4. WebSocket server broadcasts updates to connected clients
5. Notification services send alerts via Discord/Telegram

## Real-time Updates
1. WebSocket connections established on client connection
2. Server-side events trigger broadcasts to all connected clients
3. Client-side React components update based on WebSocket messages
4. Database changes propagate through the system in real-time

# External Dependencies

## Trading Platforms
- **Bybit API**: Cryptocurrency trading and data
- **Capital.com API**: CFD and forex trading
- **Alpha Vantage**: Market data and economic indicators
- **FRED API**: Federal Reserve economic data

## AI Services
- **OpenAI GPT-4o**: Market sentiment analysis and trading signals
- **Google Gemini**: Enhanced pattern recognition and market insights
- **News API**: Economic news fetching and analysis

## Communication
- **Discord API**: Bot functionality and webhook integration
- **Telegram Bot API**: Notification delivery and user interaction
- **WebSocket**: Real-time bidirectional communication

## Development Tools
- **Vite**: Development server and build optimization
- **ESBuild**: Server-side bundling for production
- **Drizzle Kit**: Database migrations and schema management

# Deployment Strategy

## Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: PostgreSQL with Drizzle migrations
- **Environment Variables**: Managed through Replit secrets
- **Real-time Testing**: WebSocket server integrated with development setup

## Production Considerations
- **Build Process**: Vite builds frontend to `/dist/public`, ESBuild bundles server
- **Database**: PostgreSQL with connection pooling via Neon
- **Static Assets**: Served directly from Express with proper caching headers
- **Environment**: Node.js production environment with optimized configurations

## Scaling Architecture
- **Database**: PostgreSQL with indexing on frequently queried fields
- **Caching**: TanStack React Query provides client-side caching
- **WebSocket**: Single WebSocket server with client management
- **API Rate Limiting**: Configured for external API usage limits

The system is designed to be modular and extensible, with clear separation between educational content management and trading functionality, while sharing common infrastructure and database schemas.