
"""
Market prediction using machine learning and pattern analysis.
"""

import logging
import os
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from . import model_utils

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class MarketPredictor:
    """
    Machine learning-based market prediction.
    """

    def __init__(self, model_path: Optional[str] = None) -> None:
        """
        Initializes the MarketPredictor.

        Args:
            model_path (Optional[str]): Path to save/load the model.
        """
        self.model: Optional[RandomForestClassifier] = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = model_path or "models/market_predictor.joblib"

        if os.path.exists(self.model_path):
            self.load_model()

    def prepare_features(self, data: pd.DataFrame) -> np.ndarray:
        """
        Prepare features for machine learning model
        
        Args:
            data: Market data with OHLCV
            
        Returns:
            Feature array
        """
        features = []
        
        # Price-based features
        features.extend([
            data['close'].pct_change().fillna(0),  # Returns
            data['high'] / data['close'] - 1,      # High ratio
            data['low'] / data['close'] - 1,       # Low ratio
            data['volume'].pct_change().fillna(0)  # Volume change
        ])
        
        # Technical indicators
        close_prices = data['close'].values
        
        # Moving averages
        for period in [5, 10, 20, 50]:
            ma = pd.Series(close_prices).rolling(period).mean()
            features.append((close_prices - ma) / ma)
        
        # RSI
        rsi = model_utils.calculate_rsi(close_prices)
        features.append(rsi / 100)  # Normalize to 0-1
        
        # MACD
        macd, signal = model_utils.calculate_macd(close_prices)
        features.extend([macd, signal])
        
        # Bollinger Bands
        bb_upper, bb_lower = model_utils.calculate_bollinger_bands(close_prices)
        features.extend([
            (close_prices - bb_upper) / bb_upper,
            (close_prices - bb_lower) / bb_lower
        ])
        
        # Combine all features
        feature_matrix = np.column_stack(features)
        
        # Handle NaN values
        feature_matrix = np.nan_to_num(feature_matrix, nan=0.0)
        
        return feature_matrix
    
    def train_model(self, data: pd.DataFrame, labels: np.ndarray) -> None:
        """
        Train the prediction model.

        Args:
            data (pd.DataFrame): Training data with OHLCV.
            labels (np.ndarray): Target labels (0=sell, 1=hold, 2=buy).
        """
        logging.info("Starting model training...")
        features = self.prepare_features(data)
        
        features_scaled = self.scaler.fit_transform(features)
        
        self.model = RandomForestClassifier(
            n_estimators=150,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(features_scaled, labels)
        self.is_trained = True
        
        self.save_model()
        logging.info("Model training completed.")

    def predict(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Make predictions on new data
        
        Args:
            data: Market data to predict on
            
        Returns:
            Tuple of (predictions, probabilities)
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet")
        
        features = self.prepare_features(data)
        features_scaled = self.scaler.transform(features)
        
        predictions = self.model.predict(features_scaled)
        probabilities = self.model.predict_proba(features_scaled)
        
        return predictions, probabilities
    
    def get_prediction_signals(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Get trading signals based on predictions.

        Args:
            data (pd.DataFrame): Market data to predict on.

        Returns:
            List[Dict[str, Any]]: A list of prediction signals.
        """
        if not self.is_trained:
            logging.warning("Prediction attempted without a trained model.")
            return []

        predictions, probabilities = self.predict(data)
        
        signals = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            if i < len(data):
                signal = {
                    'type': 'ml_prediction',
                    'timestamp': data.index[i],
                    'prediction': int(pred),
                    'confidence': float(np.max(prob)),
                    'direction': self._prediction_to_direction(pred),
                }
                signals.append(signal)
        
        return signals

    def _prediction_to_direction(self, prediction: int) -> str:
        """Convert prediction to direction"""
        if prediction == 0:
            return 'bearish'
        elif prediction == 2:
            return 'bullish'
        else:
            return 'neutral'
    
    def save_model(self) -> None:
        """Saves the trained model and scaler to disk."""
        if not self.is_trained or self.model is None:
            logging.error("Attempted to save a model that is not trained.")
            return

        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
            }, self.model_path)
            logging.info(f"Model saved successfully to {self.model_path}")
        except Exception as e:
            logging.error(f"Error saving model: {e}")

    def load_model(self) -> None:
        """Loads the model and scaler from disk."""
        try:
            if os.path.exists(self.model_path):
                saved_data = joblib.load(self.model_path)
                self.model = saved_data['model']
                self.scaler = saved_data['scaler']
                self.is_trained = True
                logging.info(f"Model loaded successfully from {self.model_path}")
            else:
                logging.warning(f"Model path {self.model_path} does not exist. Model not loaded.")
        except FileNotFoundError:
            logging.error(f"Model file not found at {self.model_path}")
        except Exception as e:
            logging.error(f"Error loading model: {e}")
