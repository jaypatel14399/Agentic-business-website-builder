import { useEffect, useRef, useState, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { WebSocketMessage } from '../types';

interface UseWebSocketOptions {
  jobId: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  enabled?: boolean;
}

export const useWebSocket = ({ jobId, onMessage, enabled = true }: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !jobId) {
      return;
    }

    const wsUrl = `ws://localhost:8000/api/jobs/${jobId}/ws`;
    const ws = new ReconnectingWebSocket(wsUrl, [], {
      connectionTimeout: 4000,
      maxRetries: 10,
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
    });

    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    ws.addEventListener('close', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.addEventListener('message', (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [jobId, enabled, onMessage]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};
