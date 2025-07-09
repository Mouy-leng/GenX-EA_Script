import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '../components/Header';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain,
  RefreshCw,
  BarChart3,
  Target,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

export default function PatternRecognition() {
  const [patternAnalysis, setPatternAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 5000,
  });

  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/patterns', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      setPatternAnalysis(data);
      toast({
        title: 'Success',
        description: `Detected ${data.patterns?.length || 0} patterns`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to analyze patterns',
        variant: 'destructive',
      });
    },
  });

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'HIGH':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPatternIcon = (pattern: string) => {
    if (pattern.toLowerCase().includes('bullish') || pattern.toLowerCase().includes('support')) {
      return <TrendingUp size={16} className="text-green-500" />;
    } else if (pattern.toLowerCase().includes('bearish') || pattern.toLowerCase().includes('resistance')) {
      return <TrendingDown size={16} className="text-red-500" />;
    } else {
      return <Activity size={16} className="text-blue-500" />;
    }
  };

  const patternSignals = signals?.filter((s: any) => 
    s.technicalIndicators && Object.keys(s.technicalIndicators).length > 0
  ) || [];

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Pattern Recognition"
        subtitle="Advanced technical analysis and pattern detection"
      />
      
      <main className="p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Patterns Detected</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {patternAnalysis?.patterns?.length || 0}
                  </p>
                </div>
                <BarChart3 size={24} className="text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Latest analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Risk Level</p>
                  <p className={cn("text-2xl font-bold", getRiskLevelColor(patternAnalysis?.riskLevel))}>
                    {patternAnalysis?.riskLevel || 'Unknown'}
                  </p>
                </div>
                <AlertTriangle size={24} className={getRiskLevelColor(patternAnalysis?.riskLevel)} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Current market</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Recommendations</p>
                  <p className="text-2xl font-bold text-green-500">
                    {patternAnalysis?.recommendations?.length || 0}
                  </p>
                </div>
                <Target size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Active suggestions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pattern Signals</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {patternSignals.length}
                  </p>
                </div>
                <Brain size={24} className="text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">AI-generated</p>
            </CardContent>
          </Card>
        </div>

        {/* Pattern Analysis Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2" size={20} />
              Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => analyzePatternsMutation.mutate()}
                  disabled={analyzePatternsMutation.isPending}
                >
                  <RefreshCw size={16} className="mr-2" />
                  {analyzePatternsMutation.isPending ? 'Analyzing...' : 'Analyze Current Patterns'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Last analysis: {patternAnalysis ? 'Just now' : 'Never'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Pattern Types</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Candlestick patterns</p>
                    <p>• Support/Resistance levels</p>
                    <p>• Trend lines</p>
                    <p>• Chart formations</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Technical Indicators</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• RSI (14 period)</p>
                    <p>• MACD (12,26,9)</p>
                    <p>• Moving Averages</p>
                    <p>• Volume analysis</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Time Frames</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• 1 hour charts</p>
                    <p>• 4 hour charts</p>
                    <p>• Daily charts</p>
                    <p>• Weekly trends</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detected Patterns */}
        {patternAnalysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Detected Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternAnalysis.patterns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No significant patterns detected in current market data
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patternAnalysis.patterns.map((pattern: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        {getPatternIcon(pattern)}
                        <span className="text-sm font-medium">{pattern}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {patternAnalysis && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2" size={20} />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternAnalysis.recommendations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No specific recommendations at this time
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patternAnalysis.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                        <Target size={16} className="text-green-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pattern-Based Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" size={20} />
              Pattern-Based Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground text-sm">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Signal</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3">Pattern Indicators</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {patternSignals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No pattern-based signals available
                      </td>
                    </tr>
                  ) : (
                    patternSignals.map((signal: any) => (
                      <tr key={signal.id} className="border-b border-border">
                        <td className="py-3 font-medium">{signal.symbol}</td>
                        <td className="py-3">
                          <Badge className={cn(
                            signal.signal === 'BUY' ? 'signal-buy' :
                            signal.signal === 'SELL' ? 'signal-sell' :
                            'signal-hold'
                          )}>
                            {signal.signal}
                          </Badge>
                        </td>
                        <td className="py-3">{(signal.confidence * 100).toFixed(1)}%</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {signal.technicalIndicators.price && (
                              <Badge variant="outline" className="text-xs">
                                Price: ${signal.technicalIndicators.price.toFixed(2)}
                              </Badge>
                            )}
                            {signal.technicalIndicators.volume && (
                              <Badge variant="outline" className="text-xs">
                                Vol: {(signal.technicalIndicators.volume / 1000).toFixed(0)}K
                              </Badge>
                            )}
                            {signal.technicalIndicators.change24h && (
                              <Badge variant="outline" className="text-xs">
                                24h: {signal.technicalIndicators.change24h.toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className={cn(
                            signal.status === 'executed' ? 'bg-green-500/20 text-green-500' :
                            signal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          )}>
                            {signal.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(signal.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
