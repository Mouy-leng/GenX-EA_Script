
#!/usr/bin/env python3
"""
Unified Historymaker-1 AI Trading System
Integrates the original trading bot with enhanced AI capabilities from the notebook
"""

import asyncio
import logging
import sys
import os
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import Config
    from data_fetcher import DataFetcher
    from bybit_fetcher import BybitDataFetcher
    from technical_analysis import TechnicalAnalyzer
    from ml_model import MLTradingModel
    from telegram_bot import TelegramSignalBot
    from discord_integration import DiscordIntegrationManager
    from logger import setup_logger
    from utils import SignalHistory
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure all required modules are available")
    sys.exit(1)

class HistorymakerOne:
    """
    Main Historymaker-1 trading system class
    Combines all trading capabilities into one unified system
    """
    
    def __init__(self):
        self.logger = setup_logger()
        self.logger.info("=" * 60)
        self.logger.info("INITIALIZING HISTORYMAKER-1 AI TRADING SYSTEM")
        self.logger.info("=" * 60)
        
        # Initialize components
        self.config = Config()
        self.data_fetcher = DataFetcher()
        self.bybit_fetcher = BybitDataFetcher()
        self.technical_analyzer = TechnicalAnalyzer()
        self.ml_model = MLTradingModel()
        self.telegram_bot = TelegramSignalBot()
        self.discord_manager = DiscordIntegrationManager()
        self.signal_history = SignalHistory()
        
        # Initialize Gemini AI if available
        self.gemini_ai = None
        self._init_gemini_ai()
        
        # Performance tracking
        self.signals_sent_today = 0
        self.successful_signals = 0
        self.total_signals = 0
        self.portfolio_value = 100000  # Starting portfolio value
        
        self.logger.info("Historymaker-1 system initialized successfully")
    
    def _init_gemini_ai(self):
        """Initialize Gemini AI for enhanced analysis"""
        try:
            if self.config.GEMINI_API_KEY:
                import google.generativeai as genai
                genai.configure(api_key=self.config.GEMINI_API_KEY)
                self.gemini_ai = genai.GenerativeModel('gemini-2.0-flash-exp')
                self.logger.info("✓ Gemini AI initialized successfully")
            else:
                self.logger.warning("✗ Gemini API key not found")
        except Exception as e:
            self.logger.error(f"✗ Failed to initialize Gemini AI: {e}")
    
    async def run_comprehensive_analysis(self):
        """Run comprehensive market analysis across all timeframes and assets"""
        self.logger.info("Starting comprehensive Historymaker-1 analysis...")
        
        signals_generated = []
        analysis_results = {}
        
        for symbol in self.config.MONITORED_SYMBOLS:
            try:
                # Multi-timeframe analysis
                symbol_analysis = await self._analyze_symbol_comprehensive(symbol)
                analysis_results[symbol] = symbol_analysis
                
                if symbol_analysis and symbol_analysis.get('signal'):
                    signals_generated.append(symbol_analysis['signal'])
                    
            except Exception as e:
                self.logger.error(f"Error analyzing {symbol}: {e}")
                continue
        
        # Generate market overview with AI
        market_overview = await self._generate_market_overview(analysis_results)
        
        # Send signals and summaries
        await self._process_and_send_signals(signals_generated, market_overview)
        
        self.logger.info(f"Comprehensive analysis completed. Signals generated: {len(signals_generated)}")
        return signals_generated
    
    async def _analyze_symbol_comprehensive(self, symbol: str) -> Optional[Dict]:
        """Perform comprehensive analysis for a single symbol"""
        try:
            # Get market data from appropriate source
            if symbol.endswith('USDT'):
                data = self.bybit_fetcher.fetch_kline_data(symbol, '4h', 100)
            else:
                data = self.data_fetcher.fetch_stock_data(symbol, 'daily')
            
            if data is None or len(data) < 50:
                self.logger.warning(f"Insufficient data for {symbol}")
                return None
            
            # Technical analysis
            technical_analysis = self.technical_analyzer.generate_signal(data, symbol)
            
            # ML analysis
            ml_prediction = self.ml_model.predict_signal(data, symbol)
            
            # Enhanced AI analysis with Gemini
            ai_analysis = await self._get_gemini_analysis(symbol, data, technical_analysis)
            
            # Combine all analyses
            combined_analysis = self._combine_analyses(
                symbol, technical_analysis, ml_prediction, ai_analysis
            )
            
            return combined_analysis
            
        except Exception as e:
            self.logger.error(f"Error in comprehensive analysis for {symbol}: {e}")
            return None
    
    async def _get_gemini_analysis(self, symbol: str, data: any, technical_data: Dict) -> Optional[Dict]:
        """Get enhanced analysis from Gemini AI"""
        if not self.gemini_ai:
            return None
            
        try:
            prompt = f"""
            As Historymaker-1 AI analyst, provide advanced trading analysis for {symbol}.
            
            Recent price data: {json.dumps(data[-10:].to_dict('records') if hasattr(data, 'to_dict') else data[-10:], indent=2)}
            
            Technical indicators: {json.dumps(technical_data, indent=2)}
            
            Provide analysis focusing on:
            1. Smart Money Concepts (Order Blocks, Fair Value Gaps, Liquidity)
            2. Multi-timeframe confluence
            3. Risk-reward ratio
            4. Market structure analysis
            5. Entry/exit strategy
            
            Respond in JSON format:
            {{
                "signal": "BUY/SELL/HOLD",
                "confidence": 0.0-1.0,
                "reasoning": "detailed explanation",
                "risk_level": "LOW/MEDIUM/HIGH",
                "target_price": number,
                "stop_loss": number,
                "market_structure": "BULLISH/BEARISH/NEUTRAL",
                "smc_analysis": "order block and liquidity analysis"
            }}
            """
            
            response = self.gemini_ai.generate_content(prompt)
            
            # Extract JSON from response
            text = response.text
            json_match = text.find('{')
            if json_match != -1:
                json_end = text.rfind('}') + 1
                json_str = text[json_match:json_end]
                return json.loads(json_str)
                
        except Exception as e:
            self.logger.error(f"Gemini analysis error for {symbol}: {e}")
        
        return None
    
    def _combine_analyses(self, symbol: str, technical: Dict, ml: Dict, ai: Optional[Dict]) -> Dict:
        """Combine all analysis methods into final signal"""
        try:
            # Weight the different signals
            technical_confidence = technical.get('final_confidence', 0.5)
            ml_confidence = ml.get('confidence', 0.5) if ml else 0.5
            ai_confidence = ai.get('confidence', 0.5) if ai else 0.5
            
            # Calculate weighted confidence
            total_confidence = (
                technical_confidence * self.config.TECHNICAL_CONFIDENCE_WEIGHT +
                ml_confidence * self.config.ML_CONFIDENCE_WEIGHT +
                ai_confidence * self.config.AI_CONFIDENCE_WEIGHT
            )
            
            # Determine final signal
            signals = []
            if technical.get('final_signal'):
                signals.append(technical['final_signal'])
            if ml and ml.get('predicted_signal'):
                signals.append(ml['predicted_signal'])
            if ai and ai.get('signal'):
                signals.append(ai['signal'])
            
            # Majority vote for final signal
            if not signals:
                final_signal = 'HOLD'
            else:
                final_signal = max(set(signals), key=signals.count)
            
            # Only send high-confidence signals
            if total_confidence < self.config.MIN_SIGNAL_CONFIDENCE:
                final_signal = 'HOLD'
            
            combined_signal = {
                'symbol': symbol,
                'final_signal': final_signal,
                'final_confidence': total_confidence,
                'timestamp': datetime.now().isoformat(),
                'technical_analysis': technical,
                'ml_prediction': ml,
                'ai_analysis': ai,
                'risk_level': ai.get('risk_level', 'MEDIUM') if ai else 'MEDIUM',
                'target_price': ai.get('target_price') if ai else None,
                'stop_loss': ai.get('stop_loss') if ai else None
            }
            
            # Add signal to history if it's actionable
            if final_signal != 'HOLD' and total_confidence >= self.config.MIN_SIGNAL_CONFIDENCE:
                combined_signal['signal'] = combined_signal
                return combined_signal
            
            return {'symbol': symbol, 'signal': None}
            
        except Exception as e:
            self.logger.error(f"Error combining analyses for {symbol}: {e}")
            return {'symbol': symbol, 'signal': None}
    
    async def _generate_market_overview(self, analysis_results: Dict) -> str:
        """Generate market overview using AI"""
        if not self.gemini_ai:
            return "Market analysis completed. Check individual signals."
        
        try:
            # Summarize all analyses
            summary_data = {}
            for symbol, result in analysis_results.items():
                if result and result.get('signal'):
                    summary_data[symbol] = {
                        'signal': result['signal']['final_signal'],
                        'confidence': result['signal']['final_confidence'],
                        'risk_level': result['signal'].get('risk_level', 'MEDIUM')
                    }
            
            prompt = f"""
            Generate a comprehensive market overview for Historymaker-1 based on analysis results:
            
            {json.dumps(summary_data, indent=2)}
            
            Provide:
            1. Overall market sentiment
            2. Key opportunities and risks
            3. Sector analysis
            4. Recommended actions
            5. Market outlook
            
            Keep it concise and actionable.
            """
            
            response = self.gemini_ai.generate_content(prompt)
            return response.text
            
        except Exception as e:
            self.logger.error(f"Error generating market overview: {e}")
            return "Market analysis completed. Individual signals available."
    
    async def _process_and_send_signals(self, signals: List[Dict], market_overview: str):
        """Process and send all signals through available channels"""
        
        if not signals:
            self.logger.info("No actionable signals generated")
            return
        
        # Filter signals based on history and limits
        filtered_signals = []
        for signal in signals:
            if signal and self._should_send_signal(signal):
                filtered_signals.append(signal)
        
        if not filtered_signals:
            self.logger.info("All signals filtered out by risk management")
            return
        
        # Send individual signals
        for signal in filtered_signals:
            try:
                # Send via Telegram
                telegram_success = self.telegram_bot.send_trading_signal(signal)
                
                # Send via Discord
                discord_success = await self.discord_manager.send_trading_signal(signal)
                
                if telegram_success or discord_success:
                    self.signal_history.add_signal(signal['symbol'], signal['final_signal'])
                    self.signals_sent_today += 1
                    self.total_signals += 1
                    self.logger.info(f"✓ Signal sent for {signal['symbol']}: {signal['final_signal']}")
                
            except Exception as e:
                self.logger.error(f"Error sending signal for {signal['symbol']}: {e}")
        
        # Send market overview
        if market_overview and len(filtered_signals) > 0:
            try:
                overview_message = f"📊 **Historymaker-1 Market Overview**\n\n{market_overview}\n\n📈 Signals sent: {len(filtered_signals)}"
                self.telegram_bot.send_message(overview_message)
                await self.discord_manager.send_market_update(overview_message)
            except Exception as e:
                self.logger.error(f"Error sending market overview: {e}")
    
    def _should_send_signal(self, signal: Dict) -> bool:
        """Check if signal should be sent based on risk management rules"""
        symbol = signal['symbol']
        signal_type = signal['final_signal']
        confidence = signal['final_confidence']
        
        # Check daily limits
        if self.signals_sent_today >= self.config.MAX_DAILY_SIGNALS:
            self.logger.warning(f"Daily signal limit reached ({self.config.MAX_DAILY_SIGNALS})")
            return False
        
        # Check confidence threshold
        if confidence < self.config.MIN_SIGNAL_CONFIDENCE:
            return False
        
        # Check signal history for duplicates
        if self.signal_history.is_duplicate_signal(symbol, signal_type):
            self.logger.info(f"Duplicate signal filtered for {symbol}")
            return False
        
        return True
    
    async def run_quick_scan(self):
        """Run quick market scan for urgent signals"""
        self.logger.info("Running Historymaker-1 quick scan...")
        
        # Focus on most liquid and volatile assets
        priority_symbols = ['SPY', 'QQQ', 'BTCUSDT', 'ETHUSDT', 'AAPL', 'TSLA']
        
        urgent_signals = []
        for symbol in priority_symbols:
            try:
                analysis = await self._analyze_symbol_comprehensive(symbol)
                if analysis and analysis.get('signal'):
                    signal = analysis['signal']
                    if signal['final_confidence'] > self.config.HIGH_CONFIDENCE_THRESHOLD:
                        urgent_signals.append(signal)
            except Exception as e:
                self.logger.error(f"Quick scan error for {symbol}: {e}")
        
        if urgent_signals:
            await self._process_and_send_signals(urgent_signals, "🚨 High-confidence signals detected!")
        
        return urgent_signals
    
    def get_performance_summary(self) -> Dict:
        """Get performance summary"""
        return {
            'total_signals': self.total_signals,
            'signals_today': self.signals_sent_today,
            'success_rate': (self.successful_signals / max(self.total_signals, 1)) * 100,
            'portfolio_value': self.portfolio_value,
            'system_uptime': datetime.now().isoformat(),
            'ai_enabled': self.gemini_ai is not None
        }

async def main():
    """Main execution function"""
    try:
        # Initialize Historymaker-1 system
        historymaker = HistorymakerOne()
        
        # Run the notebook equivalent
        print("Running Historymaker-1 notebook equivalent...")
        os.system(f"python {os.path.dirname(__file__)}/historymaker_notebook_runner.py")
        
        # Run comprehensive analysis
        signals = await historymaker.run_comprehensive_analysis()
        
        # Performance summary
        performance = historymaker.get_performance_summary()
        historymaker.logger.info("=" * 60)
        historymaker.logger.info("HISTORYMAKER-1 EXECUTION SUMMARY")
        historymaker.logger.info("=" * 60)
        historymaker.logger.info(f"Signals generated: {len(signals)}")
        historymaker.logger.info(f"Total signals today: {performance['signals_today']}")
        historymaker.logger.info(f"AI enhancement: {'✓' if performance['ai_enabled'] else '✗'}")
        historymaker.logger.info("=" * 60)
        
        return historymaker
        
    except Exception as e:
        logging.error(f"Fatal error in Historymaker-1: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(main())
