"""
Main trading bot orchestrator
"""

import logging
from typing import Dict, List
from datetime import datetime, timedelta
import json
import os
from data_fetcher import DataFetcher
from technical_analysis import TechnicalAnalysis
from ml_model import MLTradingModel
from telegram_bot import TelegramSignalBot
from config import Config
from utils import SignalHistory

class TradingBot:
    """Main trading bot that coordinates all components"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.data_fetcher = DataFetcher()
        self.technical_analyzer = TechnicalAnalysis()
        self.ml_model = MLTradingModel()
        self.telegram_bot = TelegramSignalBot()
        self.signal_history = SignalHistory()
        
        # Validate configuration
        if not Config.validate_config():
            raise ValueError("Invalid configuration - check API keys")
        
        self.logger.info("Trading bot initialized successfully")
    
    def run_analysis(self) -> None:
        """Run hourly analysis and generate signals"""
        try:
            self.logger.info("Starting hourly analysis...")
            
            # Fetch market overview
            market_data = self.data_fetcher.fetch_market_overview()
            
            # Analyze individual stocks
            signals_sent = 0
            
            for symbol in Config.STOCK_SYMBOLS:
                try:
                    # Check if we've already sent a signal for this symbol recently
                    if self.signal_history.should_skip_symbol(symbol):
                        self.logger.info(f"Skipping {symbol} - recent signal sent")
                        continue
                    
                    # Fetch stock data
                    stock_data = self.data_fetcher.fetch_stock_data(symbol, "daily")
                    if stock_data is None or len(stock_data) < 50:
                        self.logger.warning(f"Insufficient data for {symbol}")
                        continue
                    
                    # Perform technical analysis
                    analysis = self.technical_analyzer.analyze_stock(symbol, stock_data)
                    if not analysis:
                        self.logger.warning(f"No analysis results for {symbol}")
                        continue
                    
                    # Get ML prediction
                    ml_prediction = self.ml_model.predict_signal(analysis)
                    
                    # Combine signals
                    combined_signal = self.ml_model.combine_signals(
                        analysis.get('signals', {}),
                        ml_prediction
                    )
                    
                    # Check if signal meets confidence threshold
                    final_confidence = combined_signal.get('final_confidence', 0)
                    final_signal = combined_signal.get('final_signal', 'HOLD')
                    
                    if final_confidence >= Config.MIN_CONFIDENCE_THRESHOLD and final_signal != 'HOLD':
                        # Prepare signal data
                        signal_data = {
                            'symbol': symbol,
                            'final_signal': final_signal,
                            'final_confidence': final_confidence,
                            'current_price': analysis.get('current_price', 0),
                            'price_change': analysis.get('price_change', 0),
                            'rsi': analysis.get('rsi', 50),
                            'macd': analysis.get('macd', {}),
                            'moving_averages': analysis.get('moving_averages', {}),
                            'technical_analysis': combined_signal.get('technical_analysis', {}),
                            'ml_prediction': combined_signal.get('ml_prediction', {}),
                            'volume_ratio': analysis.get('volume_ratio', 1),
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        # Send signal
                        if self.telegram_bot.send_signal_sync(signal_data):
                            self.signal_history.add_signal(symbol, final_signal, final_confidence)
                            signals_sent += 1
                            
                            # Log signal
                            self.logger.info(f"Signal sent for {symbol}: {final_signal} (confidence: {final_confidence:.1%})")
                            
                            # Check daily limit
                            if signals_sent >= Config.MAX_SIGNALS_PER_DAY:
                                self.logger.info("Daily signal limit reached")
                                break
                        else:
                            self.logger.error(f"Failed to send signal for {symbol}")
                    else:
                        self.logger.debug(f"Signal for {symbol} below threshold: {final_signal} ({final_confidence:.1%})")
                
                except Exception as e:
                    self.logger.error(f"Error analyzing {symbol}: {str(e)}")
                    continue
            
            self.logger.info(f"Hourly analysis completed. Signals sent: {signals_sent}")
            
        except Exception as e:
            self.logger.error(f"Error in hourly analysis: {str(e)}")
            # Send error notification
            try:
                self.telegram_bot.send_error_notification(f"Hourly analysis failed: {str(e)}")
            except:
                pass
    
    def run_daily_analysis(self) -> None:
        """Run comprehensive daily analysis"""
        try:
            self.logger.info("Starting daily analysis...")
            
            # Fetch market overview
            market_data = self.data_fetcher.fetch_market_overview()
            
            # Send market summary
            if market_data:
                self.telegram_bot.send_market_summary_sync(market_data)
            
            # Fetch historical data for ML training
            self.logger.info("Fetching historical data for ML training...")
            historical_data = self.data_fetcher.get_multiple_stocks_data(Config.STOCK_SYMBOLS[:5])  # Use first 5 stocks
            
            if historical_data:
                self.logger.info("Training ML model with latest data...")
                self.ml_model.train_model(historical_data)
            
            # Reset daily signal count
            self.signal_history.reset_daily_count()
            
            # Run regular analysis
            self.run_analysis()
            
            self.logger.info("Daily analysis completed")
            
        except Exception as e:
            self.logger.error(f"Error in daily analysis: {str(e)}")
            # Send error notification
            try:
                self.telegram_bot.send_error_notification(f"Daily analysis failed: {str(e)}")
            except:
                pass
    
    def get_signal_history(self) -> Dict:
        """Get signal history for monitoring"""
        return self.signal_history.get_history()
    
    def get_performance_metrics(self) -> Dict:
        """Get bot performance metrics"""
        try:
            history = self.signal_history.get_history()
            
            total_signals = len(history)
            if total_signals == 0:
                return {"total_signals": 0, "avg_confidence": 0, "signal_distribution": {}}
            
            avg_confidence = sum(signal['confidence'] for signal in history) / total_signals
            
            signal_distribution = {}
            for signal in history:
                signal_type = signal['signal']
                signal_distribution[signal_type] = signal_distribution.get(signal_type, 0) + 1
            
            return {
                "total_signals": total_signals,
                "avg_confidence": avg_confidence,
                "signal_distribution": signal_distribution,
                "last_signal_time": history[-1]['timestamp'] if history else None
            }
            
        except Exception as e:
            self.logger.error(f"Error getting performance metrics: {str(e)}")
            return {"error": str(e)}
