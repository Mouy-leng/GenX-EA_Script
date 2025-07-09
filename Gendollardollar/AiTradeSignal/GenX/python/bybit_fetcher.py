
"""
Bybit API integration for cryptocurrency data
"""

import requests
import pandas as pd
import numpy as np
import hmac
import hashlib
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from config import Config

class BybitDataFetcher:
    """Fetches cryptocurrency data from Bybit API"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.api_key = Config.BYBIT_API_KEY
        self.api_secret = Config.BYBIT_API_SECRET
        self.base_url = Config.BYBIT_BASE_URL
        
    def _generate_signature(self, params: Dict, timestamp: str) -> str:
        """Generate signature for authenticated requests"""
        param_str = timestamp + self.api_key + "5000" + "&".join([f"{k}={v}" for k, v in sorted(params.items())])
        return hmac.new(
            self.api_secret.encode('utf-8'),
            param_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    def _make_request(self, endpoint: str, params: Dict = None, auth_required: bool = False) -> Optional[Dict]:
        """Make API request to Bybit"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if params is None:
                params = {}
                
            headers = {
                'Content-Type': 'application/json'
            }
            
            if auth_required:
                timestamp = str(int(time.time() * 1000))
                headers.update({
                    'X-BAPI-API-KEY': self.api_key,
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-RECV-WINDOW': '5000',
                    'X-BAPI-SIGN': self._generate_signature(params, timestamp)
                })
            
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('retCode') != 0:
                self.logger.error(f"Bybit API error: {data.get('retMsg', 'Unknown error')}")
                return None
                
            return data.get('result', data)
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Request error: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Error making Bybit request: {str(e)}")
            return None
    
    def get_tickers(self, category: str = "spot") -> Optional[List[Dict]]:
        """Get ticker information for all symbols"""
        params = {
            'category': category
        }
        
        data = self._make_request('/v5/market/tickers', params)
        if data and 'list' in data:
            return data['list']
        return None
    
    def get_kline_data(self, symbol: str, interval: str = "D", limit: int = 200, category: str = "spot") -> Optional[pd.DataFrame]:
        """
        Get kline/candlestick data
        
        Args:
            symbol: Trading pair (e.g., 'BTCUSDT')
            interval: Time interval (1, 3, 5, 15, 30, 60, 120, 240, 360, 720, D, W, M)
            limit: Number of records (max 1000)
            category: Product category (spot, linear, inverse, option)
        """
        try:
            params = {
                'category': category,
                'symbol': symbol,
                'interval': interval,
                'limit': limit
            }
            
            data = self._make_request('/v5/market/kline', params)
            
            if not data or 'list' not in data:
                self.logger.error(f"No kline data found for {symbol}")
                return None
            
            # Convert to DataFrame
            klines = data['list']
            df = pd.DataFrame(klines, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume', 'turnover'])
            
            # Convert timestamp to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'].astype(int), unit='ms')
            df.set_index('timestamp', inplace=True)
            df = df.sort_index()
            
            # Convert to numeric
            numeric_columns = ['open', 'high', 'low', 'close', 'volume', 'turnover']
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            self.logger.info(f"Successfully fetched {len(df)} kline records for {symbol}")
            return df
            
        except Exception as e:
            self.logger.error(f"Error fetching kline data for {symbol}: {str(e)}")
            return None
    
    def get_orderbook(self, symbol: str, category: str = "spot", limit: int = 25) -> Optional[Dict]:
        """Get orderbook data"""
        params = {
            'category': category,
            'symbol': symbol,
            'limit': limit
        }
        
        data = self._make_request('/v5/market/orderbook', params)
        return data
    
    def get_recent_trades(self, symbol: str, category: str = "spot", limit: int = 60) -> Optional[List[Dict]]:
        """Get recent trade data"""
        params = {
            'category': category,
            'symbol': symbol,
            'limit': limit
        }
        
        data = self._make_request('/v5/market/recent-trade', params)
        if data and 'list' in data:
            return data['list']
        return None
    
    def get_account_info(self) -> Optional[Dict]:
        """Get account information (requires authentication)"""
        try:
            data = self._make_request('/v5/account/info', auth_required=True)
            return data
        except Exception as e:
            self.logger.error(f"Error fetching account info: {str(e)}")
            return None
    
    def get_wallet_balance(self, account_type: str = "UNIFIED") -> Optional[Dict]:
        """Get wallet balance (requires authentication)"""
        try:
            params = {
                'accountType': account_type
            }
            data = self._make_request('/v5/account/wallet-balance', params, auth_required=True)
            return data
        except Exception as e:
            self.logger.error(f"Error fetching wallet balance: {str(e)}")
            return None
    
    def get_crypto_market_overview(self, symbols: List[str] = None) -> Dict:
        """Get market overview for major cryptocurrencies"""
        if symbols is None:
            symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT']
        
        overview = {}
        
        for symbol in symbols:
            try:
                # Get latest price data
                kline_data = self.get_kline_data(symbol, interval='D', limit=2)
                
                if kline_data is not None and len(kline_data) >= 2:
                    latest = kline_data.iloc[-1]
                    previous = kline_data.iloc[-2]
                    
                    change = latest['close'] - previous['close']
                    change_pct = (change / previous['close']) * 100
                    
                    overview[symbol] = {
                        'price': latest['close'],
                        'change': change,
                        'change_pct': change_pct,
                        'volume': latest['volume'],
                        'high_24h': latest['high'],
                        'low_24h': latest['low']
                    }
                    
            except Exception as e:
                self.logger.error(f"Error fetching overview for {symbol}: {str(e)}")
                continue
        
        return overview
    
    def get_top_gainers_losers(self, category: str = "spot", limit: int = 10) -> Dict:
        """Get top gainers and losers"""
        try:
            tickers = self.get_tickers(category)
            
            if not tickers:
                return {'gainers': [], 'losers': []}
            
            # Filter USDT pairs and calculate price changes
            usdt_pairs = []
            for ticker in tickers:
                if ticker['symbol'].endswith('USDT') and ticker.get('price24hPcnt'):
                    try:
                        change_pct = float(ticker['price24hPcnt']) * 100
                        usdt_pairs.append({
                            'symbol': ticker['symbol'],
                            'price': float(ticker['lastPrice']),
                            'change_pct': change_pct,
                            'volume': float(ticker['volume24h'])
                        })
                    except (ValueError, TypeError):
                        continue
            
            # Sort by percentage change
            gainers = sorted(usdt_pairs, key=lambda x: x['change_pct'], reverse=True)[:limit]
            losers = sorted(usdt_pairs, key=lambda x: x['change_pct'])[:limit]
            
            return {
                'gainers': gainers,
                'losers': losers
            }
            
        except Exception as e:
            self.logger.error(f"Error fetching gainers/losers: {str(e)}")
            return {'gainers': [], 'losers': []}
