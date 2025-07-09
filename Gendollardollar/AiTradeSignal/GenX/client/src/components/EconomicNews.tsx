import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function EconomicNews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: news, isLoading } = useQuery({
    queryKey: ['/api/news'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const refreshNewsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/news/refresh'),
    onSuccess: () => {
      toast({
        title: "News Updated",
        description: "Economic news has been refreshed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh news",
        variant: "destructive",
      });
    },
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return 'border-warning text-warning bg-warning/10';
      case 'MEDIUM':
        return 'border-primary text-primary bg-primary/10';
      case 'LOW':
        return 'border-gray-600 text-gray-400 bg-gray-600/10';
      default:
        return 'border-gray-600 text-gray-400 bg-gray-600/10';
    }
  };

  const getTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Economic News</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Economic News</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refreshNewsMutation.mutate()}
          disabled={refreshNewsMutation.isPending}
          className="text-primary hover:text-blue-400"
        >
          <i className={`fas fa-sync-alt ${refreshNewsMutation.isPending ? 'fa-spin' : ''} mr-1`}></i>
          {refreshNewsMutation.isPending ? 'Updating...' : 'Refresh'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!news || news.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">
            <i className="fas fa-newspaper text-3xl mb-2"></i>
            <p>No recent news available</p>
          </div>
        ) : (
          news.slice(0, 5).map((article: any) => (
            <div key={article.id} className={`border-l-4 pl-3 ${getImpactColor(article.impact).split(' ')[0]}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-2 mb-1">
                    {article.headline}
                  </p>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-textSecondary">{article.source}</span>
                    <span className="text-xs text-textSecondary">
                      {getTimeAgo(article.publishedAt)}
                    </span>
                    {article.currency && (
                      <Badge variant="outline" className="text-xs">
                        {article.currency}
                      </Badge>
                    )}
                  </div>
                  {article.summary && (
                    <p className="text-xs text-textSecondary line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getImpactColor(article.impact)}`}
                >
                  {article.impact}
                </Badge>
              </div>
            </div>
          ))
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 border-gray-700 hover:bg-gray-800"
        >
          View All News
        </Button>
      </CardContent>
    </Card>
  );
}
