import express, { type Express, type Request, type Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { createServer, type Server } from "http";
import tradingRoutes from "./trading-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Add trading routes
  app.use(tradingRoutes);

  return httpServer;
}