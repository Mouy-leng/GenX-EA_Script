import pandas as pd
from typing import List, Dict, Any

# Fair Value Gap (FVG) detection module
# Placeholder for advanced pattern logic

def detect_fvg(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Detect Fair Value Gaps (FVG) in OHLCV data.
    Returns a list of dicts with FVG info (index, gap_high, gap_low).
    """
    fvg_list: List[Dict[str, Any]] = []
    for i in range(2, len(df)):
        prev_high = float(df.iloc[i-2]['high'])
        prev_low = float(df.iloc[i-2]['low'])
        curr_high = float(df.iloc[i]['high'])
        curr_low = float(df.iloc[i]['low'])
        # Bullish FVG: previous high < current low
        if prev_high < curr_low:
            fvg_list.append({
                'index': i,
                'type': 'bullish',
                'gap_high': curr_low,
                'gap_low': prev_high
            })
        # Bearish FVG: previous low > current high
        if prev_low > curr_high:
            fvg_list.append({
                'index': i,
                'type': 'bearish',
                'gap_high': prev_low,
                'gap_low': curr_high
            })
    return fvg_list
