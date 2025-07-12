import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '../components/Header';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Activity,
  RefreshCw,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useState } from 'react';

export default function AIServices() {
  const { toast } = useToast();

  const { data: botStatuses } = useQuery({
    queryKey: ['/api/bot-status'],
    refetchInterval: 10000,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/signals'],
    refetchInterval: 5000,
  });

  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000,
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/analyze', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Generated ${data.length} new signals`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/signals'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to run AI analysis',
        variant: 'destructive',
      });
    },
  });

  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/patterns', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Found ${data.patterns?.length || 0} patterns`,
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

  const aiBot = botStatuses?.find((bot: any) => bot.botName === 'ai');
  const aiSignals = signals?.filter((s: any) => s.aiReasoning) || [];
  const recentSignals = signals?.slice(0, 5) || [];

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="AI Services"
        subtitle="Artificial intelligence-powered signal generation and analysis"
      />
      
      <main className="p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">OpenAI Status</p>
                  <p className={cn("text-2xl font-bold", hasOpenAI ? "text-green-500" : "text-red-500")}>
                    {hasOpenAI ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Brain size={24} className={hasOpenAI ? "text-green-500" : "text-red-500"} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {hasOpenAI ? 'GPT-4o connected' : 'No API key'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Gemini Status</p>
                  <p className={cn("text-2xl font-bold", hasGemini ? "text-green-500" : "text-red-500")}>
                    {hasGemini ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <Zap size={24} className={hasGemini ? "text-green-500" : "text-red-500"} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {hasGemini ? 'Gemini 2.5 connected' : 'No API key'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">AI Signals</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {aiSignals.length}
                  </p>
                </div>
                <TrendingUp size={24} className="text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total AI-generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-500">
                    {aiSignals.length > 0 
                      ? `${Math.round((aiSignals.filter((s: any) => s.status === 'executed').length / aiSignals.length) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Profitable signals</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2" size={20} />
              AI Analysis Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => runAnalysisMutation.mutate()}
                  disabled={runAnalysisMutation.isPending || (!hasOpenAI && !hasGemini)}
                >
                  <RefreshCw size={16} className="mr-2" />
                  {runAnalysisMutation.isPending ? 'Analyzing...' : 'Run Market Analysis'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => analyzePatternsMutation.mutate()}
                  disabled={analyzePatternsMutation.isPending || (!hasOpenAI && !hasGemini)}
                >
                  <TrendingUp size={16} className="mr-2" />
                  {analyzePatternsMutation.isPending ? 'Analyzing...' : 'Analyze Patterns'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Analysis Parameters</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Confidence threshold: 60%</p>
                    <p>• Market data window: 24 hours</p>
                    <p>• Technical indicators: RSI, MACD, MA</p>
                    <p>• Pattern recognition: Candlestick patterns</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">AI Models</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Primary: OpenAI GPT-4o</p>
                    <p>• Fallback: Google Gemini 2.5</p>
                    <p>• Temperature: 0.3 (conservative)</p>
                    <p>• Response format: Structured JSON</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent AI Signals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" size={20} />
              Recent AI Signals
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
                    <th className="pb-3">Entry Price</th>
                    <th className="pb-3">Target</th>
                    <th className="pb-3">Stop Loss</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No AI signals generated yet
                      </td>
                    </tr>
                  ) : (
                    recentSignals.map((signal: any) => (
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
                        <td className="py-3">${signal.entryPrice.toFixed(4)}</td>
                        <td className="py-3">
                          {signal.targetPrice ? `$${signal.targetPrice.toFixed(4)}` : '-'}
                        </td>
                        <td className="py-3">
                          {signal.stopLoss ? `$${signal.stopLoss.toFixed(4)}` : '-'}
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

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" size={20} />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Service Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">OpenAI API</span>
                      <div className="flex items-center">
                        <div className={cn("w-2 h-2 rounded-full mr-2", hasOpenAI ? "bg-green-500" : "bg-red-500")} />
                        <span className="text-sm">{hasOpenAI ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gemini API</span>
                      <div className="flex items-center">
                        <div className={cn("w-2 h-2 rounded-full mr-2", hasGemini ? "bg-green-500" : "bg-red-500")} />
                        <span className="text-sm">{hasGemini ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Analysis Features</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Technical Analysis</Badge>
                    <Badge variant="secondary">Pattern Recognition</Badge>
                    <Badge variant="secondary">Sentiment Analysis</Badge>
                    <Badge variant="secondary">Risk Assessment</Badge>
                    <Badge variant="secondary">Market Timing</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
