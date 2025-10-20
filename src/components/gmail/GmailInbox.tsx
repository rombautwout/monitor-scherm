import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, RefreshCw, Plug, Unplug, Loader2 } from 'lucide-react';
import { useGmailAuth } from '@/hooks/useGmailAuth';
import { useGmailInbox } from '@/hooks/useGmailInbox';
import { getRelativeTime, formatFullDate } from '@/utils/relativeTime';
import { GmailSettings } from './GmailSettings';
import { GmailDebugPanel } from './GmailDebugPanel';
import { cn } from '@/lib/utils';

export const GmailInbox: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [maxItems, setMaxItems] = useState(10);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const { isConnected, isLoading: authLoading, connect, disconnect, isConnecting, apiBase, error: authError } = useGmailAuth();
  const { messages, mode, lastFetchTime, lastHeartbeat, manualRefresh, sseStatus } = useGmailInbox({
    enabled: isConnected,
    maxItems,
    refreshInterval,
  });

  const filteredMessages = showUnreadOnly ? messages.filter(m => m.isUnread) : messages;

  // Check for ?debug=1 in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDebug(params.get('debug') === '1');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        manualRefresh();
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        setShowUnreadOnly(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualRefresh]);

  if (authLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Mail className="h-16 w-16 mb-4 text-muted-foreground" />
        <CardTitle className="mb-2">Connect Gmail</CardTitle>
        <p className="text-sm text-muted-foreground mb-6">
          Authenticate with Gmail to view your latest messages
        </p>
        <Button onClick={() => connect()} disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Plug className="h-4 w-4 mr-2" />
              Connect Gmail
            </>
          )}
        </Button>
        {isConnecting && (
          <p className="text-xs text-muted-foreground mt-4">
            Complete authorization in the popup window...
          </p>
        )}
        {authError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive">{authError}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Gmail Inbox</CardTitle>
              {mode === 'polling' && (
                <Badge variant="secondary" className="text-xs">
                  Polling
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {mode === 'polling' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={manualRefresh}
                  title="Refresh (R)"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <GmailSettings
                apiBase={apiBase}
                refreshInterval={refreshInterval}
                onRefreshIntervalChange={setRefreshInterval}
                maxItems={maxItems}
                onMaxItemsChange={setMaxItems}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => disconnect()}
                title="Disconnect"
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Press R to refresh • U to toggle unread</span>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-y-auto p-0">
          {filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              {showUnreadOnly ? 'No unread messages' : 'No messages'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors cursor-pointer animate-in fade-in",
                    message.isUnread && "bg-accent/20"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  title={formatFullDate(message.receivedAtISO)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {message.fromName || message.fromEmail}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {message.fromEmail}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {message.isUnread && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(message.receivedAtISO)}
                      </span>
                    </div>
                  </div>
                  <div className="font-medium text-sm mb-1 truncate">
                    {message.subject || '(no subject)'}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {message.snippet}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showDebug && (
        <GmailDebugPanel
          mode={mode}
          sseStatus={sseStatus}
          lastHeartbeat={lastHeartbeat}
          lastFetchTime={lastFetchTime}
          messageCount={messages.length}
        />
      )}
    </>
  );
};
