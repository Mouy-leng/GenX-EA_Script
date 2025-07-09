"""
Configuration module for the AI Trading Bot
Manages API keys, settings, and trading parameters
"""

import os
from typing import List, Dict

class Config:
    """Configuration class for trading bot settings"""
    
    # API Keys from environment variables
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    TELEGRAM_USER_ID = os.getenv("TELEGRAM_USER_ID", "1725480922")
    FRED_API_KEY = os.getenv("FRED_API_KEY")
    ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
    TRADING_ECONOMICS_API_KEY = os.getenv("TRADING_ECONOMICS_API_KEY")
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
    GENZ_API_SECRET = os.getenv("GENZ_API_SECRET")
    BYBIT_API_KEY = os.getenv("BYBIT_API_KEY")
    BYBIT_API_SECRET = os.getenv("BYBIT_API_SECRET")
    
    # Trading symbols to monitor
    STOCK_SYMBOLS = [
        "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX",
        "SPY", "QQQ", "IWM", "DIA"  # ETFs for broader market
    ]
    
    # Cryptocurrency symbols to monitor (Bybit)
    CRYPTO_SYMBOLS = [
        "BTCUSDT", "ETHUSDT", "ADAUSDT", "DOTUSDT", "LINKUSDT", 
        "BNBUSDT", "XRPUSDT", "SOLUSDT", "MATICUSDT", "AVAXUSDT"
    ]
    
    # Technical analysis parameters
    RSI_PERIOD = 14
    RSI_OVERBOUGHT = 70
    RSI_OVERSOLD = 30
    
    MACD_FAST_PERIOD = 12
    MACD_SLOW_PERIOD = 26
    MACD_SIGNAL_PERIOD = 9
    
    MA_SHORT_PERIOD = 20
    MA_LONG_PERIOD = 50
    
    # Signal confidence thresholds
    MIN_CONFIDENCE_THRESHOLD = 0.6
    HIGH_CONFIDENCE_THRESHOLD = 0.8
    
    # Risk management
    MAX_SIGNALS_PER_DAY = 10
    SIGNAL_COOLDOWN_HOURS = 4
    
    # Economic indicators from FRED
    FRED_INDICATORS = {
        "GDP": "GDP",
        "INFLATION": "CPIAUCSL",
        "UNEMPLOYMENT": "UNRATE",
        "FEDERAL_FUNDS_RATE": "FEDFUNDS",
        "VIX": "VIXCLS"
    }
    
    # Alpha Vantage API endpoints
    AV_BASE_URL = "https://www.alphavantage.co/query"
    FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"
    BYBIT_BASE_URL = "https://api.bybit.com"
    
    # Logging configuration
    LOG_LEVEL = "INFO"
    LOG_FILE = "trading_bot.log"
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate that all required configuration is present"""
        required_keys = [
            cls.TELEGRAM_BOT_TOKEN,
            cls.TELEGRAM_USER_ID,
            cls.FRED_API_KEY,
            cls.ALPHA_VANTAGE_API_KEY,
            cls.BYBIT_API_KEY,
            cls.BYBIT_API_SECRET
        ]
        
        missing_keys = []
        for key in required_keys:
            if not key or key == "":
                missing_keys.append(key)
        
        if missing_keys:
            print(f"Missing required configuration: {missing_keys}")
            return False
        
        return True
