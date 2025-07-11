import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications?.filter((n: any) => !n.isRead) || [];
      await Promise.all(
        unreadNotifications.map((n: any) => 
          apiRequest('POST', `/api/notifications/${n.id}/read`)
        )
      );
    },
    onSuccess: () => {
      toast({
        title: "Notifications Updated",
        description: "All notifications marked as read",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return 'fa-chart-line';
      case 'risk':
        return 'fa-exclamation-triangle';
      case 'news':
        return 'fa-newspaper';
      case 'bot':
        return 'fa-robot';
      default:
        return 'fa-bell';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-error';
    if (priority === 'medium') return 'text-warning';
    
    switch (type) {
      case 'trade':
        return 'text-success';
      case 'risk':
        return 'text-warning';
      case 'news':
        return 'text-primary';
      case 'bot':
        return 'text-secondary';
      default:
        return 'text-textSecondary';
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
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

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'trade':
        return 'default';
      case 'risk':
        return 'destructive';
      case 'news':
        return 'secondary';
      case 'bot':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Recent Notifications</CardTitle>
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
    <Card className="bg-surface border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Notifications</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="text-primary hover:text-blue-400"
          >
            Mark All Read
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <i className="fas fa-cog text-textSecondary"></i>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">
            <i className="fas fa-bell text-3xl mb-2"></i>
            <p>No notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification: any) => (
            <div 
              key={notification.id} 
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                notification.isRead ? 'bg-gray-800' : 'bg-gray-800 border-l-4 border-primary'
              }`}
              onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
            >
              <div 
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  getNotificationColor(notification.type, notification.priority)
                }`}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-medium truncate ${
                    notification.isRead ? 'text-textSecondary' : 'text-textPrimary'
                  }`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-textSecondary flex-shrink-0 ml-2">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-textSecondary mb-2 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getBadgeVariant(notification.type)}
                    className="text-xs"
                  >
                    <i className={`fas ${getNotificationIcon(notification.type)} mr-1`}></i>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </Badge>
                  {notification.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      High Priority
                    </Badge>
                  )}
                  {notification.data?.symbol && (
                    <Badge variant="outline" className="text-xs">
                      {notification.data.symbol}
                    </Badge>
                  )}
                </div>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
