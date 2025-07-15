import os
import sys
import pandas as pd
import joblib

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.execution.capital import CapitalCom
from core.patterns.pattern_detector import PatternDetector
from core.strategies.signal_analyzer import SignalAnalyzer
from scripts.feature_engineering import create_features

def get_realtime_data(symbol):
    """
    Fetches real-time market data from Capital.com.
    """
    capital_com_api = CapitalCom()
    # Fetch 1-hour kline data for the last 200 hours
    market_data = capital_com_api.get_market_data(symbol, "60")

    if market_data:
        # The Capital.com API returns data in a nested structure.
        # We need to extract the kline data and format it for our pattern detection functions.
        kline_data = market_data

        # The kline data is returned in reverse chronological order. We need to reverse it.
        kline_data.reverse()

        # Create a pandas DataFrame from the data.
        df = pd.DataFrame(kline_data, columns=["timestamp", "open", "high", "low", "close", "volume", "turnover"])

        # Convert the timestamp to a datetime object and set it as the index.
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        df.set_index("timestamp", inplace=True)

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
    import argparse

    parser = argparse.ArgumentParser(description="Run the trading bot.")
    parser.add_argument("--paper", action="store_true", help="Enable paper trading.")
    args = parser.parse_args()

    # Load the trained model
    models_dir = "ai_models"
    model_file_path = os.path.join(models_dir, "random_forest_market_predictor.joblib")
    model = joblib.load(model_file_path)

    # Get real-time data
    df = get_realtime_data("GOLD")

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
