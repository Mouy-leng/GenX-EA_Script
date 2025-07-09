"""
Data fetching module for market data and economic indicators
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time
import logging
from config import Config
from bybit_fetcher import BybitDataFetcher

class DataFetcher:
    """Fetches market data from Alpha Vantage and economic data from FRED"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.av_api_key = Config.ALPHA_VANTAGE_API_KEY
        self.fred_api_key = Config.FRED_API_KEY
        self.bybit_fetcher = BybitDataFetcher()
        
    def fetch_stock_data(self, symbol: str, interval: str = "1min") -> Optional[pd.DataFrame]:
        """
        Fetch stock data from Alpha Vantage
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL')
            interval: Time interval (1min, 5min, 15min, 30min, 60min, daily)
        
        Returns:
            DataFrame with OHLCV data or None if error
        """
        try:
            # Use daily data for more reliable analysis
            if interval == "daily":
                function = "TIME_SERIES_DAILY"
            else:
                function = "TIME_SERIES_INTRADAY"
            
            params = {
                "function": function,
                "symbol": symbol,
                "apikey": self.av_api_key,
                "outputsize": "full"
            }
            
            if interval != "daily":
                params["interval"] = interval
                
            response = requests.get(Config.AV_BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Check for API errors
            if "Error Message" in data:
                self.logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                return None
            
            if "Note" in data:
                self.logger.warning(f"Alpha Vantage API note: {data['Note']}")
                return None
            
            # Extract time series data
            if interval == "daily":
                time_series_key = "Time Series (Daily)"
            else:
                time_series_key = f"Time Series ({interval})"
            
            if time_series_key not in data:
                self.logger.error(f"No time series data found for {symbol}")
                return None
            
            time_series = data[time_series_key]
            
            # Convert to DataFrame
            df = pd.DataFrame.from_dict(time_series, orient='index')
            df.columns = ['open', 'high', 'low', 'close', 'volume']
            df.index = pd.to_datetime(df.index)
            df = df.sort_index()
            
            # Convert to numeric
            for col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            self.logger.info(f"Successfully fetched {len(df)} records for {symbol}")
            return df
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Request error fetching data for {symbol}: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            return None
    
    def fetch_economic_data(self, series_id: str) -> Optional[pd.DataFrame]:
        """
        Fetch economic indicator data from FRED
        
        Args:
            series_id: FRED series ID
        
        Returns:
            DataFrame with economic data or None if error
        """
        try:
            params = {
                "series_id": series_id,
                "api_key": self.fred_api_key,
                "file_type": "json",
                "limit": 100
            }
            
            response = requests.get(Config.FRED_BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if "observations" not in data:
                self.logger.error(f"No observations found for FRED series {series_id}")
                return None
            
            observations = data["observations"]
            
            # Convert to DataFrame
            df = pd.DataFrame(observations)
            df['date'] = pd.to_datetime(df['date'])
            df['value'] = pd.to_numeric(df['value'], errors='coerce')
            df = df.set_index('date')
            df = df.sort_index()
            
            # Remove rows with missing values
            df = df.dropna()
            
            self.logger.info(f"Successfully fetched {len(df)} records for FRED series {series_id}")
            return df
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Request error fetching FRED data for {series_id}: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Error fetching FRED data for {series_id}: {str(e)}")
            return None
    
    def fetch_market_overview(self) -> Dict:
        """
        Fetch market overview data
        
        Returns:
            Dictionary with market overview data
        """
        overview = {}
        
        # Fetch data for major indices
        indices = ["SPY", "QQQ", "DIA", "IWM"]
        
        for index in indices:
            data = self.fetch_stock_data(index, "daily")
            if data is not None and len(data) > 0:
                latest = data.iloc[-1]
                prev = data.iloc[-2] if len(data) > 1 else latest
                
                change = latest['close'] - prev['close']
                change_pct = (change / prev['close']) * 100
                
                overview[index] = {
                    'price': latest['close'],
                    'change': change,
                    'change_pct': change_pct,
                    'volume': latest['volume']
                }
        
        # Add VIX data
        vix_data = self.fetch_economic_data("VIXCLS")
        if vix_data is not None and len(vix_data) > 0:
            overview['VIX'] = {
                'value': vix_data['value'].iloc[-1],
                'date': vix_data.index[-1]
            }
        
        # Add crypto market data from Bybit
        crypto_overview = self.bybit_fetcher.get_crypto_market_overview()
        if crypto_overview:
            overview['CRYPTO'] = crypto_overview
        
        return overview
    
    def get_multiple_stocks_data(self, symbols: List[str]) -> Dict[str, pd.DataFrame]:
        """
        Fetch data for multiple stocks with rate limiting
        
        Args:
            symbols: List of stock symbols
        
        Returns:
            Dictionary mapping symbols to DataFrames
        """
        data = {}
        
        for i, symbol in enumerate(symbols):
            try:
                df = self.fetch_stock_data(symbol, "daily")
                if df is not None:
                    data[symbol] = df
                
                # Rate limiting - Alpha Vantage allows 5 requests per minute
                if i < len(symbols) - 1:
                    time.sleep(12)  # Wait 12 seconds between requests
                    
            except Exception as e:
                self.logger.error(f"Error fetching data for {symbol}: {str(e)}")
                continue
        
        return data
