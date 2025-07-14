"""
Utility functions for AI models, including technical indicator calculations.
"""

import numpy as np
import pandas as pd
from typing import Tuple

def calculate_rsi(prices: np.ndarray, period: int = 14) -> np.ndarray:
    """
    Calculate the Relative Strength Index (RSI).

    Args:
        prices (np.ndarray): Array of prices.
        period (int): Lookback period for RSI calculation.

    Returns:
        np.ndarray: RSI values.
    """
    delta = np.diff(prices)
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)

    avg_gain = pd.Series(gain).rolling(window=period, min_periods=1).mean()
    avg_loss = pd.Series(loss).rolling(window=period, min_periods=1).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return rsi.fillna(50).values

def calculate_macd(prices: np.ndarray, fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> Tuple[np.ndarray, np.ndarray]:
    """
    Calculate the Moving Average Convergence Divergence (MACD).

    Args:
        prices (np.ndarray): Array of prices.
        fast_period (int): Fast EMA period.
        slow_period (int): Slow EMA period.
        signal_period (int): Signal line EMA period.

    Returns:
        Tuple[np.ndarray, np.ndarray]: MACD line and signal line.
    """
    ema_fast = pd.Series(prices).ewm(span=fast_period, adjust=False).mean()
    ema_slow = pd.Series(prices).ewm(span=slow_period, adjust=False).mean()

    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()

    return macd_line.values, signal_line.values

def calculate_bollinger_bands(prices: np.ndarray, period: int = 20, num_std: int = 2) -> Tuple[np.ndarray, np.ndarray]:
    """
    Calculate Bollinger Bands.

    Args:
        prices (np.ndarray): Array of prices.
        period (int): Lookback period for moving average and standard deviation.
        num_std (int): Number of standard deviations for the bands.

    Returns:
        Tuple[np.ndarray, np.ndarray]: Upper and lower Bollinger Bands.
    """
    sma = pd.Series(prices).rolling(window=period).mean()
    std = pd.Series(prices).rolling(window=period).std()

    upper_band = sma + (std * num_std)
    lower_band = sma - (std * num_std)

    return upper_band.values, lower_band.values
