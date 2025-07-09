"""
Telegram bot module for sending trading signals
"""

import logging
from typing import Dict, List
import telebot
from config import Config
from datetime import datetime

class TelegramSignalBot:
    """Handles sending trading signals via Telegram"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.bot = telebot.TeleBot(Config.TELEGRAM_BOT_TOKEN)
        self.user_id = Config.TELEGRAM_USER_ID
        
    def send_signal(self, signal_data: Dict) -> bool:
        """
        Send trading signal to Telegram
        
        Args:
            signal_data: Dictionary containing signal information
        
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            message = self._format_signal_message(signal_data)
            
            self.bot.send_message(
                chat_id=self.user_id,
                text=message,
                parse_mode='HTML'
            )
            
            self.logger.info(f"Signal sent successfully for {signal_data.get('symbol', 'Unknown')}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error sending signal: {str(e)}")
            return False
    
    def _format_signal_message(self, signal_data: Dict) -> str:
        """
        Format trading signal into a readable message
        
        Args:
            signal_data: Dictionary containing signal information
        
        Returns:
            Formatted message string
        """
        try:
            symbol = signal_data.get('symbol', 'Unknown')
            final_signal = signal_data.get('final_signal', 'HOLD')
            confidence = signal_data.get('final_confidence', 0.5)
            current_price = signal_data.get('current_price', 0)
            price_change = signal_data.get('price_change', 0)
            
            # Signal emoji
            signal_emoji = {
                'BUY': '🟢',
                'SELL': '🔴',
                'HOLD': '🟡'
            }
            
            # Confidence level
            if confidence >= 0.8:
                confidence_text = "HIGH"
                confidence_emoji = "🔥"
            elif confidence >= 0.6:
                confidence_text = "MEDIUM"
                confidence_emoji = "⚡"
            else:
                confidence_text = "LOW"
                confidence_emoji = "⚠️"
            
            # Price change emoji
            price_emoji = "📈" if price_change > 0 else "📉" if price_change < 0 else "➡️"
            
            # Build message
            message = f"🚨 <b>AI Trading Signal</b> 🚨\n\n"
            message += f"{signal_emoji.get(final_signal, '🟡')} <b>{symbol}</b> - {final_signal}\n"
            message += f"{confidence_emoji} Confidence: {confidence_text} ({confidence:.1%})\n\n"
            
            message += f"💰 Current Price: ${current_price:.2f}\n"
            message += f"{price_emoji} Price Change: {price_change:+.2f}%\n\n"
            
            # Technical analysis details
            ta_data = signal_data.get('technical_analysis', {})
            if ta_data:
                message += f"📊 <b>Technical Analysis</b>\n"
                
                # RSI
                rsi = signal_data.get('rsi', 50)
                rsi_status = "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral"
                message += f"• RSI: {rsi:.1f} ({rsi_status})\n"
                
                # MACD
                macd_data = signal_data.get('macd', {})
                macd_trend = "Bullish" if macd_data.get('histogram', 0) > 0 else "Bearish"
                message += f"• MACD: {macd_trend}\n"
                
                # Moving averages
                ma_data = signal_data.get('moving_averages', {})
                ma_short_diff = ma_data.get('price_vs_ma_short', 0)
                ma_trend = "Above" if ma_short_diff > 0 else "Below"
                message += f"• MA Trend: {ma_trend} short-term MA\n"
            
            # ML prediction details
            ml_data = signal_data.get('ml_prediction', {})
            if ml_data:
                ml_signal = ml_data.get('predicted_signal', 'HOLD')
                ml_confidence = ml_data.get('confidence', 0.5)
                message += f"\n🤖 <b>AI Model</b>\n"
                message += f"• Prediction: {ml_signal}\n"
                message += f"• AI Confidence: {ml_confidence:.1%}\n"
            
            # Risk warning
            message += f"\n⚠️ <b>Risk Warning</b>\n"
            message += f"This is an AI-generated signal for informational purposes only. "
            message += f"Always conduct your own research and consider your risk tolerance before making investment decisions.\n\n"
            
            # Timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message += f"🕐 Generated: {timestamp}"
            
            return message
            
        except Exception as e:
            self.logger.error(f"Error formatting message: {str(e)}")
            return f"Error formatting signal for {signal_data.get('symbol', 'Unknown')}"
    
    def send_market_summary(self, market_data: Dict) -> bool:
        """
        Send market summary to Telegram
        
        Args:
            market_data: Dictionary containing market overview data
        
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            message = self._format_market_summary(market_data)
            
            self.bot.send_message(
                chat_id=self.user_id,
                text=message,
                parse_mode='HTML'
            )
            
            self.logger.info("Market summary sent successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error sending market summary: {str(e)}")
            return False
    
    def _format_market_summary(self, market_data: Dict) -> str:
        """
        Format market summary message
        
        Args:
            market_data: Dictionary containing market data
        
        Returns:
            Formatted market summary string
        """
        try:
            message = f"📊 <b>Market Overview</b>\n\n"
            
            # Major indices
            indices = ['SPY', 'QQQ', 'DIA', 'IWM']
            for index in indices:
                if index in market_data:
                    data = market_data[index]
                    price = data.get('price', 0)
                    change_pct = data.get('change_pct', 0)
                    emoji = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
                    message += f"{emoji} {index}: ${price:.2f} ({change_pct:+.2f}%)\n"
            
            # VIX
            if 'VIX' in market_data:
                vix_data = market_data['VIX']
                vix_value = vix_data.get('value', 0)
                vix_status = "HIGH" if vix_value > 30 else "MODERATE" if vix_value > 20 else "LOW"
                message += f"\n🌪️ VIX: {vix_value:.2f} ({vix_status} volatility)\n"
            
            message += f"\n🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            
            return message
            
        except Exception as e:
            self.logger.error(f"Error formatting market summary: {str(e)}")
            return "Error formatting market summary"
    
    def send_error_notification(self, error_message: str) -> bool:
        """
        Send error notification to Telegram
        
        Args:
            error_message: Error message to send
        
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            message = f"❌ <b>Trading Bot Error</b>\n\n"
            message += f"Error: {error_message}\n"
            message += f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            message += f"Please check the bot logs for more details."
            
            self.bot.send_message(
                chat_id=self.user_id,
                text=message,
                parse_mode='HTML'
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error sending error notification: {str(e)}")
            return False
    
    def send_signal_sync(self, signal_data: Dict) -> bool:
        """
        Synchronous wrapper for sending signals
        
        Args:
            signal_data: Dictionary containing signal information
        
        Returns:
            True if sent successfully, False otherwise
        """
        return self.send_signal(signal_data)
    
    def send_market_summary_sync(self, market_data: Dict) -> bool:
        """
        Synchronous wrapper for sending market summary
        
        Args:
            market_data: Dictionary containing market data
        
        Returns:
            True if sent successfully, False otherwise
        """
        return self.send_market_summary(market_data)
