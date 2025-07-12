import numpy as np

def calculate_sma(prices, period):
    """
    Calculates the Simple Moving Average (SMA).
    """
    return np.convolve(prices, np.ones(period)/period, mode='valid')

def calculate_ema(prices, period):
    """
    Calculates the Exponential Moving Average (EMA).
    """
    return np.convolve(prices, np.ones(period)/period, mode='valid')
