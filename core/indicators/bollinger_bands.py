import pandas as pd

def calculate_bollinger_bands(close, period=20, std_dev=2):
    """
    Calculates the Bollinger Bands.
    """
    sma = close.rolling(window=period).mean()
    std = close.rolling(window=period).std()
    upper_band = sma + (std * std_dev)
    lower_band = sma - (std * std_dev)
    return upper_band, lower_band
