"""
Unified Discord Trading Bot Integration
Combines all Discord API capabilities with the trading bot
"""

import asyncio
import threading
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional
import json
import os

# Import our modules
from discord_integration import AdvancedDiscordBot
from discord_webhooks import DiscordIntegrationManager
from discord_dashboard import DiscordBotDashboard
from trading_bot import TradingBot
from telegram_bot import TelegramSignalBot
from logger import setup_logger

class UnifiedTradingDiscordBot:
    """
    Unified bot that combines Discord functionality with trading signals
    Demonstrates comprehensive Discord API usage
    """
    
    def __init__(self):
        self.logger = setup_logger()
        self.logger.info("Initializing Unified Discord Trading Bot...")
        
        # Core components
        self.trading_bot = TradingBot()
        self.telegram_bot = TelegramSignalBot()
        self.discord_integration = DiscordIntegrationManager()
        self.dashboard = DiscordBotDashboard()
        
        # Discord bot instance
        self.discord_bot = AdvancedDiscordBot()
        
        # Threading events for coordination
        self.shutdown_event = threading.Event()
        self.running_threads = []
        
        self.logger.info("All components initialized successfully")
        
    def start_discord_bot_thread(self):
        """Start Discord bot in separate thread"""
        def run_discord_bot():
            try:
                self.logger.info("Starting Discord bot...")
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(self.discord_bot.bot.start(self.discord_bot.DISCORD_TOKEN))
            except Exception as e:
                self.logger.error(f"Discord bot error: {e}")
                
        thread = threading.Thread(target=run_discord_bot, daemon=True, name="DiscordBot")
        thread.start()
        self.running_threads.append(thread)
        return thread
        
    def start_dashboard_thread(self):
        """Start web dashboard in separate thread"""
        def run_dashboard():
            try:
                self.logger.info("Starting web dashboard on port 5000...")
                self.dashboard.run_dashboard(host='0.0.0.0', port=5000)
            except Exception as e:
                self.logger.error(f"Dashboard error: {e}")
                
        thread = threading.Thread(target=run_dashboard, daemon=True, name="Dashboard")
        thread.start()
        self.running_threads.append(thread)
        return thread
        
    def start_trading_monitor_thread(self):
        """Start trading signal monitoring"""
        def monitor_trading():
            try:
                self.logger.info("Starting trading signal monitor...")
                while not self.shutdown_event.is_set():
                    try:
                        # This will be called by the main trading bot
                        # We're just monitoring for any signals to relay to Discord
                        time.sleep(60)  # Check every minute
                    except Exception as e:
                        self.logger.error(f"Trading monitor error: {e}")
                        time.sleep(5)
            except Exception as e:
                self.logger.error(f"Trading monitor thread error: {e}")
                
        thread = threading.Thread(target=monitor_trading, daemon=True, name="TradingMonitor")
        thread.start()
        self.running_threads.append(thread)
        return thread
        
    def send_signal_to_discord(self, signal_data: Dict) -> bool:
        """Send trading signal to Discord channels"""
        try:
            # Log to dashboard database
            self.dashboard.log_signal(signal_data)
            
            # Send via webhook if configured
            webhook_success = self.discord_integration.broadcast_trading_signal(signal_data)
            
            # Also send via Telegram as backup
            telegram_success = self.telegram_bot.send_signal_sync(signal_data)
            
            self.logger.info(f"Signal sent - Discord: {webhook_success}, Telegram: {telegram_success}")
            return webhook_success or telegram_success
            
        except Exception as e:
            self.logger.error(f"Error sending signal to Discord: {e}")
            return False
            
    def send_market_update_to_discord(self, market_data: Dict) -> bool:
        """Send market update to Discord"""
        try:
            return self.discord_integration.webhook_manager.send_market_update(market_data)
        except Exception as e:
            self.logger.error(f"Error sending market update to Discord: {e}")
            return False
            
    def setup_discord_webhooks_for_guild(self, guild_id: str):
        """Setup webhooks for a specific Discord guild"""
        try:
            self.discord_integration.setup_trading_channel_webhooks(guild_id)
            self.logger.info(f"Webhooks setup completed for guild {guild_id}")
        except Exception as e:
            self.logger.error(f"Error setting up webhooks for guild {guild_id}: {e}")
            
    def get_discord_capabilities(self) -> Dict:
        """Get overview of Discord API capabilities being used"""
        return {
            "bot_features": [
                "Slash Commands (/help, /market, /analyze, /alert, etc.)",
                "Message Events and Auto-responses",
                "User Management (welcome messages, roles)",
                "Guild and Channel Management",
                "Direct Messages",
                "Rich Embeds with Trading Data",
                "Real-time Price Alerts",
                "Portfolio Tracking",
                "Paper Trading Simulation",
                "Educational Resources",
                "Community Leaderboards",
                "Stock Screening Tools",
                "Risk Management Calculators"
            ],
            "webhook_features": [
                "Trading Signal Broadcasts",
                "Market Overview Updates", 
                "Price Alert Notifications",
                "Custom Formatted Messages",
                "Multi-channel Distribution"
            ],
            "api_features": [
                "Guild Information Retrieval",
                "Channel Management",
                "User Information Access",
                "Direct Message Capabilities",
                "Webhook Creation and Management",
                "Message Sending to Specific Channels"
            ],
            "dashboard_features": [
                "Web-based Bot Management",
                "Signal Analytics and Statistics",
                "User Portfolio Monitoring",
                "Manual Signal Broadcasting",
                "Real-time Data Visualization",
                "Database Integration with SQLite"
            ]
        }
        
    def test_discord_functionality(self):
        """Test various Discord API features"""
        self.logger.info("Testing Discord functionality...")
        
        # Test getting guilds
        guilds = self.discord_integration.api_manager.get_guilds()
        self.logger.info(f"Bot is in {len(guilds)} Discord servers")
        
        # Test sending a sample signal
        sample_signal = {
            'symbol': 'TEST',
            'final_signal': 'BUY',
            'final_confidence': 0.85,
            'current_price': 100.0,
            'price_change': 2.5,
            'rsi': 65,
            'macd': {'histogram': 0.5},
            'volume_ratio': 1.8
        }
        
        self.send_signal_to_discord(sample_signal)
        
        # Test market update
        sample_market = {
            'SPY': {'price': 450.25, 'change_pct': 0.8},
            'QQQ': {'price': 380.15, 'change_pct': 1.2},
            'VIX': {'value': 18.5}
        }
        
        self.send_market_update_to_discord(sample_market)
        
    def run_comprehensive_demo(self):
        """Run comprehensive demonstration of Discord API capabilities"""
        self.logger.info("=== Starting Comprehensive Discord API Demonstration ===")
        
        # 1. Start all services
        self.logger.info("1. Starting Discord Bot with Slash Commands...")
        discord_thread = self.start_discord_bot_thread()
        
        self.logger.info("2. Starting Web Dashboard...")
        dashboard_thread = self.start_dashboard_thread()
        
        self.logger.info("3. Starting Trading Signal Monitor...")
        monitor_thread = self.start_trading_monitor_thread()
        
        # 2. Wait for services to initialize
        time.sleep(10)
        
        # 3. Test functionality
        self.logger.info("4. Testing Discord API Features...")
        self.test_discord_functionality()
        
        # 4. Display capabilities
        capabilities = self.get_discord_capabilities()
        self.logger.info("5. Discord API Capabilities Overview:")
        for category, features in capabilities.items():
            self.logger.info(f"\n{category.upper()}:")
            for feature in features:
                self.logger.info(f"  ✓ {feature}")
                
        # 5. Integration with trading bot
        self.logger.info("\n6. Integrating with Trading Bot...")
        
        # Monkey patch the trading bot to send signals to Discord
        original_send_signal = self.telegram_bot.send_signal_sync
        
        def enhanced_send_signal(signal_data):
            # Send to Telegram (original functionality)
            telegram_result = original_send_signal(signal_data)
            
            # Also send to Discord
            discord_result = self.send_signal_to_discord(signal_data)
            
            return telegram_result or discord_result
            
        # Replace the method
        self.telegram_bot.send_signal_sync = enhanced_send_signal
        
        self.logger.info("✓ Trading bot now sends signals to both Telegram and Discord")
        
        # 6. Keep running
        self.logger.info("\n7. All services running. Discord bot capabilities active:")
        self.logger.info("   • Bot responding to slash commands in Discord servers")
        self.logger.info("   • Web dashboard available at http://localhost:5000")
        self.logger.info("   • Trading signals will be sent to both Telegram and Discord")
        self.logger.info("   • Webhooks ready for multi-channel broadcasting")
        self.logger.info("   • API endpoints available for guild/channel management")
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(60)
                # Send periodic status updates
                if hasattr(self, 'status_counter'):
                    self.status_counter += 1
                else:
                    self.status_counter = 1
                    
                if self.status_counter % 5 == 0:  # Every 5 minutes
                    self.logger.info(f"Discord bot running - Status check #{self.status_counter}")
                    
        except KeyboardInterrupt:
            self.logger.info("Shutting down...")
            self.shutdown_event.set()
            
    def run(self):
        """Main entry point"""
        try:
            self.run_comprehensive_demo()
        except Exception as e:
            self.logger.error(f"Error in main run: {e}")
            raise

def main():
    """Main function"""
    bot = UnifiedTradingDiscordBot()
    bot.run()

if __name__ == "__main__":
    main()