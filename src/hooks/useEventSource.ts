import { useEffect, useRef, useState } from 'react';

interface UseEventSourceOptions {
  onMessage: (data: any) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export const useEventSource = (url: string | null, options: UseEventSourceOptions) => {
  const { onMessage, onError, enabled = true } = options;
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000);

  const connect = () => {
    if (!url || !enabled) return;

    setStatus('connecting');
    const es = new EventSource(url);
    
    es.onopen = () => {
      console.log('[SSE] Connected');
      setStatus('connected');
      reconnectDelayRef.current = 1000; // Reset backoff
    };

    es.onmessage = (event) => {
      setLastHeartbeat(new Date());
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };

    es.onerror = (error) => {
      console.error('[SSE] Error:', error);
      setStatus('disconnected');
      es.close();
      onError?.(error);

      // Exponential backoff: 1s → 2s → 5s → 10s
      const delays = [1000, 2000, 5000, 10000];
      const nextDelay = delays[Math.min(delays.indexOf(reconnectDelayRef.current) + 1, delays.length - 1)];
      reconnectDelayRef.current = nextDelay;

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`[SSE] Reconnecting in ${nextDelay}ms...`);
        connect();
      }, nextDelay);
    };

    eventSourceRef.current = es;
  };

  useEffect(() => {
    if (enabled && url) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [url, enabled]);

  return { status, lastHeartbeat };
};
