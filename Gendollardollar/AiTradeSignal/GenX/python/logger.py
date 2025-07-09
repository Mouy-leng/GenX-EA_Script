"""
Logging configuration for the trading bot
"""

import logging
import logging.handlers
import os
from datetime import datetime
from config import Config

def setup_logger() -> logging.Logger:
    """
    Set up logging configuration for the trading bot
    
    Returns:
        Configured logger instance
    """
    # Create logs directory if it doesn't exist
    logs_dir = "logs"
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, Config.LOG_LEVEL))
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation
    log_file = os.path.join(logs_dir, Config.LOG_FILE)
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # Error file handler
    error_log_file = os.path.join(logs_dir, "error.log")
    error_handler = logging.handlers.RotatingFileHandler(
        error_log_file,
        maxBytes=5 * 1024 * 1024,  # 5MB
        backupCount=3
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_handler)
    
    # Log startup
    logger.info("=" * 50)
    logger.info(f"Trading Bot Logger Initialized - {datetime.now()}")
    logger.info("=" * 50)
    
    return logger

class TradingBotLogger:
    """Custom logger wrapper for trading bot specific logging"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_signal(self, symbol: str, signal: str, confidence: float, price: float) -> None:
        """Log trading signal"""
        self.logger.info(f"SIGNAL: {symbol} - {signal} (Confidence: {confidence:.1%}, Price: ${price:.2f})")
    
    def log_analysis(self, symbol: str, analysis_data: dict) -> None:
        """Log analysis results"""
        self.logger.debug(f"ANALYSIS: {symbol} - {analysis_data}")
    
    def log_api_error(self, api_name: str, error: str) -> None:
        """Log API errors"""
        self.logger.error(f"API_ERROR: {api_name} - {error}")
    
    def log_telegram_send(self, symbol: str, success: bool) -> None:
        """Log Telegram message sending"""
        status = "SUCCESS" if success else "FAILED"
        self.logger.info(f"TELEGRAM: {symbol} - {status}")
    
    def log_model_training(self, samples: int, accuracy: float) -> None:
        """Log ML model training"""
        self.logger.info(f"ML_TRAINING: {samples} samples, {accuracy:.3f} accuracy")
    
    def log_data_fetch(self, symbol: str, records: int) -> None:
        """Log data fetching"""
        self.logger.debug(f"DATA_FETCH: {symbol} - {records} records")
    
    def log_performance(self, metrics: dict) -> None:
        """Log performance metrics"""
        self.logger.info(f"PERFORMANCE: {metrics}")
