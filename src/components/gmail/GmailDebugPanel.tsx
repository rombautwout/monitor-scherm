import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GmailDebugPanelProps {
  mode: 'sse' | 'polling' | 'offline';
  sseStatus: 'connecting' | 'connected' | 'disconnected';
  lastHeartbeat: Date | null;
  lastFetchTime: Date | null;
  messageCount: number;
}

export const GmailDebugPanel: React.FC<GmailDebugPanelProps> = ({
  mode,
  sseStatus,
  lastHeartbeat,
  lastFetchTime,
  messageCount,
}) => {
  return (
    <Card className="fixed bottom-4 right-4 p-4 space-y-2 text-xs font-mono bg-background/95 backdrop-blur z-50">
      <div className="font-bold text-sm mb-2">Debug Panel</div>
      <div className="flex items-center gap-2">
        <span>Connection:</span>
        <Badge variant={mode === 'sse' ? 'default' : mode === 'polling' ? 'secondary' : 'destructive'}>
          {mode.toUpperCase()}
        </Badge>
      </div>
      {mode === 'sse' && (
        <div className="flex items-center gap-2">
          <span>SSE Status:</span>
          <Badge variant={sseStatus === 'connected' ? 'default' : 'secondary'}>
            {sseStatus}
          </Badge>
        </div>
      )}
      <div>
        Last Heartbeat: {lastHeartbeat ? lastHeartbeat.toLocaleTimeString() : 'N/A'}
      </div>
      <div>
        Last Fetch: {lastFetchTime ? lastFetchTime.toLocaleTimeString() : 'N/A'}
      </div>
      <div>
        Messages: {messageCount}
      </div>
    </Card>
  );
};
