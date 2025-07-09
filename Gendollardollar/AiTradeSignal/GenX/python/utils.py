"""
Utility functions and classes for the trading bot
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

class SignalHistory:
    """Manages signal history and tracking"""
    
    def __init__(self, history_file: str = "signal_history.json"):
        self.logger = logging.getLogger(__name__)
        self.history_file = history_file
        self.signals = []
        self.daily_count = 0
        self.load_history()
    
    def load_history(self) -> None:
        """Load signal history from file"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
                    self.signals = data.get('signals', [])
                    self.daily_count = data.get('daily_count', 0)
                    
                    # Reset daily count if it's a new day
                    if self.signals:
                        last_signal_date = datetime.fromisoformat(self.signals[-1]['timestamp']).date()
                        if last_signal_date != datetime.now().date():
                            self.daily_count = 0
            else:
                self.signals = []
                self.daily_count = 0
                
        except Exception as e:
            self.logger.error(f"Error loading signal history: {str(e)}")
            self.signals = []
            self.daily_count = 0
    
    def save_history(self) -> None:
        """Save signal history to file"""
        try:
            data = {
                'signals': self.signals,
                'daily_count': self.daily_count,
                'last_updated': datetime.now().isoformat()
            }
            
            with open(self.history_file, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Error saving signal history: {str(e)}")
    
    def add_signal(self, symbol: str, signal: str, confidence: float) -> None:
        """Add a new signal to history"""
        try:
            signal_data = {
                'timestamp': datetime.now().isoformat(),
                'symbol': symbol,
                'signal': signal,
                'confidence': confidence,
                'date': datetime.now().date().isoformat()
            }
            
            self.signals.append(signal_data)
            self.daily_count += 1
            
            # Keep only last 1000 signals
            if len(self.signals) > 1000:
                self.signals = self.signals[-1000:]
            
            self.save_history()
            
        except Exception as e:
            self.logger.error(f"Error adding signal: {str(e)}")
    
    def should_skip_symbol(self, symbol: str) -> bool:
        """Check if we should skip a symbol due to recent signal"""
        try:
            from config import Config
            
            # Check if we've sent a signal for this symbol recently
            cutoff_time = datetime.now() - timedelta(hours=Config.SIGNAL_COOLDOWN_HOURS)
            
            for signal in reversed(self.signals):
                signal_time = datetime.fromisoformat(signal['timestamp'])
                if signal_time < cutoff_time:
                    break
                
                if signal['symbol'] == symbol:
                    return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error checking symbol cooldown: {str(e)}")
            return False
    
    def reset_daily_count(self) -> None:
        """Reset daily signal count"""
        self.daily_count = 0
        self.save_history()
    
    def get_history(self) -> List[Dict]:
        """Get signal history"""
        return self.signals.copy()
    
    def get_daily_count(self) -> int:
        """Get today's signal count"""
        return self.daily_count

class RiskManager:
    """Risk management utilities"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def calculate_position_size(self, account_balance: float, risk_per_trade: float, stop_loss_pct: float) -> float:
        """
        Calculate position size based on risk management rules
        
        Args:
            account_balance: Total account balance
            risk_per_trade: Risk per trade (e.g., 0.02 for 2%)
            stop_loss_pct: Stop loss percentage
        
        Returns:
            Position size in dollars
        """
        try:
            if stop_loss_pct <= 0:
                return 0
            
            risk_amount = account_balance * risk_per_trade
            position_size = risk_amount / stop_loss_pct
            
            return min(position_size, account_balance * 0.1)  # Max 10% of account
            
        except Exception as e:
            self.logger.error(f"Error calculating position size: {str(e)}")
            return 0
    
    def calculate_stop_loss(self, entry_price: float, signal_type: str, atr: float = None) -> float:
        """
        Calculate stop loss level
        
        Args:
            entry_price: Entry price
            signal_type: BUY or SELL
            atr: Average True Range (optional)
        
        Returns:
            Stop loss price
        """
        try:
            if atr is None:
                # Use fixed percentage if ATR not available
                stop_loss_pct = 0.02  # 2%
            else:
                # Use ATR-based stop loss
                stop_loss_pct = min(atr / entry_price, 0.05)  # Max 5%
            
            if signal_type == "BUY":
                return entry_price * (1 - stop_loss_pct)
            else:  # SELL
                return entry_price * (1 + stop_loss_pct)
                
        except Exception as e:
            self.logger.error(f"Error calculating stop loss: {str(e)}")
            return entry_price
    
    def validate_signal(self, signal_data: Dict) -> bool:
        """
        Validate trading signal against risk criteria
        
        Args:
            signal_data: Signal data dictionary
        
        Returns:
            True if signal passes validation, False otherwise
        """
        try:
            # Check confidence level
            confidence = signal_data.get('final_confidence', 0)
            if confidence < 0.6:
                return False
            
            # Check if signal is not HOLD
            signal = signal_data.get('final_signal', 'HOLD')
            if signal == 'HOLD':
                return False
            
            # Check volume ratio (prefer higher volume)
            volume_ratio = signal_data.get('volume_ratio', 1)
            if volume_ratio < 0.5:  # Very low volume
                return False
            
            # Check price volatility
            price_change = abs(signal_data.get('price_change', 0))
            if price_change > 10:  # More than 10% daily change might be too volatile
                return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error validating signal: {str(e)}")
            return False

def format_currency(amount: float) -> str:
    """Format currency amount"""
    return f"${amount:,.2f}"

def format_percentage(value: float) -> str:
    """Format percentage value"""
    return f"{value:+.2f}%"

def calculate_rsi_interpretation(rsi: float) -> str:
    """Get RSI interpretation"""
    if rsi >= 70:
        return "Overbought"
    elif rsi <= 30:
        return "Oversold"
    elif rsi >= 60:
        return "Bullish"
    elif rsi <= 40:
        return "Bearish"
    else:
        return "Neutral"

def calculate_macd_interpretation(macd: float, signal: float, histogram: float) -> str:
    """Get MACD interpretation"""
    if macd > signal and histogram > 0:
        return "Strong Bullish"
    elif macd > signal:
        return "Bullish"
    elif macd < signal and histogram < 0:
        return "Strong Bearish"
    elif macd < signal:
        return "Bearish"
    else:
        return "Neutral"

def is_market_hours() -> bool:
    """Check if market is open (simple EST check)"""
    try:
        now = datetime.now()
        # Simple check - market hours are roughly 9:30 AM to 4:00 PM EST on weekdays
        if now.weekday() >= 5:  # Weekend
            return False
        
        hour = now.hour
        return 9 <= hour <= 16  # Approximate market hours
        
    except Exception:
        return True  # Default to allowing trading
