import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  ChartLine,
  Activity,
  Bot,
  MessageCircle,
  Send,
  Brain,
  TrendingUp,
  FileText,
  Gauge,
  Wifi,
  CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { BotStatus } from '../types';

const navigationItems = [
  { href: '/', icon: Gauge, label: 'Dashboard' },
  { href: '/bybit', icon: Activity, label: 'Bybit Integration' },
  { href: '/mt45', icon: Bot, label: 'MT4/5 Signals' },
  { href: '/discord', icon: MessageCircle, label: 'Discord Bot' },
  { href: '/telegram', icon: Send, label: 'Telegram Bot' },
  { href: '/ai', icon: Brain, label: 'AI Services' },
  { href: '/patterns', icon: TrendingUp, label: 'Pattern Recognition' },
  { href: '/logs', icon: FileText, label: 'Logs' },
];

export function Sidebar() {
  const [location] = useLocation();

  const { data: botStatuses } = useQuery({
    queryKey: ['/api/bot-status'],
    refetchInterval: 30000,
  });

  const isSystemOnline = botStatuses?.some((status: BotStatus) => status.status === 'active');

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <ChartLine className="mr-2" size={20} />
          Trading Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Bybit Signal System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">System Status</span>
          <div className="flex items-center">
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              isSystemOnline ? "bg-green-500" : "bg-red-500"
            )} />
            <span className={cn(
              "text-sm",
              isSystemOnline ? "text-green-500" : "text-red-500"
            )}>
              {isSystemOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
