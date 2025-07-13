import os
import sys
import pandas as pd
import numpy as np
import joblib
import argparse
from core.money_management import calculate_position_size

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.money_management import calculate_position_size

def backtest(df, model, risk_percentage, stop_loss_percentage, take_profit_percentage, trailing_stop_percentage):
    """
    Backtests the trading strategy.
    """
    initial_balance = 10000
    balance = initial_balance
    position = 0
    trades = []
    entry_price = 0
    trailing_stop_price = 0

    for i in range(len(df)):
        current_price = df.iloc[i]['close']
        if position == 0:
            if model.predict(df.iloc[i:i+1].drop(columns=['timestamp', 'target']))[0] == 1:
                stop_loss_price = current_price * (1 - stop_loss_percentage / 100)
                take_profit_price = current_price * (1 + take_profit_percentage / 100)
                position_size = calculate_position_size(balance, risk_percentage, stop_loss_price, current_price)
                if position_size * current_price <= balance:
                    position = position_size
                    balance -= position * current_price
                    entry_price = current_price
                    trailing_stop_price = current_price * (1 - trailing_stop_percentage / 100)
                    trades.append({'timestamp': df.iloc[i]['timestamp'], 'type': 'buy', 'price': current_price, 'position': position, 'balance': balance})
        else:
            trailing_stop_price = max(trailing_stop_price, current_price * (1 - trailing_stop_percentage / 100))
            if model.predict(df.iloc[i:i+1].drop(columns=['timestamp', 'target']))[0] == 0 or current_price <= trailing_stop_price or current_price >= take_profit_price:
                balance += position * current_price
                position = 0
                trades.append({'timestamp': df.iloc[i]['timestamp'], 'type': 'sell', 'price': current_price, 'position': position, 'balance': balance})

    final_balance = balance + position * df.iloc[-1]['close']
    total_return = (final_balance - initial_balance) / initial_balance

    print(f"Final Balance: {final_balance:.2f}")
    print(f"Total Return: {total_return:.2%}")

    return trades

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backtest a trading strategy.")
    parser.add_argument("--features", type=str, default="data/features.csv", help="The input CSV file with features.")
    parser.add_argument("--model_name", type=str, default="random_forest", help="The name of the model to use.")
    parser.add_argument("--risk", type=float, default=1, help="The risk percentage per trade.")
    parser.add_argument("--stop_loss", type=float, default=2, help="The stop loss percentage.")
    parser.add_argument("--take_profit", type=float, default=4, help="The take profit percentage.")
    parser.add_argument("--trailing_stop", type=float, default=1, help="The trailing stop percentage.")
    args = parser.parse_args()

    # Load the features and the model
    df = pd.read_csv(args.features)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    model_path = os.path.join("ai_models", f"{args.model_name}_market_predictor.joblib")
    model = joblib.load(model_path)

    # Run the backtest
    trades = backtest(df, model, args.risk, args.stop_loss, args.take_profit, args.trailing_stop)

    # Save the trades to a CSV file
    trades_df = pd.DataFrame(trades)
    trades_df.to_csv("data/trades.csv", index=False)
    print("Trades saved to data/trades.csv")
