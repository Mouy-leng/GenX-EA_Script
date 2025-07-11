import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Bot,
  NewspaperIcon,
  Bell,
  Settings,
  BarChart3,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/hooks/useWebSocket";

interface PortfolioData {
  totalBalance: number;
  totalEquity: number;
  totalPnL: number;
  totalPnLPercent: number;
  openPositions: number;
  dayChange: number;
  dayChangePercent: number;
}

interface Position {
  id: number;
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  pnlPercent: string;
}

interface TradingBot {
  id: number;
  name: string;
  strategy: string;
  symbol: string;
  status: string;
  dailyPnl: string;
  totalPnl: string;
  winRate: string;
}

interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface EconomicNews {
  id: number;
  headline: string;
  impact: string;
  publishedAt: string;
  sentiment: string;
}

function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  
  // WebSocket connection for real-time updates
  useWebSocket();

  // Portfolio data
  const { data: portfolio } = useQuery<PortfolioData>({
    queryKey: ["/api/analytics/portfolio"],
    refetchInterval: 5000,
  });

  // Active positions
  const { data: positions = [] } = useQuery<Position[]>({
    queryKey: ["/api/positions/active"],
    refetchInterval: 3000,
  });

  // Trading bots
  const { data: bots = [] } = useQuery<TradingBot[]>({
    queryKey: ["/api/bots"],
    refetchInterval: 5000,
  });

  // Market data
  const { data: marketPrices = [] } = useQuery<MarketPrice[]>({
    queryKey: ["/api/market"],
    refetchInterval: 2000,
  });

  // Economic news
  const { data: news = [] } = useQuery<EconomicNews[]>({
    queryKey: ["/api/news"],
    refetchInterval: 30000,
  });

  // Watchlist
  const { data: watchlist = [] } = useQuery({
    queryKey: ["/api/market/watchlist"],
    refetchInterval: 5000,
  });

  // Trading accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
    refetchInterval: 10000,
  });

  // Recent trades
  const { data: trades = [] } = useQuery({
    queryKey: ["/api/trades"],
    refetchInterval: 5000,
  });

  // Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 10000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'LONG' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold">GenZ Trading Bot</h1>
          <p className="text-sm text-muted-foreground">Pro Dashboard</p>
        </div>
        <nav className="px-4 sidebar-nav">
          <button
            onClick={() => setActiveSection("overview")}
            className={`sidebar-nav-item w-full ${activeSection === "overview" ? "active" : ""}`}
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveSection("positions")}
            className={`sidebar-nav-item w-full ${activeSection === "positions" ? "active" : ""}`}
          >
            <TrendingUp className="h-4 w-4" />
            Positions
          </button>
          <button
            onClick={() => setActiveSection("bots")}
            className={`sidebar-nav-item w-full ${activeSection === "bots" ? "active" : ""}`}
          >
            <Bot className="h-4 w-4" />
            Trading Bots
          </button>
          <button
            onClick={() => setActiveSection("market")}
            className={`sidebar-nav-item w-full ${activeSection === "market" ? "active" : ""}`}
          >
            <Activity className="h-4 w-4" />
            Market Watch
          </button>
          <button
            onClick={() => setActiveSection("news")}
            className={`sidebar-nav-item w-full ${activeSection === "news" ? "active" : ""}`}
          >
            <NewspaperIcon className="h-4 w-4" />
            Economic News
          </button>
          <button
            onClick={() => setActiveSection("analytics")}
            className={`sidebar-nav-item w-full ${activeSection === "analytics" ? "active" : ""}`}
          >
            <PieChart className="h-4 w-4" />
            Analytics
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold capitalize">{activeSection}</h2>
              <p className="text-muted-foreground">
                Real-time trading dashboard with AI-powered insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications ({notifications.length})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Portfolio Overview */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Portfolio Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {portfolio ? formatCurrency(portfolio.totalBalance) : formatCurrency(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Equity: {portfolio ? formatCurrency(portfolio.totalEquity) : formatCurrency(0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${portfolio && portfolio.totalPnL >= 0 ? 'profit' : 'loss'}`}>
                      {portfolio ? formatCurrency(portfolio.totalPnL) : formatCurrency(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {portfolio ? formatPercent(portfolio.totalPnLPercent) : formatPercent(0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {portfolio ? portfolio.openPositions : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active trades
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {bots.filter(bot => bot.status === 'running').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Running strategies
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {positions.map((position) => (
                          <div key={position.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{position.symbol}</div>
                              <div className={`text-sm ${getSideColor(position.side)}`}>
                                {position.side} {position.size}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${parseFloat(position.pnl) >= 0 ? 'profit' : 'loss'}`}>
                                {formatCurrency(parseFloat(position.pnl))}
                              </div>
                              <div className={`text-sm ${parseFloat(position.pnlPercent) >= 0 ? 'profit' : 'loss'}`}>
                                {formatPercent(parseFloat(position.pnlPercent))}
                              </div>
                            </div>
                          </div>
                        ))}
                        {positions.length === 0 && (
                          <p className="text-muted-foreground text-center py-4">
                            No active positions
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Watch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {marketPrices.map((price) => (
                          <div key={price.symbol} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{price.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{price.price.toFixed(5)}</div>
                              <div className={`text-sm ${price.changePercent >= 0 ? 'profit' : 'loss'}`}>
                                {formatPercent(price.changePercent)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Positions Section */}
          {activeSection === "positions" && (
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.id} className="trading-card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{position.symbol}</h3>
                          <Badge variant="outline" className={getSideColor(position.side)}>
                            {position.side}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${parseFloat(position.pnl) >= 0 ? 'profit' : 'loss'}`}>
                            {formatCurrency(parseFloat(position.pnl))}
                          </div>
                          <div className={`text-sm ${parseFloat(position.pnlPercent) >= 0 ? 'profit' : 'loss'}`}>
                            {formatPercent(parseFloat(position.pnlPercent))}
                          </div>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Size:</span> {position.size}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entry:</span> {parseFloat(position.entryPrice).toFixed(5)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current:</span> {position.currentPrice ? parseFloat(position.currentPrice).toFixed(5) : 'N/A'}
                        </div>
                        <div className="text-right">
                          <Button variant="destructive" size="sm">
                            Close Position
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {positions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No active positions. Start trading to see your positions here.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trading Bots Section */}
          {activeSection === "bots" && (
            <div className="space-y-4">
              {bots.map((bot) => (
                <Card key={bot.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{bot.name}</CardTitle>
                        <p className="text-muted-foreground">{bot.strategy} • {bot.symbol}</p>
                      </div>
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Daily P&L</div>
                        <div className={`font-medium ${parseFloat(bot.dailyPnl) >= 0 ? 'profit' : 'loss'}`}>
                          {formatCurrency(parseFloat(bot.dailyPnl))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total P&L</div>
                        <div className={`font-medium ${parseFloat(bot.totalPnl) >= 0 ? 'profit' : 'loss'}`}>
                          {formatCurrency(parseFloat(bot.totalPnl))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="font-medium">{parseFloat(bot.winRate).toFixed(1)}%</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={bot.status === 'running' ? 'destructive' : 'default'} 
                          size="sm"
                        >
                          {bot.status === 'running' ? 'Stop' : 'Start'}
                        </Button>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {bots.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No trading bots configured. Create your first bot to automate your trading.
                    </p>
                    <Button>Create Trading Bot</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Market Watch Section */}
          {activeSection === "market" && (
            <Card>
              <CardHeader>
                <CardTitle>Live Market Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketPrices.map((price) => (
                    <div key={price.symbol} className="trading-card">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{price.symbol}</h3>
                          <div className="text-2xl font-bold">{price.price.toFixed(5)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${price.change >= 0 ? 'profit' : 'loss'}`}>
                            {price.change >= 0 ? '+' : ''}{price.change.toFixed(5)}
                          </div>
                          <div className={`text-sm ${price.changePercent >= 0 ? 'profit' : 'loss'}`}>
                            {formatPercent(price.changePercent)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Economic News Section */}
          {activeSection === "news" && (
            <Card>
              <CardHeader>
                <CardTitle>Economic News</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="trading-card">
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getImpactColor(item.impact)}`} />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.headline}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{item.impact}</Badge>
                            {item.sentiment && (
                              <Badge variant="outline">
                                Sentiment: {parseFloat(item.sentiment) > 0 ? 'Positive' : 'Negative'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {new Date(item.publishedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {news.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No recent economic news available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Section */}
          {activeSection === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Trades</span>
                      <span className="font-medium">{trades.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span className="font-medium">65.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Trade Duration</span>
                      <span className="font-medium">2h 45m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Drawdown</span>
                      <span className="font-medium text-red-500">-8.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio</span>
                      <span className="font-medium">1.34</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accounts.map((account, index) => (
                      <div key={account.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{account.platform}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.accountId}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(parseFloat(account.balance))}
                          </div>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {accounts.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No trading accounts configured
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;