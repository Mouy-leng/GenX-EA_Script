"""
Discord Webhooks and Advanced Integrations
"""

import aiohttp
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import requests
from dataclasses import dataclass

@dataclass
class WebhookMessage:
    """Structure for Discord webhook messages"""
    content: str = ""
    username: str = "Trading Bot"
    avatar_url: str = ""
    embeds: List[Dict] = None
    
class DiscordWebhookManager:
    """Advanced Discord webhook management"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Example webhook URLs (replace with actual webhook URLs from Discord channels)
        self.webhooks = {
            'trading_signals': None,  # Add your webhook URL here
            'market_updates': None,   # Add your webhook URL here
            'alerts': None,          # Add your webhook URL here
            'news': None            # Add your webhook URL here
        }
        
    def create_trading_signal_embed(self, signal_data: Dict) -> Dict:
        """Create rich embed for trading signals"""
        symbol = signal_data.get('symbol', 'Unknown')
        signal = signal_data.get('final_signal', 'HOLD')
        confidence = signal_data.get('final_confidence', 0.5)
        price = signal_data.get('current_price', 0)
        change = signal_data.get('price_change', 0)
        
        # Determine colors based on signal
        color_map = {"BUY": 0x00ff00, "SELL": 0xff0000, "HOLD": 0xffff00}
        color = color_map.get(signal, 0xffff00)
        
        # Signal emoji
        emoji_map = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}
        emoji = emoji_map.get(signal, "🟡")
        
        embed = {
            "title": f"{emoji} AI Trading Signal: {symbol}",
            "description": f"**{signal}** recommendation with {confidence:.1%} confidence",
            "color": color,
            "timestamp": datetime.now().isoformat(),
            "fields": [
                {
                    "name": "💰 Current Price",
                    "value": f"${price:.2f}",
                    "inline": True
                },
                {
                    "name": "📊 Price Change",
                    "value": f"{change:+.2f}%",
                    "inline": True
                },
                {
                    "name": "🎯 Confidence",
                    "value": f"{confidence:.1%}",
                    "inline": True
                }
            ],
            "footer": {
                "text": "AI Trading Bot • Real-time Analysis",
                "icon_url": "https://cdn.discordapp.com/attachments/placeholder/trading-bot-icon.png"
            }
        }
        
        # Add technical analysis details
        if 'rsi' in signal_data:
            rsi = signal_data['rsi']
            rsi_status = "Overbought" if rsi > 70 else "Oversold" if rsi < 30 else "Neutral"
            embed['fields'].append({
                "name": "📈 RSI",
                "value": f"{rsi:.1f} ({rsi_status})",
                "inline": True
            })
            
        if 'macd' in signal_data:
            macd_data = signal_data['macd']
            trend = "Bullish" if macd_data.get('histogram', 0) > 0 else "Bearish"
            embed['fields'].append({
                "name": "📊 MACD",
                "value": trend,
                "inline": True
            })
            
        if 'volume_ratio' in signal_data:
            vol_ratio = signal_data['volume_ratio']
            embed['fields'].append({
                "name": "📊 Volume",
                "value": f"{vol_ratio:.1f}x average",
                "inline": True
            })
            
        # Add risk warning
        embed['fields'].append({
            "name": "⚠️ Risk Warning",
            "value": "This is an AI-generated signal for informational purposes only. Always conduct your own research.",
            "inline": False
        })
        
        return embed
        
    def create_market_overview_embed(self, market_data: Dict) -> Dict:
        """Create market overview embed"""
        embed = {
            "title": "📊 Market Overview",
            "description": "Current market status and major indices",
            "color": 0x0099ff,
            "timestamp": datetime.now().isoformat(),
            "fields": []
        }
        
        # Add major indices
        indices = ['SPY', 'QQQ', 'DIA', 'IWM']
        for index in indices:
            if index in market_data:
                data = market_data[index]
                price = data.get('price', 0)
                change_pct = data.get('change_pct', 0)
                emoji = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
                
                embed['fields'].append({
                    "name": f"{emoji} {index}",
                    "value": f"${price:.2f}\n{change_pct:+.2f}%",
                    "inline": True
                })
                
        # Add VIX
        if 'VIX' in market_data:
            vix_data = market_data['VIX']
            vix_value = vix_data.get('value', 0)
            vix_status = "HIGH" if vix_value > 30 else "MODERATE" if vix_value > 20 else "LOW"
            embed['fields'].append({
                "name": "🌪️ VIX (Fear Index)",
                "value": f"{vix_value:.2f}\n({vix_status} volatility)",
                "inline": True
            })
            
        return embed
        
    def create_price_alert_embed(self, symbol: str, target_price: float, current_price: float) -> Dict:
        """Create price alert embed"""
        direction = "📈" if current_price >= target_price else "📉"
        
        embed = {
            "title": f"🔔 Price Alert Triggered: {symbol}",
            "description": f"{direction} Target price reached!",
            "color": 0xff6600,
            "timestamp": datetime.now().isoformat(),
            "fields": [
                {
                    "name": "🎯 Target Price",
                    "value": f"${target_price:.2f}",
                    "inline": True
                },
                {
                    "name": "💰 Current Price", 
                    "value": f"${current_price:.2f}",
                    "inline": True
                },
                {
                    "name": "📊 Difference",
                    "value": f"{((current_price - target_price) / target_price * 100):+.2f}%",
                    "inline": True
                }
            ]
        }
        
        return embed
        
    async def send_webhook_async(self, webhook_type: str, message: WebhookMessage) -> bool:
        """Send message via webhook asynchronously"""
        if webhook_type not in self.webhooks or not self.webhooks[webhook_type]:
            self.logger.warning(f"No webhook URL configured for {webhook_type}")
            return False
            
        webhook_url = self.webhooks[webhook_type]
        
        payload = {
            "content": message.content,
            "username": message.username,
            "avatar_url": message.avatar_url
        }
        
        if message.embeds:
            payload["embeds"] = message.embeds
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(webhook_url, json=payload) as response:
                    if response.status == 204:
                        self.logger.info(f"Webhook message sent successfully to {webhook_type}")
                        return True
                    else:
                        self.logger.error(f"Webhook failed with status {response.status}")
                        return False
        except Exception as e:
            self.logger.error(f"Webhook error: {e}")
            return False
            
    def send_webhook_sync(self, webhook_type: str, message: WebhookMessage) -> bool:
        """Send message via webhook synchronously"""
        if webhook_type not in self.webhooks or not self.webhooks[webhook_type]:
            self.logger.warning(f"No webhook URL configured for {webhook_type}")
            return False
            
        webhook_url = self.webhooks[webhook_type]
        
        payload = {
            "content": message.content,
            "username": message.username,
            "avatar_url": message.avatar_url
        }
        
        if message.embeds:
            payload["embeds"] = message.embeds
            
        try:
            response = requests.post(webhook_url, json=payload, timeout=10)
            if response.status_code == 204:
                self.logger.info(f"Webhook message sent successfully to {webhook_type}")
                return True
            else:
                self.logger.error(f"Webhook failed with status {response.status_code}")
                return False
        except Exception as e:
            self.logger.error(f"Webhook error: {e}")
            return False
            
    def send_trading_signal(self, signal_data: Dict) -> bool:
        """Send trading signal via webhook"""
        embed = self.create_trading_signal_embed(signal_data)
        message = WebhookMessage(
            embeds=[embed],
            username="AI Trading Bot",
            avatar_url="https://cdn.discordapp.com/attachments/placeholder/trading-bot-icon.png"
        )
        
        return self.send_webhook_sync('trading_signals', message)
        
    def send_market_update(self, market_data: Dict) -> bool:
        """Send market overview via webhook"""
        embed = self.create_market_overview_embed(market_data)
        message = WebhookMessage(
            embeds=[embed],
            username="Market Bot",
            avatar_url="https://cdn.discordapp.com/attachments/placeholder/market-bot-icon.png"
        )
        
        return self.send_webhook_sync('market_updates', message)
        
    def send_price_alert(self, symbol: str, target_price: float, current_price: float) -> bool:
        """Send price alert via webhook"""
        embed = self.create_price_alert_embed(symbol, target_price, current_price)
        message = WebhookMessage(
            embeds=[embed],
            username="Alert Bot",
            avatar_url="https://cdn.discordapp.com/attachments/placeholder/alert-bot-icon.png"
        )
        
        return self.send_webhook_sync('alerts', message)
        
    def send_custom_message(self, webhook_type: str, title: str, description: str, 
                          fields: List[Dict] = None, color: int = 0x0099ff) -> bool:
        """Send custom formatted message"""
        embed = {
            "title": title,
            "description": description,
            "color": color,
            "timestamp": datetime.now().isoformat(),
            "fields": fields or []
        }
        
        message = WebhookMessage(embeds=[embed])
        return self.send_webhook_sync(webhook_type, message)
        
class DiscordAPIManager:
    """Direct Discord API interactions"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.DISCORD_TOKEN = "MTM4NTg5ODI0NjM4NzQwNDgxMA.GrIfRN.ON5jRvP8d4MPB4V9l1T05sehdsImp0AHvhamm0"
        self.DISCORD_APP_ID = "1385898246387404810"
        self.base_url = "https://discord.com/api/v10"
        
        self.headers = {
            "Authorization": f"Bot {self.DISCORD_TOKEN}",
            "Content-Type": "application/json"
        }
        
    def get_guilds(self) -> List[Dict]:
        """Get list of guilds the bot is in"""
        try:
            response = requests.get(f"{self.base_url}/users/@me/guilds", headers=self.headers)
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get guilds: {response.status_code}")
                return []
        except Exception as e:
            self.logger.error(f"Error getting guilds: {e}")
            return []
            
    def get_guild_channels(self, guild_id: str) -> List[Dict]:
        """Get channels in a guild"""
        try:
            response = requests.get(f"{self.base_url}/guilds/{guild_id}/channels", headers=self.headers)
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get channels: {response.status_code}")
                return []
        except Exception as e:
            self.logger.error(f"Error getting channels: {e}")
            return []
            
    def send_message(self, channel_id: str, content: str = "", embed: Dict = None) -> bool:
        """Send message to a channel"""
        payload = {"content": content}
        if embed:
            payload["embeds"] = [embed]
            
        try:
            response = requests.post(
                f"{self.base_url}/channels/{channel_id}/messages", 
                headers=self.headers, 
                json=payload
            )
            if response.status_code == 200:
                self.logger.info(f"Message sent to channel {channel_id}")
                return True
            else:
                self.logger.error(f"Failed to send message: {response.status_code}")
                return False
        except Exception as e:
            self.logger.error(f"Error sending message: {e}")
            return False
            
    def create_webhook(self, channel_id: str, name: str) -> Optional[str]:
        """Create a webhook for a channel"""
        payload = {"name": name}
        
        try:
            response = requests.post(
                f"{self.base_url}/channels/{channel_id}/webhooks",
                headers=self.headers,
                json=payload
            )
            if response.status_code == 200:
                webhook_data = response.json()
                webhook_url = f"https://discord.com/api/webhooks/{webhook_data['id']}/{webhook_data['token']}"
                self.logger.info(f"Webhook created: {webhook_url}")
                return webhook_url
            else:
                self.logger.error(f"Failed to create webhook: {response.status_code}")
                return None
        except Exception as e:
            self.logger.error(f"Error creating webhook: {e}")
            return None
            
    def get_user_info(self, user_id: str) -> Optional[Dict]:
        """Get user information"""
        try:
            response = requests.get(f"{self.base_url}/users/{user_id}", headers=self.headers)
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get user info: {response.status_code}")
                return None
        except Exception as e:
            self.logger.error(f"Error getting user info: {e}")
            return None
            
    def send_dm(self, user_id: str, content: str = "", embed: Dict = None) -> bool:
        """Send direct message to a user"""
        # First create DM channel
        try:
            dm_payload = {"recipient_id": user_id}
            dm_response = requests.post(
                f"{self.base_url}/users/@me/channels",
                headers=self.headers,
                json=dm_payload
            )
            
            if dm_response.status_code != 200:
                self.logger.error(f"Failed to create DM channel: {dm_response.status_code}")
                return False
                
            dm_channel = dm_response.json()
            channel_id = dm_channel['id']
            
            # Send message to DM channel
            return self.send_message(channel_id, content, embed)
            
        except Exception as e:
            self.logger.error(f"Error sending DM: {e}")
            return False

