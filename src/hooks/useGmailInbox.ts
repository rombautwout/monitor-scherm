import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEventSource } from './useEventSource';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export interface GmailMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  receivedAtISO: string;
  isUnread: boolean;
}

interface UseGmailInboxOptions {
  enabled: boolean;
  maxItems?: number;
  refreshInterval?: number;
}

export const useGmailInbox = ({ enabled, maxItems = 10, refreshInterval = 30000 }: UseGmailInboxOptions) => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [mode, setMode] = useState<'sse' | 'polling' | 'offline'>('offline');
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [sseEnabled, setSseEnabled] = useState(true);
  const [sseErrorCount, setSSEErrorCount] = useState(0);

  // SSE connection
  const { status: sseStatus, lastHeartbeat } = useEventSource(
    enabled && sseEnabled ? `${API_BASE}/inbox/stream` : null,
    {
      enabled: enabled && sseEnabled,
      onMessage: (data) => {
        if (data.messages) {
          setMessages(data.messages.slice(0, maxItems));
          setLastFetchTime(new Date());
          setMode('sse');
          setSSEErrorCount(0);
        }
      },
      onError: () => {
        setSSEErrorCount(prev => prev + 1);
        // After 3 SSE errors, fallback to polling
        if (sseErrorCount >= 2) {
          console.log('[Gmail] SSE failed repeatedly, switching to polling');
          setSseEnabled(false);
          setMode('polling');
        }
      },
    }
  );

  // Polling fallback
  const { data: pollingData, refetch } = useQuery({
    queryKey: ['gmail-inbox'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/inbox/latest`);
      if (!res.ok) throw new Error('Failed to fetch inbox');
      return res.json();
    },
    enabled: enabled && !sseEnabled,
    refetchInterval: !sseEnabled ? refreshInterval : false,
    retry: 1,
  });

  useEffect(() => {
    if (pollingData?.messages) {
      setMessages(pollingData.messages.slice(0, maxItems));
      setLastFetchTime(new Date());
      setMode('polling');
    }
  }, [pollingData, maxItems]);

  useEffect(() => {
    if (!enabled) {
      setMode('offline');
      setMessages([]);
    }
  }, [enabled]);

  const manualRefresh = useCallback(() => {
    if (mode === 'polling') {
      refetch();
    }
  }, [mode, refetch]);

  return {
    messages,
    mode,
    lastFetchTime,
    lastHeartbeat,
    manualRefresh,
    sseStatus,
  };
};
