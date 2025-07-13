
"""
Advanced pattern detection for trading signals
"""

import numpy as np
import pandas as pd
from typing import Dict, List
import ta


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
                results[pattern_type] = detector(data.copy())
            except Exception as e:
                print(f"Error detecting {pattern_type} patterns: {e}")
                results[pattern_type] = []

        return results

    def _detect_candlestick_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """
        Detect candlestick patterns using the 'ta' library.
        Note: The 'ta' library does not have direct candlestick pattern detection.
        This is a placeholder for future implementation.
        """
        patterns = []
        return patterns

    def _detect_chart_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """Detect chart patterns like support/resistance, trends"""
        patterns = []

        # Simple trend detection
        if len(data) >= 20:
            data['sma_short'] = ta.trend.sma_indicator(data['close'], window=10)
            data['sma_long'] = ta.trend.sma_indicator(data['close'], window=20)

            # Trend detection
            if data['sma_short'].iloc[-1] > data['sma_long'].iloc[-1] and \
               data['sma_short'].iloc[-2] <= data['sma_long'].iloc[-2]:
                patterns.append({
                    'type': 'bullish_crossover',
                    'timestamp': data.index[-1],
                    'strength': 1,
                    'direction': 'bullish'
                })
            elif data['sma_short'].iloc[-1] < data['sma_long'].iloc[-1] and \
                 data['sma_short'].iloc[-2] >= data['sma_long'].iloc[-2]:
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

        if 'volume' in data.columns and len(data) >= 20:
            data['volume_ma'] = ta.volume.sma_indicator(data['volume'], window=20)

            # Volume spike detection
            for i in range(len(data) - 1):
                if data['volume'].iloc[i] > 2 * data['volume_ma'].iloc[i]:
                    patterns.append({
                        'type': 'volume_spike',
                        'timestamp': data.index[i],
                        'strength': data['volume'].iloc[i] / data['volume_ma'].iloc[i],
                        'direction': 'neutral'
                    })

        return patterns

    def _detect_momentum_patterns(self, data: pd.DataFrame) -> List[Dict]:
        """Detect momentum-based patterns"""
        patterns = []

        if len(data) >= 14:
            data['rsi'] = ta.momentum.rsi(data['close'], window=14)

            # Oversold/Overbought conditions
            for i in range(len(data)):
                if data['rsi'].iloc[i] < 30:
                    patterns.append({
                        'type': 'oversold',
                        'timestamp': data.index[i],
                        'strength': 30 - data['rsi'].iloc[i],
                        'direction': 'bullish'
                    })
                elif data['rsi'].iloc[i] > 70:
                    patterns.append({
                        'type': 'overbought',
                        'timestamp': data.index[i],
                        'strength': data['rsi'].iloc[i] - 70,
                        'direction': 'bearish'
                    })

        return patterns
