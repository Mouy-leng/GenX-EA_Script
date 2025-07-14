import os

import sys

import pandas as pd

import numpy as np

import joblib

import argparse

# Add the project root to the Python path

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.money_management import calculate_position_size

def backtest(df, model, risk_percentage=None, stop_loss_percentage=None, take_profit_percentage=None, trailing_stop_percentage=None):

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

        row = df.iloc[i:i+1].drop(columns=['timestamp', 'target'])

        if position == 0:

            if model.predict(row)[0] == 1:

                if risk_percentage is not None:

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

                    position = balance / current_price

                    balance = 0

                    trades.append({'timestamp': df.iloc[i]['timestamp'], 'type': 'buy', 'price': current_price, 'position': position, 'balance': balance})

        else:

            if risk_percentage is not None:

                trailing_stop_price = max(trailing_stop_price, current_price * (1 - trailing_stop_percentage / 100))

                if model.predict(row)[0] == 0 or current_price <= trailing_stop_price or current_price >= take_profit_price:

                    balance += position * current_price

                    position = 0

                    trades.append({'timestamp': df.iloc[i]['timestamp'], 'type': 'sell', 'price': current_price, 'position': position, 'balance': balance})

            else:

                if model.predict(row)[0] == 0:

                    balance = position * current_price

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

    parser.add_argument("--model", type=str, help="The full path to the trained model file.")

    parser.add_argument("--model_name", type=str, help="The model name (used if --model not provided).")

    parser.add_argument("--risk", type=float, help="Risk percentage per trade.")

    parser.add_argument("--stop_loss", type=float, help="Stop loss percentage.")

    parser.add_argument("--take_profit", type=float, help="Take profit percentage.")

    parser.add_argument("--trailing_stop", type=float, help="Trailing stop percentage.")

    

    args = parser.parse_args()

    # Load the features

    df = pd.read_csv(args.features)

    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Load the model

    if args.model:

        model = joblib.load(args.model)

    elif args.model_name:

        model_path = os.path.join("ai_models", f"{args.model_name}_market_predictor.joblib")

        model = joblib.load(model_path)

    else:

        raise ValueError("You must provide either --model or --model_name")

    # Run the backtest

    trades = backtest(

        df,

        model,

        risk_percentage=args.risk,

        stop_loss_percentage=args.stop_loss,

        take_profit_percentage=args.take_profit,

        trailing_stop_percentage=args.trailing_stop

    )

    # Save trades to CSV

    trades_df = pd.DataFrame(trades)

    os.makedirs("data", exist_ok=True)

    trades_df.to_csv("data/trades.csv", index=False)

    print("Trades saved to data/trades.csv")