import numpy as np
from .moving_average import calculate_ema

def calculate_macd(prices, fast_period=12, slow_period=26, signal_period=9):
    """
    Calculates the Moving Average Convergence Divergence (MACD).
    """
    fast_ema = calculate_ema(prices, fast_period)
    slow_ema = calculate_ema(prices, slow_period)

    # Adjust for the different lengths of the EMAs
    macd_line = fast_ema[len(fast_ema)-len(slow_ema):] - slow_ema

    signal_line = calculate_ema(macd_line, signal_period)

    # Adjust for the different lengths of the signal line
    histogram = macd_line[len(macd_line)-len(signal_line):] - signal_line

    return macd_line, signal_line, histogram
