"""
Advanced Discord Integration with Webhooks, Slash Commands, and Bot Management
"""

import discord
from discord.ext import commands, tasks
import aiohttp
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import threading

class AdvancedDiscordBot:
    """Advanced Discord bot with comprehensive trading features"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Discord credentials
        self.DISCORD_TOKEN = "MTM4NTg5ODI0NjM4NzQwNDgxMA.GrIfRN.ON5jRvP8d4MPB4V9l1T05sehdsImp0AHvhamm0"
        self.DISCORD_APP_ID = "1385898246387404810"
        self.DISCORD_PUBLIC_KEY = "e22c03f407f0523cc0d533222c963b80f193b9db8a2458c6fc47899230aaf9d7"
        
        # Bot setup with all intents
        intents = discord.Intents.all()
        self.bot = commands.Bot(command_prefix='!', intents=intents)
        
        # Storage for user data, alerts, portfolios (in production use database)
        self.user_portfolios = {}
        self.price_alerts = {}
        self.watchlists = {}
        self.paper_trading_accounts = {}
        
        self.setup_events()
        self.setup_slash_commands()
        self.setup_tasks()
        
    def setup_events(self):
        """Setup Discord bot events"""
        
        @self.bot.event
        async def on_ready():
            self.logger.info(f'{self.bot.user} has connected to Discord!')
            
            # Sync slash commands
            try:
                synced = await self.bot.tree.sync()
                self.logger.info(f"Synced {len(synced)} command(s)")
            except Exception as e:
                self.logger.error(f"Failed to sync commands: {e}")
            
            # Set bot status
            await self.bot.change_presence(
                activity=discord.Activity(
                    type=discord.ActivityType.watching, 
                    name="📈 Market Data | /help"
                )
            )
            
        @self.bot.event
        async def on_member_join(member):
            """Enhanced welcome system"""
            welcome_channel = discord.utils.get(member.guild.channels, name='welcome')
            if not welcome_channel:
                welcome_channel = discord.utils.get(member.guild.channels, name='general')
            
            if welcome_channel:
                embed = discord.Embed(
                    title="🎉 Welcome to the Trading Community!",
                    description=f"Welcome {member.mention}! 🚀",
                    color=0x00ff00,
                    timestamp=datetime.now()
                )
                embed.add_field(
                    name="🚀 Getting Started",
                    value="• Use `/help` to see all commands\n• Set up alerts with `/alert`\n• Track portfolio with `/portfolio`",
                    inline=False
                )
                embed.add_field(
                    name="📚 Resources",
                    value="• `/education` for learning materials\n• `/screener` for stock discovery\n• `/paper` for practice trading",
                    inline=False
                )
                embed.set_thumbnail(url=member.avatar.url if member.avatar else member.default_avatar.url)
                
                await welcome_channel.send(embed=embed)
                
                # Give new member a welcome role if it exists
                welcome_role = discord.utils.get(member.guild.roles, name='Trader')
                if welcome_role:
                    await member.add_roles(welcome_role)
                    
        @self.bot.event
        async def on_message(message):
            if message.author == self.bot.user:
                return
                
            # Auto-respond to stock symbols mentioned
            words = message.content.upper().split()
            stock_symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX']
            
            for word in words:
                if word in stock_symbols and not message.content.startswith('!') and not message.content.startswith('/'):
                    embed = discord.Embed(
                        title=f"📊 Quick Info: {word}",
                        description=f"Use `/analyze {word}` for detailed analysis",
                        color=0x0099ff
                    )
                    await message.channel.send(embed=embed, delete_after=10)
                    break
            
            await self.bot.process_commands(message)
            
    def setup_slash_commands(self):
        """Setup modern Discord slash commands"""
        
        @self.bot.tree.command(name="help", description="Show all available commands")
        async def help_command(interaction: discord.Interaction):
            embed = discord.Embed(
                title="🤖 Trading Bot Commands",
                description="All available commands for trading and market analysis",
                color=0x0099ff
            )
            
            commands_list = [
                ("📊 `/market`", "Current market overview"),
                ("🔍 `/analyze <symbol>`", "Detailed stock analysis"),
                ("🔔 `/alert <symbol> <price>`", "Set price alerts"),
                ("💼 `/portfolio`", "Portfolio management"),
                ("👁️ `/watchlist`", "Manage watchlists"),
                ("📝 `/paper`", "Paper trading"),
                ("🏆 `/leaderboard`", "Community rankings"),
                ("📚 `/education`", "Learning resources"),
                ("🔍 `/screener`", "Stock screening"),
                ("📰 `/news`", "Market news"),
                ("📅 `/calendar`", "Economic calendar"),
                ("⚠️ `/risk`", "Risk calculator"),
                ("🎯 `/strategy`", "Trading strategies"),
                ("📈 `/chart <symbol>`", "Price charts"),
                ("🤝 `/social`", "Social trading features")
            ]
            
            for name, desc in commands_list:
                embed.add_field(name=name, value=desc, inline=True)
                
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        @self.bot.tree.command(name="market", description="Get current market overview")
        async def market_slash(interaction: discord.Interaction):
            await interaction.response.defer()
            
            try:
                from data_fetcher import DataFetcher
                fetcher = DataFetcher()
                market_data = fetcher.fetch_market_overview()
                
                embed = discord.Embed(
                    title="📊 Live Market Overview",
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
                            value=f"${price:.2f}\n{change_pct:+.2f}%",
                            inline=True
                        )
                
                if 'VIX' in market_data:
                    vix_value = market_data['VIX']['value']
                    vix_status = "HIGH" if vix_value > 30 else "MODERATE" if vix_value > 20 else "LOW"
                    embed.add_field(
                        name="🌪️ VIX",
                        value=f"{vix_value:.2f}\n({vix_status})",
                        inline=True
                    )
                
                await interaction.followup.send(embed=embed)
                
            except Exception as e:
                await interaction.followup.send(f"❌ Error: {str(e)}", ephemeral=True)
                
        @self.bot.tree.command(name="analyze", description="Analyze a specific stock")
        async def analyze_slash(interaction: discord.Interaction, symbol: str):
            await interaction.response.defer()
            
            try:
                from data_fetcher import DataFetcher
                from technical_analysis import TechnicalAnalysis
                
                symbol = symbol.upper()
                fetcher = DataFetcher()
                analyzer = TechnicalAnalysis()
                
                data = fetcher.fetch_stock_data(symbol, "daily")
                if data is None or len(data) < 50:
                    await interaction.followup.send(f"❌ Insufficient data for {symbol}", ephemeral=True)
                    return
                
                analysis = analyzer.analyze_stock(symbol, data)
                if not analysis:
                    await interaction.followup.send(f"❌ Analysis failed for {symbol}", ephemeral=True)
                    return
                
                # Create comprehensive analysis embed
                embed = discord.Embed(
                    title=f"📈 Deep Analysis: {symbol}",
                    color=0x0099ff,
                    timestamp=datetime.now()
                )
                
                # Price section
                price = analysis.get('current_price', 0)
                change = analysis.get('price_change', 0)
                volume_ratio = analysis.get('volume_ratio', 1)
                
                embed.add_field(
                    name="💰 Price Data",
                    value=f"**Current:** ${price:.2f}\n**Change:** {change:+.2f}%\n**Volume:** {volume_ratio:.1f}x avg",
                    inline=True
                )
                
                # Technical indicators
                rsi = analysis.get('rsi', 50)
                rsi_status = "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral"
                
                macd_data = analysis.get('macd', {})
                macd_trend = "Bullish" if macd_data.get('histogram', 0) > 0 else "Bearish"
                
                embed.add_field(
                    name="📊 Technical Indicators",
                    value=f"**RSI:** {rsi:.1f} ({rsi_status})\n**MACD:** {macd_trend}\n**Trend:** Strong",
                    inline=True
                )
                
                # Signal
                signals = analysis.get('signals', {})
                signal = signals.get('overall_signal', 'HOLD')
                confidence = signals.get('confidence', 0.5)
                
                signal_emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}
                confidence_text = "HIGH" if confidence >= 0.8 else "MEDIUM" if confidence >= 0.6 else "LOW"
                
                embed.add_field(
                    name="🎯 AI Signal",
                    value=f"{signal_emoji.get(signal, '🟡')} **{signal}**\n**Confidence:** {confidence:.1%}\n**Rating:** {confidence_text}",
                    inline=True
                )
                
                # Support/Resistance
                sr_data = analysis.get('support_resistance', {})
                support = sr_data.get('support', 0)
                resistance = sr_data.get('resistance', 0)
                
                embed.add_field(
                    name="📍 Key Levels",
                    value=f"**Support:** ${support:.2f}\n**Resistance:** ${resistance:.2f}\n**Pivot:** ${sr_data.get('pivot', 0):.2f}",
                    inline=True
                )
                
                await interaction.followup.send(embed=embed)
                
            except Exception as e:
                await interaction.followup.send(f"❌ Error analyzing {symbol}: {str(e)}", ephemeral=True)
                
        @self.bot.tree.command(name="alert", description="Set a price alert for a stock")
        async def alert_slash(interaction: discord.Interaction, symbol: str, price: float):
            user_id = interaction.user.id
            symbol = symbol.upper()
            
            # Store alert
            if user_id not in self.price_alerts:
                self.price_alerts[user_id] = []
                
            alert = {
                'symbol': symbol,
                'price': price,
                'timestamp': datetime.now().isoformat(),
                'triggered': False
            }
            
            self.price_alerts[user_id].append(alert)
            
            embed = discord.Embed(
                title="🔔 Alert Set Successfully",
                description=f"Price alert for **{symbol}** at **${price:.2f}**",
                color=0x00ff00
            )
            embed.add_field(
                name="📊 Alert Details",
                value=f"You'll be notified when {symbol} reaches ${price:.2f}",
                inline=False
            )
            
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        @self.bot.tree.command(name="portfolio", description="View and manage your portfolio")
        async def portfolio_slash(interaction: discord.Interaction, 
                                action: str = "view", 
                                symbol: str = None, 
                                quantity: int = None, 
                                price: float = None):
            user_id = interaction.user.id
            
            if user_id not in self.user_portfolios:
                self.user_portfolios[user_id] = {}
                
            portfolio = self.user_portfolios[user_id]
            
            if action.lower() == "add" and symbol and quantity and price:
                symbol = symbol.upper()
                portfolio[symbol] = {
                    'quantity': quantity,
                    'avg_price': price,
                    'timestamp': datetime.now().isoformat()
                }
                
                embed = discord.Embed(
                    title="✅ Position Added",
                    description=f"Added {quantity} shares of {symbol} at ${price:.2f}",
                    color=0x00ff00
                )
                
            elif action.lower() == "remove" and symbol:
                symbol = symbol.upper()
                if symbol in portfolio:
                    del portfolio[symbol]
                    embed = discord.Embed(
                        title="❌ Position Removed",
                        description=f"Removed {symbol} from portfolio",
                        color=0xff0000
                    )
                else:
                    embed = discord.Embed(
                        title="⚠️ Not Found",
                        description=f"{symbol} not found in portfolio",
                        color=0xffaa00
                    )
                    
            else:  # view
                embed = discord.Embed(
                    title="💼 Your Portfolio",
                    color=0x9932cc,
                    timestamp=datetime.now()
                )
                
                if portfolio:
                    total_value = 0
                    for symbol, data in portfolio.items():
                        qty = data['quantity']
                        avg_price = data['avg_price']
                        current_value = qty * avg_price  # In production, use current price
                        total_value += current_value
                        
                        embed.add_field(
                            name=f"📊 {symbol}",
                            value=f"**Qty:** {qty}\n**Avg:** ${avg_price:.2f}\n**Value:** ${current_value:.2f}",
                            inline=True
                        )
                    
                    embed.add_field(
                        name="💰 Total Portfolio Value",
                        value=f"${total_value:.2f}",
                        inline=False
                    )
                else:
                    embed.add_field(
                        name="📝 Empty Portfolio",
                        value="Use `/portfolio add SYMBOL QTY PRICE` to add positions",
                        inline=False
                    )
            
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        @self.bot.tree.command(name="paper", description="Paper trading with virtual money")
        async def paper_slash(interaction: discord.Interaction, 
                            action: str = "balance", 
                            symbol: str = None, 
                            quantity: int = None):
            user_id = interaction.user.id
            
            if user_id not in self.paper_trading_accounts:
                self.paper_trading_accounts[user_id] = {
                    'balance': 100000.0,  # Starting $100K
                    'positions': {},
                    'trade_history': []
                }
                
            account = self.paper_trading_accounts[user_id]
            
            if action.lower() == "buy" and symbol and quantity:
                # Simulate buying (in production, use real prices)
                symbol = symbol.upper()
                price = 100.0  # Mock price
                cost = quantity * price
                
                if cost <= account['balance']:
                    account['balance'] -= cost
                    if symbol in account['positions']:
                        account['positions'][symbol] += quantity
                    else:
                        account['positions'][symbol] = quantity
                        
                    account['trade_history'].append({
                        'action': 'BUY',
                        'symbol': symbol,
                        'quantity': quantity,
                        'price': price,
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    embed = discord.Embed(
                        title="✅ Paper Trade Executed",
                        description=f"Bought {quantity} shares of {symbol} at ${price:.2f}",
                        color=0x00ff00
                    )
                else:
                    embed = discord.Embed(
                        title="❌ Insufficient Funds",
                        description=f"Need ${cost:.2f}, have ${account['balance']:.2f}",
                        color=0xff0000
                    )
                    
            elif action.lower() == "sell" and symbol and quantity:
                symbol = symbol.upper()
                if symbol in account['positions'] and account['positions'][symbol] >= quantity:
                    price = 105.0  # Mock price with small profit
                    revenue = quantity * price
                    
                    account['balance'] += revenue
                    account['positions'][symbol] -= quantity
                    if account['positions'][symbol] == 0:
                        del account['positions'][symbol]
                        
                    account['trade_history'].append({
                        'action': 'SELL',
                        'symbol': symbol,
                        'quantity': quantity,
                        'price': price,
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    embed = discord.Embed(
                        title="✅ Paper Trade Executed",
                        description=f"Sold {quantity} shares of {symbol} at ${price:.2f}",
                        color=0x00ff00
                    )
                else:
                    embed = discord.Embed(
                        title="❌ Insufficient Shares",
                        description=f"Don't own enough {symbol} shares",
                        color=0xff0000
                    )
                    
            else:  # balance/view
                embed = discord.Embed(
                    title="📝 Paper Trading Account",
                    color=0x00ff99,
                    timestamp=datetime.now()
                )
                
                embed.add_field(
                    name="💰 Account Balance",
                    value=f"${account['balance']:.2f}",
                    inline=True
                )
                
                total_positions_value = sum(qty * 102.5 for qty in account['positions'].values())  # Mock current values
                embed.add_field(
                    name="📊 Positions Value",
                    value=f"${total_positions_value:.2f}",
                    inline=True
                )
                
                total_account_value = account['balance'] + total_positions_value
                pnl = total_account_value - 100000.0
                pnl_pct = (pnl / 100000.0) * 100
                
                embed.add_field(
                    name="📈 Total P&L",
                    value=f"${pnl:+.2f} ({pnl_pct:+.2f}%)",
                    inline=True
                )
                
                if account['positions']:
                    positions_text = "\n".join([f"{symbol}: {qty} shares" for symbol, qty in account['positions'].items()])
                    embed.add_field(
                        name="📊 Current Positions",
                        value=positions_text,
                        inline=False
                    )
            
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        @self.bot.tree.command(name="screener", description="Screen stocks based on criteria")
        async def screener_slash(interaction: discord.Interaction, criteria: str = "volume"):
            await interaction.response.defer()
            
            embed = discord.Embed(
                title="🔍 Stock Screener Results",
                description=f"Stocks matching criteria: {criteria}",
                color=0x00cccc
            )
            
            # Mock screener results (in production, implement real screening)
            if criteria.lower() == "rsi_oversold":
                results = [
                    "AAPL - RSI: 28.5 (Oversold)",
                    "MSFT - RSI: 25.1 (Oversold)", 
                    "GOOGL - RSI: 29.8 (Oversold)"
                ]
            elif criteria.lower() == "volume":
                results = [
                    "TSLA - Volume: 3.2x average",
                    "NVDA - Volume: 2.8x average",
                    "META - Volume: 2.1x average"
                ]
            else:
                results = [
                    "AMZN - Breakout above resistance",
                    "NFLX - Strong momentum",
                    "SPY - Bullish pattern"
                ]
            
            embed.add_field(
                name="📊 Matching Stocks",
                value="\n".join(results),
                inline=False
            )
            
            await interaction.followup.send(embed=embed)
            
    def setup_tasks(self):
        """Setup recurring tasks"""
        
        @tasks.loop(minutes=15)
        async def check_price_alerts():
            """Check and trigger price alerts"""
            try:
                from data_fetcher import DataFetcher
                fetcher = DataFetcher()
                
                for user_id, alerts in self.price_alerts.items():
                    for alert in alerts:
                        if alert['triggered']:
                            continue
                            
                        symbol = alert['symbol']
                        target_price = alert['price']
                        
                        # Get current price
                        data = fetcher.fetch_stock_data(symbol, "daily")
                        if data is not None and len(data) > 0:
                            current_price = data['close'].iloc[-1]
                            
                            # Check if alert should trigger (simple implementation)
                            if abs(current_price - target_price) / target_price < 0.02:  # Within 2%
                                alert['triggered'] = True
                                
                                # Send DM to user
                                user = self.bot.get_user(user_id)
                                if user:
                                    embed = discord.Embed(
                                        title="🔔 Price Alert Triggered!",
                                        description=f"{symbol} has reached your target price",
                                        color=0xff6600
                                    )
                                    embed.add_field(
                                        name="📊 Details",
                                        value=f"**Target:** ${target_price:.2f}\n**Current:** ${current_price:.2f}",
                                        inline=False
                                    )
                                    
                                    try:
                                        await user.send(embed=embed)
                                    except discord.Forbidden:
                                        pass  # User has DMs disabled
                                        
            except Exception as e:
                self.logger.error(f"Error checking price alerts: {e}")
                
        @tasks.loop(hours=1)
        async def market_updates():
            """Send periodic market updates to channels"""
            try:
                # Send market summary to designated channels
                for guild in self.bot.guilds:
                    trading_channel = discord.utils.get(guild.channels, name='trading-signals')
                    if trading_channel:
                        embed = discord.Embed(
                            title="📊 Hourly Market Update",
                            description="Current market overview",
                            color=0x0099ff,
                            timestamp=datetime.now()
                        )
                        
                        # Add basic market info (in production, use real data)
                        embed.add_field(name="📈 SPY", value="$450.25 (+0.8%)", inline=True)
                        embed.add_field(name="📊 QQQ", value="$380.15 (+1.2%)", inline=True)
                        embed.add_field(name="🌪️ VIX", value="18.5 (Low)", inline=True)
                        
                        await trading_channel.send(embed=embed)
                        
            except Exception as e:
                self.logger.error(f"Error sending market updates: {e}")
                
        # Start tasks when bot is ready
        @self.bot.event
        async def on_ready_tasks():
            if not check_price_alerts.is_running():
                check_price_alerts.start()
            if not market_updates.is_running():
                market_updates.start()
                
    async def send_webhook_message(self, webhook_url: str, content: Dict[str, Any]):
        """Send message via Discord webhook"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(webhook_url, json=content) as response:
                    if response.status == 204:
                        return True
                    else:
                        self.logger.error(f"Webhook failed with status {response.status}")
                        return False
        except Exception as e:
            self.logger.error(f"Webhook error: {e}")
            return False
            
    def run_in_thread(self):
        """Run Discord bot in a separate thread"""
        def run_bot():
            try:
                asyncio.run(self.bot.start(self.DISCORD_TOKEN))
            except Exception as e:
                self.logger.error(f"Discord bot error: {e}")
                
        thread = threading.Thread(target=run_bot, daemon=True)
        thread.start()
        return thread
        
    def run(self):
        """Run the Discord bot"""
        try:
            self.bot.run(self.DISCORD_TOKEN)
        except Exception as e:
            self.logger.error(f"Error starting Discord bot: {str(e)}")

if __name__ == "__main__":
    bot = AdvancedDiscordBot()
    bot.run()