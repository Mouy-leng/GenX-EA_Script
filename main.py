import os
import pandas as pd
import joblib

from core.execution.bybit import BybitAPI
from core.patterns.pattern_detector import PatternDetector
from core.strategies.signal_analyzer import SignalAnalyzer
from scripts.feature_engineering import create_features

def get_realtime_data(symbol):
    """
    Fetches real-time market data from Bybit.
    """
    bybit_api = BybitAPI()
    # Fetch 1-hour kline data for the last 200 hours
    market_data = bybit_api.get_market_data(symbol, "60")

    if market_data and market_data.get("retCode") == 0 and market_data.get("result", {}).get("list"):
        kline_data = market_data["result"]["list"]

        # The kline data is returned in reverse chronological order (newest first). We need to reverse it.
        kline_data.reverse() # Oldest first

        # Create a pandas DataFrame from the data.
        df = pd.DataFrame(kline_data, columns=["timestamp", "open", "high", "low", "close", "volume", "turnover"])

        # Convert the timestamp to a datetime object and set it as the index.
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        df.set_index("timestamp", inplace=True)

        # Convert columns to numeric types for calculations
        numeric_cols = ["open", "high", "low", "close", "volume", "turnover"]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col])

        return df
    else:
        print(f"Error fetching market data: {market_data}")
        # Return sample data if fetching fails
        print("Returning sample data.")
        data_dir = "data"
        file_path = os.path.join(data_dir, "sample_data.csv")
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df.set_index("timestamp", inplace=True)
            return df
        else:
            return None

if __name__ == "__main__":
    # Load the trained model
    models_dir = "ai_models"
    model_file_path = os.path.join(models_dir, "market_predictor.joblib")
    model = joblib.load(model_file_path)

    # Get real-time data
    df = get_realtime_data("BTCUSDT")

    if df is not None:
        # Create features
        features_df = create_features(df.copy())

        # Make predictions
        if not features_df.empty:
            X = features_df.drop(columns=['target'])
            predictions = model.predict(X)

            # Add predictions to the DataFrame
            features_df['prediction'] = predictions

            print("Predictions:")
            print(features_df[['close', 'prediction']].tail())
        else:
            print("Not enough data to make predictions.")

        # Generate signals from patterns
        pattern_detector = PatternDetector()
        patterns = pattern_detector.detect_patterns(df)

        signal_analyzer = SignalAnalyzer()
        signals = signal_analyzer.analyze_signals(patterns, df)

        if signals:
            print("Signals generated from patterns:", signals)
        else:
            print("No signals generated from patterns.")
    else:
        print("Could not fetch or load data.")
