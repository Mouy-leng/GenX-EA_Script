import pandas as pd

def detect_fvg(df: pd.DataFrame):
    """
    Detect Fair Value Gaps (FVG) in OHLCV data.
    Returns a list of dicts with FVG info (index, gap_high, gap_low).
    """
    fvg_list = []
    for i in range(2, len(df)):
        prev_high = df.iloc[i-2]['high']
        prev_low = df.iloc[i-2]['low']
        curr_high = df.iloc[i]['high']
        curr_low = df.iloc[i]['low']
        prev_close = df.iloc[i-1]['close']
        prev_open = df.iloc[i-1]['open']
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

if __name__ == "__main__":
    # Simple test
    data = {
        'open': [1, 2, 3, 7, 8],
        'high': [2, 3, 4, 8, 9],
        'low': [0.5, 1.5, 2.5, 6.5, 7.5],
        'close': [1.8, 2.8, 3.8, 7.8, 8.8]
    }
    df = pd.DataFrame(data)
    result = detect_fvg(df)
    print("FVGs detected:", result)
