#!/usr/bin/env python3
"""
AI Trading Bot - Main Entry Point
Runs the trading bot with automated signal generation and Telegram delivery
"""

import time
import schedule
import logging
from datetime import datetime
from trading_bot import TradingBot
from logger import setup_logger
from config import Config

def main():
    """Main function to run the trading bot"""
    # Setup logging
    logger = setup_logger()
    logger.info("Starting AI Trading Bot...")
    
    try:
        # Initialize the trading bot
        bot = TradingBot()
        
        # Schedule the bot to run every hour during market hours
        schedule.every().hour.do(bot.run_analysis)
        
        # Also run a daily comprehensive analysis
        schedule.every().day.at("09:00").do(bot.run_daily_analysis)
        
        logger.info("Trading bot scheduled successfully")
        logger.info("Bot will run hourly analysis and daily comprehensive analysis at 9:00 AM")
        
        # Run initial analysis
        bot.run_analysis()
        
        # Keep the bot running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
            
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error in main loop: {str(e)}")
        raise

if __name__ == "__main__":
    main()
