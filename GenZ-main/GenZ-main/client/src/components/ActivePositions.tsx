import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";

interface PnLChangeState {
  [positionId: number]: {
    lastPnL: number;
    direction: 'up' | 'down' | 'neutral';
    timestamp: number;
  };
}

export default function ActivePositions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pnlChanges, setPnlChanges] = useState<PnLChangeState>({});
  const previousPnLRef = useRef<{[positionId: number]: number}>({});

  const { data: positions, isLoading } = useQuery({
    queryKey: ['/api/positions/active'],
    refetchInterval: 5000,
  });

  // Track P&L changes for visual effects
  useEffect(() => {
    if (positions) {
      positions.forEach((position: any) => {
        const currentPnL = parseFloat(position.pnl || "0");
        const previousPnL = previousPnLRef.current[position.id];
        
        if (previousPnL !== undefined && Math.abs(currentPnL - previousPnL) > 0.01) {
          const direction = currentPnL > previousPnL ? 'up' : 'down';
          setPnlChanges(prev => ({
            ...prev,
            [position.id]: {
              lastPnL: currentPnL,
              direction,
              timestamp: Date.now()
            }
          }));
          
          // Clear the effect after 3 seconds
          setTimeout(() => {
            setPnlChanges(prev => ({
              ...prev,
              [position.id]: {
                ...prev[position.id],
                direction: 'neutral'
              }
            }));
          }, 3000);
        }
        previousPnLRef.current[position.id] = currentPnL;
      });
    }
  }, [positions]);

  const closePositionMutation = useMutation({
    mutationFn: (positionId: number) => apiRequest('POST', `/api/positions/${positionId}/close`),
    onSuccess: () => {
      toast({
        title: "Position Closed",
        description: "Position has been closed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive",
      });
    },
  });

  const getPnLChangeClass = (positionId: number) => {
    const change = pnlChanges[positionId];
    if (!change || change.direction === 'neutral') return '';
    
    return change.direction === 'up' 
      ? 'pnl-pulse-up' 
      : 'pnl-pulse-down';
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-gray-700 flex-1">
        <CardHeader>
          <CardTitle className="text-lg">Active Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-gray-700 flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
          Active Positions
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-textSecondary">
            {positions?.length || 0} positions
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-textSecondary">Live</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {!positions || positions.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">
            <i className="fas fa-chart-line text-3xl mb-2 opacity-50"></i>
            <p>No active positions</p>
            <p className="text-xs mt-1 opacity-75">Open a position to start trading</p>
          </div>
        ) : (
          positions.map((position: any) => {
            const pnl = parseFloat(position.pnl || "0");
            const pnlPercent = parseFloat(position.pnlPercent || "0");
            const pnlChangeClass = getPnLChangeClass(position.id);
            
            return (
              <div key={position.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-transparent hover:border-primary transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-lg">{position.symbol}</span>
                    <Badge 
                      variant={position.side === 'LONG' ? 'default' : 'destructive'}
                      className={`${position.side === 'LONG' ? 'bg-success text-black' : 'bg-error text-white'} font-medium`}
                    >
                      {position.side}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <div className={`w-1 h-1 rounded-full ${pnl >= 0 ? 'bg-success' : 'bg-error'} animate-pulse`}></div>
                      <span className="text-xs text-textSecondary">Live P&L</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`text-right transition-all duration-300 ${pnlChangeClass}`}>
                      <span className={`font-mono text-lg font-bold ${pnl >= 0 ? 'text-success' : 'text-error'}`}>
                        ${pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                      </span>
                      <div className={`text-sm font-medium ${pnlPercent >= 0 ? 'text-success' : 'text-error'}`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closePositionMutation.mutate(position.id)}
                      disabled={closePositionMutation.isPending}
                      className="text-xs hover:bg-error hover:text-white transition-colors"
                    >
                      {closePositionMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        'Close'
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs text-textSecondary">
                  <div className="flex flex-col">
                    <span className="opacity-75">Size</span>
                    <span className="font-mono text-textPrimary font-medium">{position.size}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="opacity-75">Entry Price</span>
                    <span className="font-mono text-textPrimary font-medium">{parseFloat(position.entryPrice).toFixed(4)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="opacity-75">Current Price</span>
                    <span className="font-mono text-textPrimary font-medium">
                      {position.currentPrice ? parseFloat(position.currentPrice).toFixed(4) : 'Live'}
                    </span>
                  </div>
                </div>
                
                {/* Progress bar for P&L visualization */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-textSecondary">Performance</span>
                    <span className={`font-medium ${pnl >= 0 ? 'text-success' : 'text-error'}`}>
                      {pnl >= 0 ? 'Profit' : 'Loss'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        pnl >= 0 ? 'bg-success' : 'bg-error'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(pnlPercent) * 2, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}