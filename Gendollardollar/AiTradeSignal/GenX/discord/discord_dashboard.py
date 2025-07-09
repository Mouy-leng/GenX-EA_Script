"""
Discord Bot Dashboard and API Server
Web interface for managing Discord bot and viewing analytics
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import threading
import sqlite3
import os
from discord_webhooks import DiscordIntegrationManager

app = Flask(__name__)
app.secret_key = 'trading_bot_secret_key'

class DiscordBotDashboard:
    """Web dashboard for Discord bot management"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.integration_manager = DiscordIntegrationManager()
        
        # Initialize database
        self.init_database()
        
        # Setup Flask routes
        self.setup_routes()
        
    def init_database(self):
        """Initialize SQLite database for storing bot data"""
        conn = sqlite3.connect('discord_bot.db')
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS trading_signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                signal TEXT NOT NULL,
                confidence REAL NOT NULL,
                price REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                discord_sent BOOLEAN DEFAULT FALSE
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_user_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                avg_price REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_user_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                target_price REAL NOT NULL,
                current_price REAL,
                triggered BOOLEAN DEFAULT FALSE,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bot_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def setup_routes(self):
        """Setup Flask routes for the dashboard"""
        
        @app.route('/')
        def dashboard():
            """Main dashboard page"""
            return render_template('dashboard.html')
            
        @app.route('/api/signals')
        def get_signals():
            """Get recent trading signals"""
            conn = sqlite3.connect('discord_bot.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT symbol, signal, confidence, price, timestamp 
                FROM trading_signals 
                ORDER BY timestamp DESC 
                LIMIT 50
            ''')
            
            signals = []
            for row in cursor.fetchall():
                signals.append({
                    'symbol': row[0],
                    'signal': row[1], 
                    'confidence': row[2],
                    'price': row[3],
                    'timestamp': row[4]
                })
                
            conn.close()
            return jsonify(signals)
            
        @app.route('/api/analytics')
        def get_analytics():
            """Get bot analytics and statistics"""
            conn = sqlite3.connect('discord_bot.db')
            cursor = conn.cursor()
            
            # Get signal statistics
            cursor.execute('''
                SELECT signal, COUNT(*) as count
                FROM trading_signals 
                WHERE timestamp > datetime('now', '-7 days')
                GROUP BY signal
            ''')
            signal_stats = dict(cursor.fetchall())
            
            # Get total signals today
            cursor.execute('''
                SELECT COUNT(*) 
                FROM trading_signals 
                WHERE date(timestamp) = date('now')
            ''')
            signals_today = cursor.fetchone()[0]
            
            # Get active alerts
            cursor.execute('''
                SELECT COUNT(*) 
                FROM price_alerts 
                WHERE triggered = FALSE
            ''')
            active_alerts = cursor.fetchone()[0]
            
            # Get unique users
            cursor.execute('''
                SELECT COUNT(DISTINCT discord_user_id) 
                FROM user_portfolios
            ''')
            total_users = cursor.fetchone()[0]
            
            conn.close()
            
            return jsonify({
                'signal_stats': signal_stats,
                'signals_today': signals_today,
                'active_alerts': active_alerts,
                'total_users': total_users
            })
            
        @app.route('/api/send_signal', methods=['POST'])
        def send_manual_signal():
            """Send manual trading signal"""
            data = request.json
            
            signal_data = {
                'symbol': data.get('symbol'),
                'final_signal': data.get('signal'),
                'final_confidence': data.get('confidence', 0.5),
                'current_price': data.get('price', 0),
                'price_change': data.get('change', 0),
                'rsi': data.get('rsi', 50),
                'volume_ratio': data.get('volume_ratio', 1.0)
            }
            
            # Store in database
            conn = sqlite3.connect('discord_bot.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO trading_signals (symbol, signal, confidence, price, discord_sent)
                VALUES (?, ?, ?, ?, TRUE)
            ''', (signal_data['symbol'], signal_data['final_signal'], 
                  signal_data['final_confidence'], signal_data['current_price']))
            conn.commit()
            conn.close()
            
            # Send to Discord
            success = self.integration_manager.broadcast_trading_signal(signal_data)
            
            return jsonify({'success': success})
            
        @app.route('/api/users')
        def get_users():
            """Get Discord user statistics"""
            conn = sqlite3.connect('discord_bot.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT discord_user_id, COUNT(*) as portfolio_items
                FROM user_portfolios 
                GROUP BY discord_user_id
                ORDER BY portfolio_items DESC
                LIMIT 20
            ''')
            
            users = []
            for row in cursor.fetchall():
                users.append({
                    'user_id': row[0],
                    'portfolio_items': row[1]
                })
                
            conn.close()
            return jsonify(users)
            
        @app.route('/api/alerts')
        def get_alerts():
            """Get active price alerts"""
            conn = sqlite3.connect('discord_bot.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT discord_user_id, symbol, target_price, triggered, timestamp
                FROM price_alerts 
                ORDER BY timestamp DESC
                LIMIT 100
            ''')
            
            alerts = []
            for row in cursor.fetchall():
                alerts.append({
                    'user_id': row[0],
                    'symbol': row[1],
                    'target_price': row[2],
                    'triggered': bool(row[3]),
                    'timestamp': row[4]
                })
                
            conn.close()
            return jsonify(alerts)
            
        @app.route('/api/market_update', methods=['POST'])
        def send_market_update():
            """Send market update to Discord"""
            data = request.json
            
            success = self.integration_manager.webhook_manager.send_market_update(data)
            
            return jsonify({'success': success})
            
        @app.route('/api/guilds')
        def get_discord_guilds():
            """Get Discord guilds the bot is in"""
            guilds = self.integration_manager.api_manager.get_guilds()
            return jsonify(guilds)
            
        @app.route('/api/channels/<guild_id>')
        def get_guild_channels(guild_id):
            """Get channels in a Discord guild"""
            channels = self.integration_manager.api_manager.get_guild_channels(guild_id)
            return jsonify(channels)
            
        @app.route('/api/webhook_setup/<guild_id>', methods=['POST'])
        def setup_webhooks(guild_id):
            """Setup webhooks for a guild"""
            self.integration_manager.setup_trading_channel_webhooks(guild_id)
            return jsonify({'success': True})
            
    def log_signal(self, signal_data: Dict):
        """Log trading signal to database"""
        conn = sqlite3.connect('discord_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO trading_signals (symbol, signal, confidence, price)
            VALUES (?, ?, ?, ?)
        ''', (signal_data.get('symbol'), signal_data.get('final_signal'),
              signal_data.get('final_confidence'), signal_data.get('current_price')))
        
        conn.commit()
        conn.close()
        
    def log_user_portfolio(self, user_id: str, symbol: str, quantity: int, price: float):
        """Log user portfolio change"""
        conn = sqlite3.connect('discord_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO user_portfolios (discord_user_id, symbol, quantity, avg_price)
            VALUES (?, ?, ?, ?)
        ''', (user_id, symbol, quantity, price))
        
        conn.commit()
        conn.close()
        
    def log_price_alert(self, user_id: str, symbol: str, target_price: float):
        """Log price alert"""
        conn = sqlite3.connect('discord_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO price_alerts (discord_user_id, symbol, target_price)
            VALUES (?, ?, ?)
        ''', (user_id, symbol, target_price))
        
        conn.commit()
        conn.close()
        
    def run_dashboard(self, host='0.0.0.0', port=5000):
        """Run the dashboard web server"""
        # Create templates directory and basic template
        self.create_templates()
        
        # Start Flask app
        app.run(host=host, port=port, debug=False)
        
    def create_templates(self):
        """Create basic HTML templates"""
        if not os.path.exists('templates'):
            os.makedirs('templates')
            
        dashboard_html = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discord Trading Bot Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .signals-table {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
        }
        .signal-buy { color: #28a745; font-weight: bold; }
        .signal-sell { color: #dc3545; font-weight: bold; }
        .signal-hold { color: #ffc107; font-weight: bold; }
        .manual-signal {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Discord Trading Bot Dashboard</h1>
            <p>Monitor and manage your Discord trading bot</p>
        </div>
        
        <div class="stats" id="stats">
            <!-- Stats will be loaded here -->
        </div>
        
        <div class="manual-signal">
            <h3>📤 Send Manual Signal</h3>
            <form id="signal-form">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div class="form-group">
                        <label for="symbol">Symbol:</label>
                        <input type="text" id="symbol" placeholder="AAPL" required>
                    </div>
                    <div class="form-group">
                        <label for="signal">Signal:</label>
                        <select id="signal" required>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                            <option value="HOLD">HOLD</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="confidence">Confidence:</label>
                        <input type="number" id="confidence" step="0.01" min="0" max="1" placeholder="0.85" required>
                    </div>
                    <div class="form-group">
                        <label for="price">Price:</label>
                        <input type="number" id="price" step="0.01" placeholder="150.25" required>
                    </div>
                </div>
                <button type="submit">Send Signal to Discord</button>
            </form>
        </div>
        
        <div class="signals-table">
            <h3>📊 Recent Trading Signals</h3>
            <table id="signals-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Signal</th>
                        <th>Confidence</th>
                        <th>Price</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Signals will be loaded here -->
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Load analytics
        fetch('/api/analytics')
            .then(response => response.json())
            .then(data => {
                document.getElementById('stats').innerHTML = `
                    <div class="stat-card">
                        <div class="stat-value">${data.signals_today}</div>
                        <div>Signals Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.active_alerts}</div>
                        <div>Active Alerts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.total_users}</div>
                        <div>Total Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Object.keys(data.signal_stats).length}</div>
                        <div>Signal Types</div>
                    </div>
                `;
            });

        // Load recent signals
        fetch('/api/signals')
            .then(response => response.json())
            .then(signals => {
                const tbody = document.querySelector('#signals-table tbody');
                tbody.innerHTML = signals.map(signal => `
                    <tr>
                        <td>${signal.symbol}</td>
                        <td class="signal-${signal.signal.toLowerCase()}">${signal.signal}</td>
                        <td>${(signal.confidence * 100).toFixed(1)}%</td>
                        <td>$${signal.price.toFixed(2)}</td>
                        <td>${new Date(signal.timestamp).toLocaleString()}</td>
                    </tr>
                `).join('');
            });

        // Handle manual signal form
        document.getElementById('signal-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                symbol: document.getElementById('symbol').value.toUpperCase(),
                signal: document.getElementById('signal').value,
                confidence: parseFloat(document.getElementById('confidence').value),
                price: parseFloat(document.getElementById('price').value)
            };
            
            fetch('/api/send_signal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Signal sent successfully!');
                    location.reload();
                } else {
                    alert('Failed to send signal');
                }
            });
        });

        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
        '''
        
        with open('templates/dashboard.html', 'w') as f:
            f.write(dashboard_html)

# Integration with existing trading bot
def integrate_with_trading_bot():
    """Integrate dashboard with existing trading bot"""
    dashboard = DiscordBotDashboard()
    
    # Run dashboard in separate thread
    dashboard_thread = threading.Thread(
        target=dashboard.run_dashboard, 
        args=('0.0.0.0', 5000),
        daemon=True
    )
    dashboard_thread.start()
    
    return dashboard

if __name__ == "__main__":
    dashboard = DiscordBotDashboard()
    dashboard.run_dashboard()