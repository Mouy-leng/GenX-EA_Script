"""
Discord Bot with comprehensive features using Discord API
"""

import discord
from discord.ext import commands
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime
import json
import os

class TradingDiscordBot:
    """Comprehensive Discord bot for trading signals and community features"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Discord configuration
        self.DISCORD_TOKEN = "MTM4NTg5ODI0NjM4NzQwNDgxMA.GrIfRN.ON5jRvP8d4MPB4V9l1T05sehdsImp0AHvhamm0"
        self.DISCORD_APP_ID = "1385898246387404810"
        self.DISCORD_PUBLIC_KEY = "e22c03f407f0523cc0d533222c963b80f193b9db8a2458c6fc47899230aaf9d7"
        
        # Bot setup with all intents for maximum functionality
        intents = discord.Intents.all()
        self.bot = commands.Bot(command_prefix='!', intents=intents)
        
        # Setup bot events and commands
        self.setup_events()
        self.setup_commands()
        
    def setup_events(self):
        """Setup Discord bot events"""
        
        @self.bot.event
        async def on_ready():
            self.logger.info(f'{self.bot.user} has connected to Discord!')
            await self.bot.change_presence(
                activity=discord.Activity(
                    type=discord.ActivityType.watching, 
                    name="📈 Market Signals"
                )
            )
            
        @self.bot.event
        async def on_member_join(member):
            """Welcome new members"""
            channel = discord.utils.get(member.guild.channels, name='general')
            if channel:
                embed = discord.Embed(
                    title="🎉 Welcome to Trading Community!",
                    description=f"Welcome {member.mention}! Use `!help` to see available commands.",
                    color=0x00ff00
                )
                await channel.send(embed=embed)
                
        @self.bot.event
        async def on_message(message):
            if message.author == self.bot.user:
                return
            
            # Process commands
            await self.bot.process_commands(message)
            
    def setup_commands(self):
        """Setup Discord bot commands with comprehensive functionality"""
        
        @self.bot.command(name='ping')
        async def ping(ctx):
            """Check bot latency"""
            latency = round(self.bot.latency * 1000)
            embed = discord.Embed(
                title="🏓 Pong!",
                description=f"Bot latency: {latency}ms",
                color=0x00ff00
            )
            await ctx.send(embed=embed)
            
        @self.bot.command(name='market')
        async def market_status(ctx):
            """Get current market overview"""
            from data_fetcher import DataFetcher
            
            try:
                fetcher = DataFetcher()
                market_data = fetcher.fetch_market_overview()
                
                embed = discord.Embed(
                    title="📊 Market Overview",
                    color=0x0099ff,
                    timestamp=datetime.now()
                )
                
                for symbol, data in market_data.items():
                    if symbol != 'VIX':
                        price = data.get('price', 0)
                        change_pct = data.get('change_pct', 0)
                        emoji = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
                        embed.add_field(
                            name=f"{emoji} {symbol}",
                            value=f"${price:.2f} ({change_pct:+.2f}%)",
                            inline=True
                        )
                
                if 'VIX' in market_data:
                    vix_value = market_data['VIX']['value']
                    vix_status = "HIGH" if vix_value > 30 else "MODERATE" if vix_value > 20 else "LOW"
                    embed.add_field(
                        name="🌪️ VIX (Volatility)",
                        value=f"{vix_value:.2f} ({vix_status})",
                        inline=True
                    )
                
                await ctx.send(embed=embed)
                
            except Exception as e:
                await ctx.send(f"❌ Error fetching market data: {str(e)}")
                
        @self.bot.command(name='analyze')
        async def analyze_stock(ctx, symbol: str):
            """Analyze a specific stock"""
            from data_fetcher import DataFetcher
            from technical_analysis import TechnicalAnalysis
            
            try:
                symbol = symbol.upper()
                fetcher = DataFetcher()
                analyzer = TechnicalAnalysis()
                
                # Fetch data
                data = fetcher.fetch_stock_data(symbol, "daily")
                if data is None or len(data) < 50:
                    await ctx.send(f"❌ Insufficient data for {symbol}")
                    return
                
                # Perform analysis
                analysis = analyzer.analyze_stock(symbol, data)
                if not analysis:
                    await ctx.send(f"❌ Analysis failed for {symbol}")
                    return
                
                # Create detailed embed
                embed = discord.Embed(
                    title=f"📈 Analysis: {symbol}",
                    color=0x0099ff,
                    timestamp=datetime.now()
                )
                
                # Price info
                price = analysis.get('current_price', 0)
                change = analysis.get('price_change', 0)
                embed.add_field(
                    name="💰 Current Price",
                    value=f"${price:.2f} ({change:+.2f}%)",
                    inline=True
                )
                
                # Technical indicators
                rsi = analysis.get('rsi', 50)
                rsi_status = "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral"
                embed.add_field(
                    name="📊 RSI",
                    value=f"{rsi:.1f} ({rsi_status})",
                    inline=True
                )
                
                # Signals
                signals = analysis.get('signals', {})
                signal = signals.get('overall_signal', 'HOLD')
                confidence = signals.get('confidence', 0.5)
                
                signal_emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}
                embed.add_field(
                    name="🎯 Signal",
                    value=f"{signal_emoji.get(signal, '🟡')} {signal} ({confidence:.1%})",
                    inline=True
                )
                
                await ctx.send(embed=embed)
                
            except Exception as e:
                await ctx.send(f"❌ Error analyzing {symbol}: {str(e)}")
                
        @self.bot.command(name='alerts')
        async def setup_alerts(ctx, symbol: str = None, threshold: float = None):
            """Setup price alerts for stocks"""
            if not symbol or threshold is None:
                embed = discord.Embed(
                    title="🔔 Price Alerts",
                    description="Usage: `!alerts SYMBOL PRICE`\nExample: `!alerts AAPL 150.00`",
                    color=0xffaa00
                )
                await ctx.send(embed=embed)
                return
                
            # Store alert (in production, use database)
            alert_data = {
                'user_id': ctx.author.id,
                'symbol': symbol.upper(),
                'threshold': threshold,
                'timestamp': datetime.now().isoformat()
            }
            
            embed = discord.Embed(
                title="✅ Alert Set",
                description=f"Price alert set for {symbol.upper()} at ${threshold:.2f}",
                color=0x00ff00
            )
            await ctx.send(embed=embed)
            
        @self.bot.command(name='portfolio')
        async def portfolio_tracker(ctx):
            """Portfolio tracking and management"""
            embed = discord.Embed(
                title="💼 Portfolio Tracker",
                description="Track your investment portfolio",
                color=0x9932cc
            )
            embed.add_field(
                name="📊 Features",
                value="• Real-time portfolio value\n• P&L tracking\n• Performance analytics\n• Risk metrics",
                inline=False
            )
            embed.add_field(
                name="🔧 Commands",
                value="`!portfolio add SYMBOL QUANTITY PRICE`\n`!portfolio remove SYMBOL`\n`!portfolio view`",
                inline=False
            )
            await ctx.send(embed=embed)
            
        @self.bot.command(name='news')
        async def market_news(ctx, symbol: str = None):
            """Get market news and updates"""
            embed = discord.Embed(
                title="📰 Market News",
                description="Latest market updates and financial news",
                color=0xff6600
            )
            
            if symbol:
                embed.add_field(
                    name=f"📈 {symbol.upper()} News",
                    value="Recent news and analysis for this stock",
                    inline=False
                )
            else:
                embed.add_field(
                    name="🌍 General Market",
                    value="Overall market sentiment and major news",
                    inline=False
                )
                
            await ctx.send(embed=embed)
            
        @self.bot.command(name='screener')
        async def stock_screener(ctx, *criteria):
            """Stock screening based on technical criteria"""
            embed = discord.Embed(
                title="🔍 Stock Screener",
                description="Find stocks based on technical criteria",
                color=0x00cccc
            )
            
            embed.add_field(
                name="📊 Available Filters",
                value="• RSI oversold/overbought\n• Volume surge\n• Price breakouts\n• Moving average crossovers",
                inline=False
            )
            
            embed.add_field(
                name="🔧 Usage",
                value="`!screener rsi_oversold`\n`!screener volume_surge`\n`!screener breakout`",
                inline=False
            )
            
            await ctx.send(embed=embed)
            
        @self.bot.command(name='education')
        async def trading_education(ctx, topic: str = None):
            """Trading education and learning resources"""
            embed = discord.Embed(
                title="📚 Trading Education",
                color=0x9900cc
            )
            
            if topic:
                topics = {
                    'rsi': "**RSI (Relative Strength Index)**\nMeasures overbought/oversold conditions\n• Above 70: Overbought\n• Below 30: Oversold",
                    'macd': "**MACD (Moving Average Convergence Divergence)**\nTrend following momentum indicator\n• Signal line crossovers\n• Histogram analysis",
                    'support': "**Support & Resistance**\nKey price levels where stocks tend to bounce\n• Support: Price floor\n• Resistance: Price ceiling"
                }
                
                content = topics.get(topic.lower(), "Topic not found. Available: rsi, macd, support")
                embed.add_field(name="📖 Learning", value=content, inline=False)
            else:
                embed.add_field(
                    name="📈 Available Topics",
                    value="`!education rsi`\n`!education macd`\n`!education support`",
                    inline=False
                )
                
            await ctx.send(embed=embed)
            
        @self.bot.command(name='leaderboard')
        async def trading_leaderboard(ctx):
            """Community trading performance leaderboard"""
            embed = discord.Embed(
                title="🏆 Trading Leaderboard",
                description="Top performers in our trading community",
                color=0xffd700
            )
            
            # Mock leaderboard data (in production, use real user data)
            leaderboard = [
                "🥇 TradingMaster - +15.2% this month",
                "🥈 StockGuru - +12.8% this month", 
                "🥉 MarketWiz - +10.5% this month"
            ]
            
            embed.add_field(
                name="📊 Monthly Performance",
                value="\n".join(leaderboard),
                inline=False
            )
            
            await ctx.send(embed=embed)
            
        @self.bot.command(name='paper')
        async def paper_trading(ctx):
            """Paper trading simulation"""
            embed = discord.Embed(
                title="📝 Paper Trading",
                description="Practice trading with virtual money",
                color=0x00ff99
            )
            
            embed.add_field(
                name="💰 Virtual Account",
                value="Starting balance: $100,000\nCurrent P&L: +$2,500 (+2.5%)",
                inline=False
            )
            
            embed.add_field(
                name="🔧 Commands",
                value="`!paper buy SYMBOL QUANTITY`\n`!paper sell SYMBOL QUANTITY`\n`!paper balance`",
                inline=False
            )
            
            await ctx.send(embed=embed)
            
        @self.bot.command(name='watchlist')
        async def watchlist_management(ctx, action: str = None, symbol: str = None):
            """Manage personal watchlists"""
            if not action:
                embed = discord.Embed(
                    title="👁️ Watchlist Manager",
                    description="Manage your personal stock watchlists",
                    color=0xff9900
                )
                embed.add_field(
                    name="🔧 Commands",
                    value="`!watchlist add SYMBOL`\n`!watchlist remove SYMBOL`\n`!watchlist view`",
                    inline=False
                )
                await ctx.send(embed=embed)
                return
                
            if action.lower() == 'add' and symbol:
                embed = discord.Embed(
                    title="✅ Added to Watchlist",
                    description=f"{symbol.upper()} has been added to your watchlist",
                    color=0x00ff00
                )
            elif action.lower() == 'view':
                embed = discord.Embed(
                    title="👁️ Your Watchlist",
                    description="AAPL, GOOGL, TSLA, NVDA",
                    color=0x0099ff
                )
            else:
                embed = discord.Embed(
                    title="❌ Invalid Command",
                    description="Use `!watchlist` for help",
                    color=0xff0000
                )
                
            await ctx.send(embed=embed)
            
        @self.bot.command(name='calendar')
        async def economic_calendar(ctx):
            """Economic calendar and events"""
            embed = discord.Embed(
                title="📅 Economic Calendar",
                description="Upcoming economic events and earnings",
                color=0x6600cc
            )
            
            events = [
                "📊 GDP Report - Tomorrow 8:30 AM",
                "💼 AAPL Earnings - Thursday After Market",
                "🏦 Fed Meeting - Next Week"
            ]
            
            embed.add_field(
                name="📈 Upcoming Events",
                value="\n".join(events),
                inline=False
            )
            
            await ctx.send(embed=embed)
            
        @self.bot.command(name='risk')
        async def risk_calculator(ctx, position_size: float = None, stop_loss: float = None):
            """Risk management calculator"""
            if not position_size or not stop_loss:
                embed = discord.Embed(
                    title="⚠️ Risk Calculator",
                    description="Calculate position risk and sizing",
                    color=0xff4400
                )
                embed.add_field(
                    name="🔧 Usage",
                    value="`!risk POSITION_SIZE STOP_LOSS_PERCENT`\nExample: `!risk 1000 5`",
                    inline=False
                )
                await ctx.send(embed=embed)
                return
                
            risk_amount = position_size * (stop_loss / 100)
            embed = discord.Embed(
                title="📊 Risk Analysis",
                color=0xff4400
            )
            embed.add_field(name="💰 Position Size", value=f"${position_size:.2f}", inline=True)
            embed.add_field(name="🛑 Stop Loss", value=f"{stop_loss}%", inline=True)
            embed.add_field(name="⚠️ Risk Amount", value=f"${risk_amount:.2f}", inline=True)
            
            await ctx.send(embed=embed)
            
    async def send_trading_signal(self, guild_id: int, channel_name: str, signal_data: Dict):
        """Send trading signal to Discord channel"""
        try:
            guild = self.bot.get_guild(guild_id)
            if not guild:
                self.logger.error(f"Guild {guild_id} not found")
                return False
                
            channel = discord.utils.get(guild.channels, name=channel_name)
            if not channel:
                self.logger.error(f"Channel {channel_name} not found")
                return False
                
            # Create rich embed for signal
            symbol = signal_data.get('symbol', 'Unknown')
            signal = signal_data.get('final_signal', 'HOLD')
            confidence = signal_data.get('final_confidence', 0.5)
            price = signal_data.get('current_price', 0)
            
            color = 0x00ff00 if signal == 'BUY' else 0xff0000 if signal == 'SELL' else 0xffff00
            signal_emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}
            
            embed = discord.Embed(
                title=f"🚨 AI Trading Signal: {symbol}",
                description=f"{signal_emoji.get(signal, '🟡')} **{signal}** Signal",
                color=color,
                timestamp=datetime.now()
            )
            
            embed.add_field(name="💰 Price", value=f"${price:.2f}", inline=True)
            embed.add_field(name="🎯 Confidence", value=f"{confidence:.1%}", inline=True)
            embed.add_field(name="📊 RSI", value=f"{signal_data.get('rsi', 50):.1f}", inline=True)
            
            # Add footer
            embed.set_footer(text="AI Trading Bot", icon_url="https://example.com/bot-icon.png")
            
            await channel.send(embed=embed)
            return True
            
        except Exception as e:
            self.logger.error(f"Error sending Discord signal: {str(e)}")
            return False
            
    def run(self):
        """Start the Discord bot"""
        try:
            self.bot.run(self.DISCORD_TOKEN)
        except Exception as e:
            self.logger.error(f"Error starting Discord bot: {str(e)}")
            
    def run_async(self):
        """Run Discord bot asynchronously"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self.bot.start(self.DISCORD_TOKEN))
        except Exception as e:
            self.logger.error(f"Error running Discord bot async: {str(e)}")
        finally:
            loop.close()

if __name__ == "__main__":
    bot = TradingDiscordBot()
    bot.run()