class DiscordIntegrationManager:
    """Comprehensive Discord integration management"""
    
    def __init__(self):
        self.webhook_manager = DiscordWebhookManager()
        self.api_manager = DiscordAPIManager()
        self.logger = logging.getLogger(__name__)
        
    def setup_trading_channel_webhooks(self, guild_id: str):
        """Setup webhooks for trading channels"""
        channels = self.api_manager.get_guild_channels(guild_id)
        
        trading_channels = {
            'trading-signals': 'trading_signals',
            'market-updates': 'market_updates', 
            'price-alerts': 'alerts',
            'market-news': 'news'
        }
        
        for channel in channels:
            channel_name = channel.get('name', '')
            if channel_name in trading_channels:
                webhook_type = trading_channels[channel_name]
                webhook_url = self.api_manager.create_webhook(channel['id'], f"{webhook_type.title()} Bot")
                if webhook_url:
                    self.webhook_manager.webhooks[webhook_type] = webhook_url
                    self.logger.info(f"Webhook setup for {channel_name}: {webhook_url}")
                    
    def broadcast_trading_signal(self, signal_data: Dict):
        """Broadcast trading signal to all configured channels"""
        # Send via webhook if available
        if self.webhook_manager.send_trading_signal(signal_data):
            self.logger.info("Trading signal sent via webhook")
        
        # Also send via direct API for backup
        guilds = self.api_manager.get_guilds()
        for guild in guilds:
            channels = self.api_manager.get_guild_channels(guild['id'])
            for channel in channels:
                if channel.get('name') == 'trading-signals':
                    embed = self.webhook_manager.create_trading_signal_embed(signal_data)
                    self.api_manager.send_message(channel['id'], embed=embed)
                    
    def send_market_analysis(self, analysis_data: Dict):
        """Send comprehensive market analysis"""
        embed = {
            "title": "📊 Daily Market Analysis",
            "description": "Comprehensive market overview and analysis",
            "color": 0x0099ff,
            "timestamp": datetime.now().isoformat(),
            "fields": [
                {
                    "name": "📈 Market Sentiment",
                    "value": analysis_data.get('sentiment', 'Neutral'),
                    "inline": True
                },
                {
                    "name": "🎯 Key Levels",
                    "value": f"Support: {analysis_data.get('support', 'N/A')}\nResistance: {analysis_data.get('resistance', 'N/A')}",
                    "inline": True
                },
                {
                    "name": "📊 Volume Analysis",
                    "value": analysis_data.get('volume_analysis', 'Normal trading volume'),
                    "inline": False
                }
            ]
        }
        
        # Send to market analysis channels
        guilds = self.api_manager.get_guilds()
        for guild in guilds:
            channels = self.api_manager.get_guild_channels(guild['id'])
            for channel in channels:
                if 'analysis' in channel.get('name', '').lower():
                    self.api_manager.send_message(channel['id'], embed=embed)

if __name__ == "__main__":
    # Example usage
    integration = DiscordIntegrationManager()
    
    # Example signal data
    signal_data = {
        'symbol': 'AAPL',
        'final_signal': 'BUY',
        'final_confidence': 0.85,
        'current_price': 150.25,
        'price_change': 2.5,
        'rsi': 65,
        'macd': {'histogram': 0.5},
        'volume_ratio': 1.8
    }
    
    # Broadcast signal
    integration.broadcast_trading_signal(signal_data)