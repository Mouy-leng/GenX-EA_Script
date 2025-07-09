import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioCard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/portfolio'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = analytics?.totalBalance || 0;
  const totalPnL = analytics?.totalPnL || 0;
  const openPnL = analytics?.openPnL || 0;
  const dailyChangePercent = totalBalance > 0 ? (totalPnL / totalBalance) * 100 : 0;

  return (
    <Card className="bg-surface border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Portfolio Overview</CardTitle>
        <button className="text-textSecondary hover:text-textPrimary">
          <i className="fas fa-external-link-alt"></i>
        </button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-textSecondary text-sm">Total Balance</p>
          <p className="text-2xl font-bold font-mono">${totalBalance.toFixed(2)}</p>
          <div className="flex items-center space-x-2 mt-1">
            <i className={`fas ${totalPnL >= 0 ? 'fa-arrow-up text-success' : 'fa-arrow-down text-error'} text-sm`}></i>
            <span className={`text-sm font-medium ${totalPnL >= 0 ? 'text-success' : 'text-error'}`}>
              ${totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-textSecondary text-xs">Available</p>
            <p className="font-mono font-medium">${(totalBalance - (analytics?.totalEquity || 0)).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-textSecondary text-xs">In Positions</p>
            <p className="font-mono font-medium">${(analytics?.totalEquity || 0).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-textSecondary">P&L Today</span>
            <span className={`font-mono ${openPnL >= 0 ? 'text-success' : 'text-error'}`}>
              ${openPnL >= 0 ? '+' : ''}{openPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
