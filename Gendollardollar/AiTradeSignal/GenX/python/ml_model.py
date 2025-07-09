"""
Machine learning model for enhanced trading signal generation
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import logging
from typing import Dict, List, Tuple, Optional
import joblib
from datetime import datetime

class MLTradingModel:
    """Machine learning model for trading signal prediction"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.is_trained = False
    
    def create_features(self, technical_analysis: Dict) -> np.ndarray:
        """
        Create feature vector from technical analysis data
        
        Args:
            technical_analysis: Dictionary with technical analysis results
        
        Returns:
            Feature vector for ML model
        """
        try:
            features = []
            
            # Price-based features
            features.append(technical_analysis.get('price_change', 0))
            features.append(technical_analysis.get('volume_ratio', 1))
            features.append(technical_analysis.get('rsi', 50))
            
            # MACD features
            macd_data = technical_analysis.get('macd', {})
            features.append(macd_data.get('macd', 0))
            features.append(macd_data.get('signal', 0))
            features.append(macd_data.get('histogram', 0))
            
            # Moving average features
            ma_data = technical_analysis.get('moving_averages', {})
            features.append(ma_data.get('price_vs_ma_short', 0))
            features.append(ma_data.get('price_vs_ma_long', 0))
            
            # Bollinger Band features
            bb_data = technical_analysis.get('bollinger_bands', {})
            current_price = technical_analysis.get('current_price', 0)
            bb_upper = bb_data.get('upper', current_price)
            bb_lower = bb_data.get('lower', current_price)
            bb_middle = bb_data.get('middle', current_price)
            
            if bb_upper != bb_lower:
                bb_position = (current_price - bb_lower) / (bb_upper - bb_lower)
            else:
                bb_position = 0.5
            
            features.append(bb_position)
            
            # Support/Resistance features
            sr_data = technical_analysis.get('support_resistance', {})
            support = sr_data.get('support', current_price)
            resistance = sr_data.get('resistance', current_price)
            
            if resistance != support:
                sr_position = (current_price - support) / (resistance - support)
            else:
                sr_position = 0.5
            
            features.append(sr_position)
            
            return np.array(features).reshape(1, -1)
            
        except Exception as e:
            self.logger.error(f"Error creating features: {str(e)}")
            return np.zeros((1, 10))
    
    def create_training_data(self, historical_data: Dict[str, pd.DataFrame]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create training data from historical stock data
        
        Args:
            historical_data: Dictionary with symbol -> DataFrame mapping
        
        Returns:
            Tuple of (features, labels)
        """
        try:
            from technical_analysis import TechnicalAnalysis
            ta = TechnicalAnalysis()
            
            all_features = []
            all_labels = []
            
            for symbol, data in historical_data.items():
                if len(data) < 100:  # Need sufficient data for training
                    continue
                
                # Create features for each time period
                for i in range(50, len(data) - 5):  # Leave 5 days for future return calculation
                    current_data = data.iloc[:i+1]
                    analysis = ta.analyze_stock(symbol, current_data)
                    
                    if not analysis:
                        continue
                    
                    features = self.create_features(analysis)
                    if features.size == 0:
                        continue
                    
                    # Calculate future return (5 days ahead)
                    current_price = data.iloc[i]['close']
                    future_price = data.iloc[i+5]['close']
                    future_return = (future_price - current_price) / current_price
                    
                    # Create label based on future return
                    if future_return > 0.02:  # 2% gain
                        label = 1  # BUY
                    elif future_return < -0.02:  # 2% loss
                        label = 0  # SELL
                    else:
                        label = 2  # HOLD
                    
                    all_features.append(features.flatten())
                    all_labels.append(label)
            
            if not all_features:
                self.logger.warning("No training data created")
                return np.array([]), np.array([])
            
            return np.array(all_features), np.array(all_labels)
            
        except Exception as e:
            self.logger.error(f"Error creating training data: {str(e)}")
            return np.array([]), np.array([])
    
    def train_model(self, historical_data: Dict[str, pd.DataFrame]) -> bool:
        """
        Train the ML model with historical data
        
        Args:
            historical_data: Dictionary with historical stock data
        
        Returns:
            True if training successful, False otherwise
        """
        try:
            self.logger.info("Creating training data...")
            X, y = self.create_training_data(historical_data)
            
            if len(X) == 0 or len(y) == 0:
                self.logger.error("No training data available")
                return False
            
            self.logger.info(f"Training with {len(X)} samples")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            self.logger.info(f"Model trained with accuracy: {accuracy:.3f}")
            self.logger.info(f"Classification report:\n{classification_report(y_test, y_pred)}")
            
            self.is_trained = True
            return True
            
        except Exception as e:
            self.logger.error(f"Error training model: {str(e)}")
            return False
    
    def predict_signal(self, technical_analysis: Dict) -> Dict:
        """
        Predict trading signal using the trained model
        
        Args:
            technical_analysis: Technical analysis results
        
        Returns:
            Dictionary with prediction results
        """
        try:
            if not self.is_trained:
                self.logger.warning("Model not trained, using default prediction")
                return {
                    "predicted_signal": "HOLD",
                    "confidence": 0.5,
                    "ml_probability": [0.33, 0.33, 0.34]  # SELL, BUY, HOLD
                }
            
            features = self.create_features(technical_analysis)
            features_scaled = self.scaler.transform(features)
            
            # Get prediction and probabilities
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Map prediction to signal
            signal_map = {0: "SELL", 1: "BUY", 2: "HOLD"}
            predicted_signal = signal_map[prediction]
            
            # Calculate confidence based on max probability
            confidence = np.max(probabilities)
            
            return {
                "predicted_signal": predicted_signal,
                "confidence": confidence,
                "ml_probability": probabilities.tolist(),
                "feature_importance": self.get_feature_importance()
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting signal: {str(e)}")
            return {
                "predicted_signal": "HOLD",
                "confidence": 0.5,
                "ml_probability": [0.33, 0.33, 0.34]
            }
    
    def get_feature_importance(self) -> List[float]:
        """
        Get feature importance from the trained model
        
        Returns:
            List of feature importances
        """
        if not self.is_trained:
            return []
        
        try:
            return self.model.feature_importances_.tolist()
        except Exception as e:
            self.logger.error(f"Error getting feature importance: {str(e)}")
            return []
    
    def combine_signals(self, technical_signals: Dict, ml_prediction: Dict) -> Dict:
        """
        Combine technical analysis signals with ML prediction
        
        Args:
            technical_signals: Technical analysis signals
            ml_prediction: ML model prediction
        
        Returns:
            Combined signal with enhanced confidence
        """
        try:
            # Get individual signals
            ta_signal = technical_signals.get("overall_signal", "HOLD")
            ta_confidence = technical_signals.get("confidence", 0.5)
            
            ml_signal = ml_prediction.get("predicted_signal", "HOLD")
            ml_confidence = ml_prediction.get("confidence", 0.5)
            
            # Combine signals
            if ta_signal == ml_signal:
                # Both agree - higher confidence
                combined_signal = ta_signal
                combined_confidence = min((ta_confidence + ml_confidence) / 2 + 0.1, 1.0)
            elif ta_signal == "HOLD" or ml_signal == "HOLD":
                # One is HOLD - use the other with reduced confidence
                combined_signal = ta_signal if ta_signal != "HOLD" else ml_signal
                combined_confidence = max(ta_confidence, ml_confidence) * 0.7
            else:
                # Signals disagree - default to HOLD with low confidence
                combined_signal = "HOLD"
                combined_confidence = 0.3
            
            return {
                "final_signal": combined_signal,
                "final_confidence": combined_confidence,
                "technical_analysis": {
                    "signal": ta_signal,
                    "confidence": ta_confidence,
                    "details": technical_signals
                },
                "ml_prediction": ml_prediction
            }
            
        except Exception as e:
            self.logger.error(f"Error combining signals: {str(e)}")
            return {
                "final_signal": "HOLD",
                "final_confidence": 0.5,
                "technical_analysis": technical_signals,
                "ml_prediction": ml_prediction
            }
