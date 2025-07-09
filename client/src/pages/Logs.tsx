import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '../components/Header';
import { useWebSocket } from '../hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { 
  FileText, 
  Filter, 
  Search, 
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SystemLog } from '../types';

export default function Logs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const { lastMessage } = useWebSocket('/ws');

  const { data: initialLogs, isLoading, refetch } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  useEffect(() => {
    if (lastMessage?.type === 'new_log') {
      setLogs(prev => [lastMessage.data, ...prev.slice(0, 499)]);
    }
  }, [lastMessage]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, serviceFilter]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'INFO':
        return <Info size={16} className="text-blue-500" />;
      case 'WARN':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'ERROR':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'DEBUG':
        return <Bug size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'log-info';
      case 'DEBUG':
        return 'log-debug';
      case 'WARN':
        return 'log-warn';
      case 'ERROR':
        return 'log-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case 'bybit':
        return 'bg-blue-500/20 text-blue-500';
      case 'discord':
        return 'bg-purple-500/20 text-purple-500';
      case 'telegram':
        return 'bg-cyan-500/20 text-cyan-500';
      case 'mt45':
        return 'bg-green-500/20 text-green-500';
      case 'ai':
        return 'bg-pink-500/20 text-pink-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const logLevels = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
  const services = ['ALL', 'bybit', 'discord', 'telegram', 'mt45', 'ai'];

  const logCounts = {
    total: logs.length,
    info: logs.filter(log => log.level === 'INFO').length,
    warn: logs.filter(log => log.level === 'WARN').length,
    error: logs.filter(log => log.level === 'ERROR').length,
    debug: logs.filter(log => log.level === 'DEBUG').length,
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="System Logs"
        subtitle="Real-time system monitoring and error tracking"
      />
      
      <main className="p-6">
        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Logs</p>
                  <p className="text-2xl font-bold text-blue-400">{logCounts.total}</p>
                </div>
                <FileText size={24} className="text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Info</p>
                  <p className="text-2xl font-bold text-blue-500">{logCounts.info}</p>
                </div>
                <Info size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-500">{logCounts.warn}</p>
                </div>
                <AlertTriangle size={24} className="text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Errors</p>
                  <p className="text-2xl font-bold text-red-500">{logCounts.error}</p>
                </div>
                <AlertCircle size={24} className="text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Debug</p>
                  <p className="text-2xl font-bold text-purple-500">{logCounts.debug}</p>
                </div>
                <Bug size={24} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2" size={20} />
              Log Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Search size={16} className="text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className="mr-2" />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Level</label>
                  <div className="flex gap-2">
                    {logLevels.map(level => (
                      <Button
                        key={level}
                        variant={levelFilter === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLevelFilter(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Service</label>
                  <div className="flex gap-2">
                    {services.map(service => (
                      <Button
                        key={service}
                        variant={serviceFilter === service ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setServiceFilter(service)}
                      >
                        {service}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="mr-2" size={20} />
                System Logs
              </span>
              <Badge variant="secondary">
                {filteredLogs.length} of {logs.length} logs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded loading-shimmer" />
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No logs match your current filters</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg log-entry">
                    <span className="text-muted-foreground text-xs mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      {getLogIcon(log.level)}
                      <Badge className={cn("text-xs", getLogLevelClass(log.level))}>
                        {log.level}
                      </Badge>
                    </div>
                    <Badge className={cn("text-xs", getServiceBadgeColor(log.service))}>
                      {log.service}
                    </Badge>
                    <span className="text-foreground flex-1 text-sm">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
