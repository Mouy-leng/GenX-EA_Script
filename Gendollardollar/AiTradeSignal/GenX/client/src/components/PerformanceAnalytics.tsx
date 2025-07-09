import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/portfolio', timeRange],
    refetchInterval: 30000,
  });

  const { data: trades } = useQuery({
    queryKey: ['/api/trades', { limit: 100 }],
  });

  const calculateMetrics = () => {
    if (!analytics || !trades) return null;

    const closedTrades = trades.filter((trade: any) => trade.status === 'closed');
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter((trade: any) => parseFloat(trade.pnl || "0") > 0);
    const losingTrades = closedTrades.filter((trade: any) => parseFloat(trade.pnl || "0") < 0);

    const totalPnL = closedTrades.reduce((sum: number, trade: any) => 
      sum + parseFloat(trade.pnl || "0"), 0);
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum: number, trade: any) => sum + parseFloat(trade.pnl || "0"), 0) / winningTrades.length : 0;
    
    const avgLoss = losingTrades.length > 0 ? 
      Math.abs(losingTrades.reduce((sum: number, trade: any) => sum + parseFloat(trade.pnl || "0"), 0) / losingTrades.length) : 0;
    
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let peak = 0;
    let runningPnL = 0;
    
    closedTrades.forEach((trade: any) => {
      runningPnL += parseFloat(trade.pnl || "0");
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = ((peak - runningPnL) / Math.max(peak, 1)) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Calculate Sharpe ratio (simplified)
    const avgReturn = totalTrades > 0 ? totalPnL / totalTrades : 0;
    const variance = totalTrades > 0 ? 
      closedTrades.reduce((sum: number, trade: any) => {
        const pnl = parseFloat(trade.pnl || "0");
        return sum + Math.pow(pnl - avgReturn, 2);
      }, 0) / totalTrades : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return {
      totalReturn: ((totalPnL / Math.max(analytics.totalBalance - totalPnL, 1)) * 100),
      sharpeRatio,
      maxDrawdown,
      winRate,
      riskRewardRatio,
      totalTrades,
      avgWin,
      avgLoss
    };
  };

  const metrics = calculateMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="col-span-6 bg-surface rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance Analytics</h3>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-6 bg-surface rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-textSecondary text-xs mb-1">Total Return</p>
          <p className={`text-2xl font-bold font-mono ${metrics.totalReturn >= 0 ? 'text-success' : 'text-error'}`}>
            {metrics.totalReturn >= 0 ? '+' : ''}{metrics.totalReturn.toFixed(1)}%
          </p>
          <p className="text-xs text-textSecondary mt-1">
            vs Market: +8.2%
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-textSecondary text-xs mb-1">Sharpe Ratio</p>
          <p className="text-2xl font-bold font-mono">
            {metrics.sharpeRatio.toFixed(2)}
          </p>
          <p className={`text-xs mt-1 ${
            metrics.sharpeRatio > 1 ? 'text-success' : 
            metrics.sharpeRatio > 0.5 ? 'text-warning' : 'text-error'
          }`}>
            {metrics.sharpeRatio > 1 ? 'Excellent' : 
             metrics.sharpeRatio > 0.5 ? 'Good' : 'Poor'} Risk-Adj Return
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-textSecondary">Max Drawdown</span>
          <span className="font-mono text-error">
            -{metrics.maxDrawdown.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textSecondary">Win Rate</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono">{metrics.winRate.toFixed(1)}%</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                metrics.winRate >= 60 ? 'text-success border-success' :
                metrics.winRate >= 45 ? 'text-warning border-warning' : 
                'text-error border-error'
              }`}
            >
              {metrics.totalTrades} trades
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textSecondary">Avg Win/Loss</span>
          <span className="font-mono">
            ${metrics.avgWin.toFixed(2)} / ${metrics.avgLoss.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-textSecondary">Risk-Reward Ratio</span>
          <span className="font-mono">
            1:{metrics.riskRewardRatio.toFixed(1)}
          </span>
        </div>
      </div>
      
      {/* Performance Chart Placeholder */}
      <div className="mt-6 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-chart-area text-2xl text-textSecondary mb-1"></i>
          <p className="text-xs text-textSecondary">Performance Chart</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <Badge variant="outline" className="text-xs">
              Return: {metrics.totalReturn.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              Trades: {metrics.totalTrades}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
