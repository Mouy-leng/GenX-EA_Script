import pandas as pd
from ai_models.market_predictor import MarketPredictor
import numpy as np

def main():
    # Load the sample data
    data = pd.read_csv('data/sample_data.csv', index_col='timestamp', parse_dates=True)

    # Generate some dummy labels for training
    # In a real scenario, these labels would be generated based on some strategy
    labels = np.random.randint(0, 3, size=len(data))

    # Create a MarketPredictor instance
    predictor = MarketPredictor(model_path='ai_models/market_predictor.joblib')

    # Train the model
    predictor.train_model(data, labels)

if __name__ == '__main__':
    main()
