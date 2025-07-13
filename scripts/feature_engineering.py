import os
import sys
import pandas as pd
import numpy as np
import ta
import argparse

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_features(df):
    """
    Creates features for the machine learning model.
    """
    # Add all technical indicators from the 'ta' library
    df = ta.add_all_ta_features(
        df, open="open", high="high", low="low", close="close", volume="volume", fillna=True
    )

    # Create price-action features
    df['daily_return'] = df['close'].pct_change()
    df['high_low_range'] = df['high'] - df['low']
    df['close_to_sma_20'] = df['close'] / df['trend_sma_fast']

    # Create time-based features
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['hour_of_day'] = df['timestamp'].dt.hour

    # Create target variable (1 if the price goes up in the next period, 0 otherwise)
    df['target'] = (df['close'].shift(-1) > df['close']).astype(int)

    # Drop rows with missing values
    df.dropna(inplace=True)

    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create features for the machine learning model.")
    parser.add_argument("--input", type=str, default="data/sample_data.csv", help="The input CSV file.")
    parser.add_argument("--output", type=str, default="data/features.csv", help="The output CSV file.")
    args = parser.parse_args()

    # Load data
    df = pd.read_csv(args.input)
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Create features
    df = create_features(df)

    # Save the features to a new CSV file
    df.to_csv(args.output, index=False)
    print(f"Features saved to {args.output}")
