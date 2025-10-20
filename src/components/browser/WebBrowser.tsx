
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, ArrowLeft, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WebBrowserProps {
  initialUrl?: string;
}

const WebBrowser: React.FC<WebBrowserProps> = ({ initialUrl }) => {
  const startUrl = initialUrl || 'https://example.com';
  const [url, setUrl] = useState(startUrl);
  const [currentUrl, setCurrentUrl] = useState(startUrl);
  const [history, setHistory] = useState<string[]>([startUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<null | { reason: 'mixed' | 'xframe' }>(null);
  const pendingTimer = useRef<number | null>(null);

  useEffect(() => {
    const u = initialUrl || 'https://example.com';
    setUrl(u);
    setCurrentUrl(u);
    setHistory([u]);
    setHistoryIndex(0);
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add http:// if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setIsLoading(true);
    setBlockedInfo(null);
    
    // Update history
    const newHistory = [...history.slice(0, historyIndex + 1), processedUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Update current URL
    setCurrentUrl(processedUrl);

    // Fallback detection for blocked/mixed content
    if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
    pendingTimer.current = window.setTimeout(() => {
      const isHttp = processedUrl.startsWith('http://');
      const isAppSecure = window.location.protocol === 'https:';
      if (isAppSecure && isHttp) {
        setBlockedInfo({ reason: 'mixed' });
      } else {
        setBlockedInfo({ reason: 'xframe' });
      }
      setIsLoading(false);
    }, 4000);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(newUrl);
      setUrl(newUrl);
      setIsLoading(true);
      setBlockedInfo(null);
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => {
        const isHttp = newUrl.startsWith('http://');
        const isAppSecure = window.location.protocol === 'https:';
        if (isAppSecure && isHttp) setBlockedInfo({ reason: 'mixed' });
        else setBlockedInfo({ reason: 'xframe' });
        setIsLoading(false);
      }, 4000);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(newUrl);
      setUrl(newUrl);
      setIsLoading(true);
      setBlockedInfo(null);
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => {
        const isHttp = newUrl.startsWith('http://');
        const isAppSecure = window.location.protocol === 'https:';
        if (isAppSecure && isHttp) setBlockedInfo({ reason: 'mixed' });
        else setBlockedInfo({ reason: 'xframe' });
        setIsLoading(false);
      }, 4000);
    }
  };

  const refresh = () => {
    // Force iframe refresh by temporarily changing the URL
    setCurrentUrl('');
    setIsLoading(true);
    setBlockedInfo(null);
    setTimeout(() => {
      const target = history[historyIndex];
      setCurrentUrl(target);
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => {
        const isHttp = target.startsWith('http://');
        const isAppSecure = window.location.protocol === 'https:';
        if (isAppSecure && isHttp) setBlockedInfo({ reason: 'mixed' });
        else setBlockedInfo({ reason: 'xframe' });
        setIsLoading(false);
      }, 4000);
    }, 100);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-primary">Web Browser</CardTitle>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={goBack} 
            disabled={historyIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={goForward} 
            disabled={historyIndex === history.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={refresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="Enter URL" 
              className="w-full"
            />
          </div>
          <Button type="submit">Go</Button>
        </form>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full relative border-t">
          {blockedInfo && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
              <div className="max-w-md text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">This site can’t be embedded</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {blockedInfo.reason === 'mixed'
                    ? 'Blocked due to mixed content (HTTP inside HTTPS).'
                    : 'Blocked by the site’s X-Frame-Options or Content-Security-Policy.'}
                </p>
                <Button onClick={() => window.open(history[historyIndex], '_blank')} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" /> Open in new tab
                </Button>
              </div>
            </div>
          )}
          {isLoading && !blockedInfo && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40">
              <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          <iframe
            key={currentUrl}
            src={currentUrl}
            title="Embedded Browser"
            className="w-full h-[calc(100vh-240px)]"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer-when-downgrade"
            allow="clipboard-read; clipboard-write; fullscreen"
            onLoad={() => {
              if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
              setIsLoading(false);
              setBlockedInfo(null);
            }}
            onError={() => {
              setBlockedInfo({ reason: 'xframe' });
              setIsLoading(false);
            }}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WebBrowser;
