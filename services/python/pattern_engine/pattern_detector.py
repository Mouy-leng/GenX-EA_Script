
"""
Advanced pattern detection for trading signals
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import talib


class PatternDetector:
    """
    Advanced pattern recognition for financial markets
    """
    
    def __init__(self):
        self.patterns = {}
        self.initialize_patterns()
    
    def initialize_patterns(self):
        """Initialize pattern detection algorithms"""
        self.patterns = {
            'candlestick': self._detect_candlestick_patterns,
            'chart': self._detect_chart_patterns,
            'volume': self._detect_volume_patterns,
            'momentum': self._detect_momentum_patterns
        }
    
    def detect_patterns(self, data: pd.DataFrame) -> Dict[str, List]:
        """
        Detect all patterns in the given data
        
        Args:
            data: DataFrame with OHLCV data
            
        Returns:
            Dictionary of detected patterns
        """
        results = {}
        
        for pattern_type, detector in self.patterns.items():
            try:
                results[pattern_type] = detector(data)
            except Exception as e:
                print(f"Error detecting {pattern_type} patterns: {e}")
                results[pattern_type] = []
        
        return results
    
    def _detect_candlestick_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """Detect candlestick patterns using TA-Lib"""
        patterns = []
        
        # Common candlestick patterns
        pattern_functions = {
            'doji': talib.CDLDOJI,
            'hammer': talib.CDLHAMMER,
            'shooting_star': talib.CDLSHOOTINGSTAR,
            'engulfing': talib.CDLENGULFING,
            'morning_star': talib.CDLMORNINGSTAR,
            'evening_star': talib.CDLEVENINGSTAR
        }
        
        for pattern_name, pattern_func in pattern_functions.items():
            try:
                result = pattern_func(data['open'], data['high'], data['low'], data['close'])
                signals = np.where(result != 0)[0]
                
                for signal_idx in signals:
                    patterns.append({
                        'type': pattern_name,
                        'timestamp': data.index[signal_idx],
                        'strength': abs(result[signal_idx]),
                        'direction': 'bullish' if result[signal_idx] > 0 else 'bearish'
                    })
            except Exception as e:
                print(f"Error detecting {pattern_name}: {e}")
        
        return patterns
    
    def _detect_chart_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """Detect chart patterns like support/resistance, trends"""
        patterns = []
        
        # Simple trend detection
        close_prices = data['close'].values
        if len(close_prices) >= 20:
            short_ma = talib.SMA(close_prices, timeperiod=10)
            long_ma = talib.SMA(close_prices, timeperiod=20)
            
            # Trend detection
            if short_ma[-1] > long_ma[-1] and short_ma[-2] <= long_ma[-2]:
                patterns.append({
                    'type': 'bullish_crossover',
                    'timestamp': data.index[-1],
                    'strength': 1,
                    'direction': 'bullish'
                })
            elif short_ma[-1] < long_ma[-1] and short_ma[-2] >= long_ma[-2]:
                patterns.append({
                    'type': 'bearish_crossover',
                    'timestamp': data.index[-1],
                    'strength': 1,
                    'direction': 'bearish'
                })
        
        return patterns
    
    def _detect_volume_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """Detect volume-based patterns"""
        patterns = []
        
        if 'volume' in data.columns:
            volume = data['volume'].values
            volume_ma = talib.SMA(volume, timeperiod=20)
            
            # Volume spike detection
            for i in range(len(volume) - 1):
                if volume[i] > 2 * volume_ma[i]:
                    patterns.append({
                        'type': 'volume_spike',
                        'timestamp': data.index[i],
                        'strength': volume[i] / volume_ma[i],
                        'direction': 'neutral'
                    })
        
        return patterns
    
    def _detect_momentum_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """Detect momentum-based patterns"""
        patterns = []
        
        close_prices = data['close'].values
        
        # RSI divergence
        rsi = talib.RSI(close_prices, timeperiod=14)
        
        # Oversold/Overbought conditions
        for i in range(len(rsi)):
            if rsi[i] < 30:
                patterns.append({
                    'type': 'oversold',
                    'timestamp': data.index[i],
                    'strength': 30 - rsi[i],
                    'direction': 'bullish'
                })
            elif rsi[i] > 70:
                patterns.append({
                    'type': 'overbought',
                    'timestamp': data.index[i],
                    'strength': rsi[i] - 70,
                    'direction': 'bearish'
                })
        
        return patterns
