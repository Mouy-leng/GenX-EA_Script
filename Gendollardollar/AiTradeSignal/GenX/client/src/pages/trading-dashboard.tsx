import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  AlertCircle,
  BarChart3,
  Bot,
  Wallet
} from "lucide-react";

interface DashboardStats {
  totalSignals: number;
  successfulTrades: number;
  totalProfit: number;
  winRate: number;
  activePositions: number;
  totalBalance: number;
  todaysPnL: number;
  alertsCount: number;
}

interface TradingSignal {
  id: string;
  symbol: string;
  action: "BUY" | "SELL" | "HOLD";
  price: number;
  confidence: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  timestamp: Date;
  source: "AI" | "TECHNICAL" | "FUNDAMENTAL" | "NEWS";
  reasoning: string;
  platform: "BYBIT" | "CAPITAL_COM" | "MT4" | "MT5";
  status: "PENDING" | "EXECUTED" | "CANCELLED" | "EXPIRED";
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

interface Position {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: Date;
  platform: "BYBIT" | "CAPITAL_COM" | "MT4" | "MT5";
  status: "OPEN" | "CLOSED" | "PARTIAL";
}

function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch trading signals
  const { data: signals, isLoading: signalsLoading } = useQuery<TradingSignal[]>({
    queryKey: ["/api/signals"],
    queryFn: async () => {
      const response = await fetch("/api/signals");
      if (!response.ok) throw new Error("Failed to fetch signals");
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch market data
  const { data: marketData, isLoading: marketLoading } = useQuery<MarketData>({
    queryKey: ["/api/market", selectedSymbol],
    queryFn: async () => {
      const response = await fetch(`/api/market/${selectedSymbol}`);
      if (!response.ok) throw new Error("Failed to fetch market data");
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch positions
  const { data: positions, isLoading: positionsLoading } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
    queryFn: async () => {
      const response = await fetch("/api/positions");
      if (!response.ok) throw new Error("Failed to fetch positions");
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Generate new signal
  const generateSignal = async () => {
    try {
      const response = await fetch("/api/signals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: selectedSymbol }),
      });
      
      if (!response.ok) throw new Error("Failed to generate signal");
      
      // Refetch signals after generating new one
      window.location.reload();
    } catch (error) {
      console.error("Error generating signal:", error);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "SELL": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "HOLD": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "EXECUTED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "EXPIRED": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            GenZ Trading Bot Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered trading with multi-platform support
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statsLoading ? "..." : stats?.totalBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? "..." : `${stats?.activePositions} active positions`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(stats?.todaysPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${statsLoading ? "..." : stats?.todaysPnL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? "..." : `${stats?.winRate.toFixed(1)}% win rate`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalSignals}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? "..." : `${stats?.successfulTrades} successful`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${statsLoading ? "..." : stats?.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time performance
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="signals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="mt4">MT4/MT5</TabsTrigger>
          </TabsList>

          <TabsContent value="signals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Trading Signals</CardTitle>
                  <Button onClick={generateSignal} size="sm">
                    <Bot className="h-4 w-4 mr-2" />
                    Generate Signal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {signalsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signals?.map((signal) => (
                      <div key={signal.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{signal.symbol}</span>
                            <Badge className={getActionColor(signal.action)}>
                              {signal.action}
                            </Badge>
                            <Badge className={getStatusColor(signal.status)}>
                              {signal.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {signal.confidence * 100}% confidence
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Price:</span> ${signal.price}
                          </div>
                          <div>
                            <span className="text-gray-500">Stop Loss:</span> ${signal.stopLoss || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Take Profit:</span> ${signal.takeProfit || 'N/A'}
                          </div>
                          <div>
                            <span className="text-gray-500">Lot Size:</span> {signal.lotSize}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Reasoning:</span> {signal.reasoning}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {positionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions?.map((position) => (
                      <div key={position.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{position.symbol}</span>
                            <Badge className={getActionColor(position.type)}>
                              {position.type}
                            </Badge>
                            <Badge variant="outline">{position.platform}</Badge>
                          </div>
                          <div className={`text-sm font-medium ${position.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${position.profit.toFixed(2)} ({position.profitPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Volume:</span> {position.volume}
                          </div>
                          <div>
                            <span className="text-gray-500">Open Price:</span> ${position.openPrice}
                          </div>
                          <div>
                            <span className="text-gray-500">Current Price:</span> ${position.currentPrice}
                          </div>
                          <div>
                            <span className="text-gray-500">Opened:</span> {new Date(position.openTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle>Market Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <select 
                    value={selectedSymbol} 
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="BTCUSDT">BTC/USDT</option>
                    <option value="ETHUSDT">ETH/USDT</option>
                    <option value="XAUUSD">XAU/USD</option>
                    <option value="EURUSD">EUR/USD</option>
                  </select>
                </div>
                
                {marketLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ) : marketData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold">${marketData.price}</div>
                      <div className={`text-lg ${marketData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">24h High:</span> ${marketData.high}
                      </div>
                      <div>
                        <span className="text-gray-500">24h Low:</span> ${marketData.low}
                      </div>
                      <div>
                        <span className="text-gray-500">24h Volume:</span> {marketData.volume.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">24h Change:</span> ${marketData.change.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Market data not available for {selectedSymbol}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mt4">
            <Card>
              <CardHeader>
                <CardTitle>MT4/MT5 Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      MT4/MT5 EA endpoint is available at: <code>/api/mt4-signal</code>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Integration Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      <li>Add the EA script to your MT4/MT5 terminal</li>
                      <li>Configure the API endpoint URL</li>
                      <li>Set the API key from your environment variables</li>
                      <li>Enable WebRequest for the domain</li>
                    </ol>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Sample Signal Format:</h5>
                    <pre className="text-sm">
{`{
  "symbol": "XAUUSD",
  "action": "BUY",
  "lotSize": 0.1,
  "stopLoss": 100,
  "takeProfit": 200,
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TradingDashboard;