import os
import sys
import argparse
import pandas as pd
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.execution.capital import CapitalCom

def clean_data(df):
    """
    Cleans the historical market data.
    - Fills missing values using forward fill.
    - Removes outliers based on the interquartile range (IQR).
    """
    df.ffill(inplace=True)
    for col in ["open", "high", "low", "close", "volume"]:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
    return df

def download_historical_data(symbol, interval, start_time, end_time):
    """
    Downloads historical market data from Capital.com and saves it to a CSV file.
    """
    capital_com_api = CapitalCom()
    all_data = []

    current_time = start_time
    while current_time < end_time:
        try:
            data = capital_com_api.get_market_data(symbol, interval, limit=1000, startTime=current_time)
            if data:
                kline_data = data
                all_data.extend(kline_data)
                last_timestamp = int(kline_data[-1][0])
                if last_timestamp >= end_time:
                    break
                current_time = last_timestamp
            else:
                print(f"Error fetching data: No data returned")
                break
        except Exception as e:
            print(f"An error occurred: {e}")
            break

    if all_data:
        df = pd.DataFrame(all_data, columns=["timestamp", "open", "high", "low", "close", "volume", "turnover"])
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        df = clean_data(df)
        data_dir = "data"
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        file_path = os.path.join(data_dir, f"{symbol}_{interval}.csv")
        df.to_csv(file_path, index=False)
        print(f"Data saved to {file_path}")
    else:
        print("No data downloaded.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download historical market data from Capital.com.")
    parser.add_argument("--symbol", type=str, default="GOLD", help="The trading symbol (e.g., GOLD).")
    parser.add_argument("--interval", type=str, default="60", help="The candle interval (e.g., 60 for 1-hour).")
    parser.add_argument("--start", type=str, default="2020-01-01", help="The start date (YYYY-MM-DD).")
    parser.add_argument("--end", type=str, default="2024-01-01", help="The end date (YYYY-MM-DD).")
    args = parser.parse_args()

    start_time = int(datetime.strptime(args.start, "%Y-%m-%d").timestamp() * 1000)
    end_time = int(datetime.strptime(args.end, "%Y-%m-%d").timestamp() * 1000)

    download_historical_data(args.symbol, args.interval, start_time, end_time)
