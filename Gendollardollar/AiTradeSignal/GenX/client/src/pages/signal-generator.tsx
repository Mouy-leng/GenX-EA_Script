import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";

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

const TRADING_SYMBOLS = [
  { value: "BTCUSDT", label: "Bitcoin (BTC/USDT)" },
  { value: "ETHUSDT", label: "Ethereum (ETH/USDT)" },
  { value: "XAUUSD", label: "Gold (XAU/USD)" },
  { value: "EURUSD", label: "Euro (EUR/USD)" },
  { value: "GBPUSD", label: "British Pound (GBP/USD)" },
  { value: "USDJPY", label: "US Dollar/Japanese Yen (USD/JPY)" },
  { value: "AAPL", label: "Apple Inc. (AAPL)" },
  { value: "TSLA", label: "Tesla Inc. (TSLA)" },
  { value: "GOOGL", label: "Google (GOOGL)" },
  { value: "MSFT", label: "Microsoft (MSFT)" },
];

function SignalGenerator() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSignal = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/signals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: selectedSymbol }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate signal");
      }
      
      const newSignal = await response.json();
      setSignal(newSignal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case "BUY": return <TrendingUp className="h-4 w-4" />;
      case "SELL": return <TrendingDown className="h-4 w-4" />;
      case "HOLD": return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: "High", color: "text-green-600" };
    if (confidence >= 0.6) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Low", color: "text-red-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Trading Signal Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate AI-powered trading signals for any symbol
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Generate Trading Signal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Trading Symbol
                </label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADING_SYMBOLS.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value}>
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateSignal} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Generating Signal...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Generate AI Signal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {signal && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Trading Signal</span>
                <div className="flex items-center gap-2">
                  <Badge className={getActionColor(signal.action)}>
                    {getActionIcon(signal.action)}
                    <span className="ml-1">{signal.action}</span>
                  </Badge>
                  <Badge variant="outline">{signal.platform}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{signal.symbol}</span>
                    <span className="text-2xl font-bold">${signal.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Stop Loss</div>
                      <div className="font-medium">${signal.stopLoss?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Take Profit</div>
                      <div className="font-medium">${signal.takeProfit?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Lot Size</div>
                      <div className="font-medium">{signal.lotSize}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Source</div>
                      <div className="font-medium">{signal.source}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Confidence Level
                      </span>
                      <span className={`text-lg font-bold ${getConfidenceLevel(signal.confidence).color}`}>
                        {getConfidenceLevel(signal.confidence).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${signal.confidence * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(signal.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      AI Reasoning
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {signal.reasoning}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Generated: {new Date(signal.timestamp).toLocaleString()}</span>
                  <span>Signal ID: {signal.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>MT4/MT5 Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use this API endpoint for MT4/MT5 EA integration: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/api/mt4-signal</code>
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Sample EA Code (MQL4):</h4>
                <pre className="text-xs overflow-x-auto">
{`string apiUrl = "https://your-app.replit.app/api/mt4-signal";
string apiKey = "${process.env.GENZ_API_SECRET || 'your-api-key'}";
string headers = "x-api-key:" + apiKey + "\\r\\n";

char result[];
int timeout = 5000;
int res = WebRequest("GET", apiUrl, headers, timeout, NULL, 0, result, NULL);

if(res == -1) {
   Print("WebRequest failed: ", GetLastError());
} else {
   string json = CharArrayToString(result);
   Print("Signal received: ", json);
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SignalGenerator;