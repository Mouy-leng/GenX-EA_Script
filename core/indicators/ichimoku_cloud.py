import pandas as pd

def calculate_ichimoku_cloud(high, low, close):
    """
    Calculates the Ichimoku Cloud.
    """
    # Tenkan-sen (Conversion Line)
    tenkan_sen = (high.rolling(window=9).max() + low.rolling(window=9).min()) / 2

    # Kijun-sen (Base Line)
    kijun_sen = (high.rolling(window=26).max() + low.rolling(window=26).min()) / 2

    # Senkou Span A (Leading Span A)
    senkou_span_a = ((tenkan_sen + kijun_sen) / 2).shift(26)

    # Senkou Span B (Leading Span B)
    senkou_span_b = ((high.rolling(window=52).max() + low.rolling(window=52).min()) / 2).shift(26)

    # Chikou Span (Lagging Span)
    chikou_span = close.shift(-26)

    return tenkan_sen, kijun_sen, senkou_span_a, senkou_span_b, chikou_span
