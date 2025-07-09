import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log("WebSocket connected");
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different types of real-time updates
        switch (data.type) {
          case 'market_update':
            queryClient.setQueryData(['/api/market'], data.data);
            break;
          case 'position_created':
          case 'position_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/positions/active'] });
            queryClient.invalidateQueries({ queryKey: ['/api/analytics/portfolio'] });
            break;
          case 'bot_started':
          case 'bot_stopped':
          case 'bot_updated':
            queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
            break;
          case 'trade_created':
            queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
            queryClient.invalidateQueries({ queryKey: ['/api/analytics/portfolio'] });
            break;
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return wsRef.current;
}