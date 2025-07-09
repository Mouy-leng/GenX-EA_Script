"""
Technical analysis module for calculating trading indicators
"""

import pandas as pd
import numpy as np
from typing import Dict, Tuple, Optional
import logging
from config import Config

class TechnicalAnalysis:
    """Implements various technical analysis indicators"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """
        Calculate Relative Strength Index (RSI)
        
        Args:
            prices: Series of closing prices
            period: RSI period (default 14)
        
        Returns:
            Series of RSI values
        """
        try:
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            return rsi
        except Exception as e:
            self.logger.error(f"Error calculating RSI: {str(e)}")
            return pd.Series(index=prices.index)
    
    def calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
        """
        Calculate MACD (Moving Average Convergence Divergence)
        
        Args:
            prices: Series of closing prices
            fast: Fast EMA period
            slow: Slow EMA period
            signal: Signal line EMA period
        
        Returns:
            Dictionary with MACD line, signal line, and histogram
        """
        try:
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            
            macd_line = ema_fast - ema_slow
            signal_line = macd_line.ewm(span=signal).mean()
            histogram = macd_line - signal_line
            
            return {
                'macd': macd_line,
                'signal': signal_line,
                'histogram': histogram
            }
        except Exception as e:
            self.logger.error(f"Error calculating MACD: {str(e)}")
            return {
                'macd': pd.Series(index=prices.index),
                'signal': pd.Series(index=prices.index),
                'histogram': pd.Series(index=prices.index)
            }
    
    def calculate_moving_averages(self, prices: pd.Series, short: int = 20, long: int = 50) -> Dict[str, pd.Series]:
        """
        Calculate short and long moving averages
        
        Args:
            prices: Series of closing prices
            short: Short MA period
            long: Long MA period
        
        Returns:
            Dictionary with short and long moving averages
        """
        try:
            ma_short = prices.rolling(window=short).mean()
            ma_long = prices.rolling(window=long).mean()
            
            return {
                'ma_short': ma_short,
                'ma_long': ma_long
            }
        except Exception as e:
            self.logger.error(f"Error calculating moving averages: {str(e)}")
            return {
                'ma_short': pd.Series(index=prices.index),
                'ma_long': pd.Series(index=prices.index)
            }
    
    def calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: float = 2.0) -> Dict[str, pd.Series]:
        """
        Calculate Bollinger Bands
        
        Args:
            prices: Series of closing prices
            period: Moving average period
            std_dev: Standard deviation multiplier
        
        Returns:
            Dictionary with upper, middle, and lower bands
        """
        try:
            middle = prices.rolling(window=period).mean()
            std = prices.rolling(window=period).std()
            
            upper = middle + (std * std_dev)
            lower = middle - (std * std_dev)
            
            return {
                'upper': upper,
                'middle': middle,
                'lower': lower
            }
        except Exception as e:
            self.logger.error(f"Error calculating Bollinger Bands: {str(e)}")
            return {
                'upper': pd.Series(index=prices.index),
                'middle': pd.Series(index=prices.index),
                'lower': pd.Series(index=prices.index)
            }
    
    def calculate_support_resistance(self, data: pd.DataFrame, window: int = 20) -> Dict[str, float]:
        """
        Calculate support and resistance levels
        
        Args:
            data: DataFrame with OHLCV data
            window: Window for calculating levels
        
        Returns:
            Dictionary with support and resistance levels
        """
        try:
            recent_data = data.tail(window)
            
            # Simple support/resistance calculation
            support = recent_data['low'].min()
            resistance = recent_data['high'].max()
            
            # Calculate pivot points
            pivot = (recent_data['high'].iloc[-1] + recent_data['low'].iloc[-1] + recent_data['close'].iloc[-1]) / 3
            
            return {
                'support': support,
                'resistance': resistance,
                'pivot': pivot
            }
        except Exception as e:
            self.logger.error(f"Error calculating support/resistance: {str(e)}")
            return {'support': 0, 'resistance': 0, 'pivot': 0}
    
    def analyze_stock(self, symbol: str, data: pd.DataFrame) -> Dict:
        """
        Perform comprehensive technical analysis on a stock
        
        Args:
            symbol: Stock symbol
            data: DataFrame with OHLCV data
        
        Returns:
            Dictionary with all technical indicators and analysis
        """
        try:
            if len(data) < 50:
                self.logger.warning(f"Insufficient data for {symbol}: {len(data)} records")
                return {}
            
            closes = data['close']
            latest_close = closes.iloc[-1]
            
            # Calculate all indicators
            rsi = self.calculate_rsi(closes, Config.RSI_PERIOD)
            macd = self.calculate_macd(closes, Config.MACD_FAST_PERIOD, Config.MACD_SLOW_PERIOD, Config.MACD_SIGNAL_PERIOD)
            ma = self.calculate_moving_averages(closes, Config.MA_SHORT_PERIOD, Config.MA_LONG_PERIOD)
            bb = self.calculate_bollinger_bands(closes)
            sr = self.calculate_support_resistance(data)
            
            # Get latest values
            latest_rsi = rsi.iloc[-1] if not rsi.empty else 50
            latest_macd = macd['macd'].iloc[-1] if not macd['macd'].empty else 0
            latest_signal = macd['signal'].iloc[-1] if not macd['signal'].empty else 0
            latest_histogram = macd['histogram'].iloc[-1] if not macd['histogram'].empty else 0
            
            latest_ma_short = ma['ma_short'].iloc[-1] if not ma['ma_short'].empty else latest_close
            latest_ma_long = ma['ma_long'].iloc[-1] if not ma['ma_long'].empty else latest_close
            
            # Calculate price change
            price_change = (latest_close - closes.iloc[-2]) / closes.iloc[-2] * 100 if len(closes) > 1 else 0
            
            # Volume analysis
            avg_volume = data['volume'].rolling(window=20).mean().iloc[-1]
            volume_ratio = data['volume'].iloc[-1] / avg_volume if avg_volume > 0 else 1
            
            analysis = {
                'symbol': symbol,
                'current_price': latest_close,
                'price_change': price_change,
                'volume_ratio': volume_ratio,
                'rsi': latest_rsi,
                'macd': {
                    'macd': latest_macd,
                    'signal': latest_signal,
                    'histogram': latest_histogram
                },
                'moving_averages': {
                    'ma_short': latest_ma_short,
                    'ma_long': latest_ma_long,
                    'price_vs_ma_short': (latest_close - latest_ma_short) / latest_ma_short * 100,
                    'price_vs_ma_long': (latest_close - latest_ma_long) / latest_ma_long * 100
                },
                'bollinger_bands': {
                    'upper': bb['upper'].iloc[-1] if not bb['upper'].empty else latest_close,
                    'middle': bb['middle'].iloc[-1] if not bb['middle'].empty else latest_close,
                    'lower': bb['lower'].iloc[-1] if not bb['lower'].empty else latest_close
                },
                'support_resistance': sr,
                'signals': self._generate_signals(latest_rsi, latest_macd, latest_signal, latest_ma_short, latest_ma_long, latest_close)
            }
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing {symbol}: {str(e)}")
            return {}
    
    def _generate_signals(self, rsi: float, macd: float, signal: float, ma_short: float, ma_long: float, price: float) -> Dict:
        """
        Generate trading signals based on technical indicators
        
        Returns:
            Dictionary with signal information
        """
        signals = []
        
        # RSI signals
        if rsi > Config.RSI_OVERBOUGHT:
            signals.append({"type": "SELL", "reason": f"RSI overbought ({rsi:.1f})", "strength": 0.7})
        elif rsi < Config.RSI_OVERSOLD:
            signals.append({"type": "BUY", "reason": f"RSI oversold ({rsi:.1f})", "strength": 0.7})
        
        # MACD signals
        if macd > signal and macd > 0:
            signals.append({"type": "BUY", "reason": "MACD bullish crossover", "strength": 0.6})
        elif macd < signal and macd < 0:
            signals.append({"type": "SELL", "reason": "MACD bearish crossover", "strength": 0.6})
        
        # Moving average signals
        if price > ma_short > ma_long:
            signals.append({"type": "BUY", "reason": "Price above both MAs", "strength": 0.5})
        elif price < ma_short < ma_long:
            signals.append({"type": "SELL", "reason": "Price below both MAs", "strength": 0.5})
        
        # Determine overall signal
        buy_signals = [s for s in signals if s["type"] == "BUY"]
        sell_signals = [s for s in signals if s["type"] == "SELL"]
        
        if len(buy_signals) > len(sell_signals):
            overall_signal = "BUY"
            confidence = min(sum(s["strength"] for s in buy_signals) / len(buy_signals), 1.0)
        elif len(sell_signals) > len(buy_signals):
            overall_signal = "SELL"
            confidence = min(sum(s["strength"] for s in sell_signals) / len(sell_signals), 1.0)
        else:
            overall_signal = "HOLD"
            confidence = 0.5
        
        return {
            "overall_signal": overall_signal,
            "confidence": confidence,
            "individual_signals": signals,
            "signal_count": {"BUY": len(buy_signals), "SELL": len(sell_signals)}
        }
