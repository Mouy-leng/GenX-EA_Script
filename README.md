
# GenZ Trading Platform

A comprehensive AI-powered trading platform with multi-platform support, real-time data processing, and automated trading capabilities.

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Node.js backend API
│   ├── shared/             # Database schema
│   ├── db.ts              # Database configuration
│   ├── index.ts           # Server entry point
│   └── routes.ts          # API routes
├── shared/                 # Shared TypeScript types and schemas
├── python/                 # Python trading algorithms and pattern recognition
│   ├── pattern_engine/     # Advanced pattern detection
│   └── requirements.txt    # Python dependencies
└── scripts/               # Build and deployment scripts
```

## Features

- **Multi-platform Trading**: Bybit, Capital.com, MT4/MT5 integration
- **AI-powered Analysis**: OpenAI GPT-4o for market sentiment and signals
- **Real-time Data**: WebSocket-based price streaming and updates
- **Pattern Recognition**: Advanced technical analysis algorithms
- **Notification System**: Discord and Telegram integration
- **Educational Resources**: Learning materials and tutorials

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL with Drizzle ORM
- **AI/ML**: Python, OpenAI API
- **Real-time**: WebSocket connections
