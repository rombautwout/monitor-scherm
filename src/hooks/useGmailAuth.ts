import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const useGmailAuth = () => {
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['gmail-auth-status'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/auth/status`);
      if (!res.ok) throw new Error('Failed to fetch auth status');
      return res.json();
    },
    refetchInterval: isPollingStatus ? 2000 : false,
    retry: 1,
  });

  const connectMutation = useMutation({
    mutationFn: async (popup: Window | null) => {
      try {
        const res = await fetch(`${API_BASE}/auth/url`);
        if (!res.ok) {
          popup?.close();
          throw new Error('Failed to get auth URL');
        }
        const data = await res.json();
        if (popup && data.url) {
          popup.location.href = data.url;
        }
        return data.url;
      } catch (error) {
        popup?.close();
        throw new Error('Backend server is not running. Please start your backend at ' + API_BASE);
      }
    },
    onSuccess: () => {
      setIsPollingStatus(true);
    },
  });

  const connect = () => {
    // Open popup synchronously to avoid popup blockers
    const popup = window.open('about:blank', '_blank', 'width=600,height=700');
    connectMutation.mutate(popup);
  };

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/auth/disconnect`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail-auth-status'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-inbox'] });
    },
  });

  useEffect(() => {
    if (status?.connected && isPollingStatus) {
      setIsPollingStatus(false);
    }
  }, [status?.connected]);

  return {
    isConnected: status?.connected || false,
    isLoading,
    connect,
    disconnect: disconnectMutation.mutate,
    isConnecting: connectMutation.isPending || isPollingStatus,
    error: connectMutation.error?.message,
    apiBase: API_BASE,
  };
};
