import os
import sys
import pandas as pd
import numpy as np
import joblib
import argparse

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def backtest(df, model):
    """
    Backtests the trading strategy.
    """
    initial_balance = 10000
    balance = initial_balance
    position = 0
    trades = []

    for i in range(len(df)):
        if position == 0:
            if model.predict(df.iloc[i:i+1].drop(columns=['timestamp', 'target']))[0] == 1:
                position = balance / df.iloc[i]['close']
                balance = 0
                trades.append({'timestamp': df.iloc[i]['timestamp'], 'type': 'buy', 'price': df.iloc[i]['close'], 'position': position, 'balance': balance})
        else:
            if model.predict(df.iloc[i:i+1].drop(columns=['timestamp', 'target']))[0] == 0:
                balance = position * df.iloc[i]['close']
                position = 0
                trades.append({'timestamp': df.iloc[i]['timestamp'], 'type': 'sell', 'price': df.iloc[i]['close'], 'position': position, 'balance': balance})

    final_balance = balance + position * df.iloc[-1]['close']
    total_return = (final_balance - initial_balance) / initial_balance

    print(f"Final Balance: {final_balance:.2f}")
    print(f"Total Return: {total_return:.2%}")

    return trades

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backtest a trading strategy.")
    parser.add_argument("--features", type=str, default="data/features.csv", help="The input CSV file with features.")
    parser.add_argument("--model", type=str, default="ai_models/random_forest_market_predictor.joblib", help="The trained model file.")
    args = parser.parse_args()

    # Load the features and the model
    df = pd.read_csv(args.features)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    model = joblib.load(args.model)

    # Run the backtest
    trades = backtest(df, model)

    # Save the trades to a CSV file
    trades_df = pd.DataFrame(trades)
    trades_df.to_csv("data/trades.csv", index=False)
    print("Trades saved to data/trades.csv")
