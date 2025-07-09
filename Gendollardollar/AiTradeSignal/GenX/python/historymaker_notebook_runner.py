
#!/usr/bin/env python3
"""
Runner for the Historymaker-1 AI Trading Signal Tool (converted from Colab notebook)
"""

import os
import sys
import json
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_environment():
    """Setup the environment similar to the Colab notebook"""
    logger.info("Setting up Historymaker-1 AI Trading Signal Tool environment...")
    
    # Try to get API keys from environment
    gemini_api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    capital_com_api_key = os.getenv('CAPITAL_COM_LIVE_API_KEY')
    
    if not gemini_api_key:
        logger.warning("GEMINI_API_KEY not found in environment")
    if not capital_com_api_key:
        logger.warning("CAPITAL_COM_LIVE_API_KEY not found in environment")
    
    return gemini_api_key, capital_com_api_key

def install_dependencies():
    """Install required dependencies"""
    try:
        import google.generativeai as genai
        logger.info("Google Generative AI already installed")
    except ImportError:
        logger.info("Installing Google Generative AI...")
        os.system("pip install -q google-generativeai")
        
    try:
        import requests
        logger.info("Requests already installed")
    except ImportError:
        logger.info("Installing requests...")
        os.system("pip install -q requests")

def initialize_gemini_model(api_key):
    """Initialize the Gemini model"""
    if not api_key:
        logger.error("No Gemini API key provided")
        return None
        
    try:
        import google.generativeai as genai
        
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        
        # Initialize the Generative Model
        gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info("Gemini model initialized successfully")
        return gemini_model
        
    except Exception as e:
        logger.error(f"Failed to initialize Gemini model: {e}")
        return None

def test_gemini_integration(model):
    """Test the Gemini integration with trading analysis"""
    if not model:
        logger.warning("No Gemini model available for testing")
        return None
        
    try:
        # Test prompt for trading analysis
        test_prompt = """
        Analyze the current market conditions and provide a brief trading signal for AAPL.
        Consider technical indicators, market sentiment, and risk factors.
        Provide your response in JSON format with the following structure:
        {
            "symbol": "AAPL",
            "signal": "BUY/SELL/HOLD",
            "confidence": 0.0-1.0,
            "reasoning": "Brief explanation",
            "risk_level": "LOW/MEDIUM/HIGH"
        }
        """
        
        response = model.generate_content(test_prompt)
        logger.info("Gemini model test successful")
        logger.info(f"Response: {response.text[:200]}...")
        return response.text
        
    except Exception as e:
        logger.error(f"Gemini model test failed: {e}")
        return None

def integrate_with_existing_bot():
    """Integrate with the existing trading bot"""
    logger.info("Integrating Historymaker-1 with existing trading bot...")
    
    try:
        # Import existing bot components
        from trading_bot import TradingBot
        from telegram_bot import TelegramSignalBot
        
        # Create integration
        bot = TradingBot()
        telegram_bot = TelegramSignalBot()
        
        logger.info("Successfully integrated with existing trading bot")
        return True
        
    except Exception as e:
        logger.error(f"Failed to integrate with existing bot: {e}")
        return False

def main():
    """Main execution function"""
    logger.info("=" * 60)
    logger.info("STARTING HISTORYMAKER-1 AI TRADING SIGNAL TOOL")
    logger.info("=" * 60)
    
    # Setup environment
    gemini_api_key, capital_com_api_key = setup_environment()
    
    # Install dependencies
    install_dependencies()
    
    # Initialize Gemini model
    gemini_model = initialize_gemini_model(gemini_api_key)
    
    # Test Gemini integration
    test_result = test_gemini_integration(gemini_model)
    
    # Integrate with existing bot
    integration_success = integrate_with_existing_bot()
    
    # Summary
    logger.info("=" * 60)
    logger.info("HISTORYMAKER-1 SETUP SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Gemini API Key: {'✓' if gemini_api_key else '✗'}")
    logger.info(f"Capital.com API Key: {'✓' if capital_com_api_key else '✗'}")
    logger.info(f"Gemini Model: {'✓' if gemini_model else '✗'}")
    logger.info(f"Model Test: {'✓' if test_result else '✗'}")
    logger.info(f"Bot Integration: {'✓' if integration_success else '✗'}")
    
    if gemini_model and test_result:
        logger.info("Historymaker-1 is ready for trading signal generation!")
        return gemini_model
    else:
        logger.warning("Historymaker-1 setup incomplete. Please check API keys and configuration.")
        return None

if __name__ == "__main__":
    main()
