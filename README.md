# GenZ Trading Platform

A comprehensive AI-powered trading platform with multi-platform support, real-time data processing, automated trading capabilities, and advanced pattern recognition algorithms.

## 🚀 Project Status

This project is currently under active development. Here's a summary of the current status:

**Completed:**

*   **Project Scaffolding:** The project has a well-organized structure, separating the core logic, services, AI models, and other components.
*   **Technical Indicators:** A suite of technical indicators has been implemented and tested, including RSI, MACD, and Moving Averages.
*   **Bybit Integration (Initial):** A module for interacting with the Bybit API has been created. **Note:** There is an ongoing issue with the API key that needs to be resolved to enable real-time data fetching.
*   **AI Model (Proof of Concept):** A Random Forest Classifier has been trained on sample data to predict market movements. This serves as a proof of concept for the AI-powered features.
*   **Colab Notebook:** A Colab notebook has been created to demonstrate the core features of the project, including the technical indicators and pattern detection.

**Next Steps:**

1.  **Resolve Bybit API Key Issue:** The immediate priority is to resolve the `403 Forbidden` error with the Bybit API key to enable real-time data collection.
2.  **Real-time Data Processing:** Integrate the Bybit API with the main application to process real-time market data.
3.  **Signal Generation:** Use the AI model's predictions to generate trading signals.
4.  **Order Execution:** Use the Bybit API to execute trades based on the trading signals.
5.  **Telegram/Discord Bots:** Implement the Telegram and Discord bots to send notifications.
6.  **Scheduling:** Set up a scheduler to run the trading bot at regular intervals.

## 📁 Project Structure

```
genz-trading-backend/
├── core/                        # Core logic (pattern detection, signal generation, etc.)
│   ├── patterns/               # Harmonic, candlestick, etc.
│   ├── indicators/             # RSI, MACD, MA cross, etc.
│   ├── strategies/             # Rule-based or ML-based
│   ├── execution/              # Bybit, MT5, Capital.com trading API integrations
│   └── risk_management.py
│
├── services/                   # Interfaces with outside world
│   ├── websocket_feed.py       # Real-time market data
│   ├── telegram_bot.py         # Signal notifications
│   ├── discord_bot.py
│   ├── scheduler.py            # Cron jobs / event triggers
│   └── notifier.py
│
├── ai_models/                  # Trained AI models, predictors
│   ├── market_predictor.py
│   └── model_utils.py
│
├── api/                        # Optional FastAPI REST server
│   └── main.py                 # Run this to expose AI logic over API
│
├── utils/                      # Logging, .env loading, JSON helpers
│   └── config.py
│
├── .env                        # Secrets (API keys, bot tokens, etc.)
├── requirements.txt
├── main.py                     # Entry point to run engine manually
└── README.md
```

## 🛠️ Technology Stack

- **Backend**: Python
- **AI/ML**: scikit-learn, pandas, numpy
- **API**: FastAPI (optional)
- **Real-time**: WebSocket connections for live data

## 🚀 Getting Started

### Prerequisites
- Python 3.8+

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Configure your Bybit API keys and other secrets.

3. **Run the application:**
   ```bash
   python main.py
   ```

## 🐍 Python Services

The Python services handle advanced trading algorithms and pattern recognition:

```bash
# Download historical data
python scripts/download_data.py

# Generate features
python scripts/feature_engineering.py

# Train the model
python scripts/train_model.py
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private trading platform. For development questions or feature requests, please contact the development team.

CI/CD pipeline configured.

---

**Note**: This platform is designed for educational and development purposes. Always conduct thorough testing before using with real trading accounts.
