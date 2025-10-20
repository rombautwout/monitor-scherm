import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  received: string;
  isRead: boolean;
}

const OutlookPreview = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [emails, setEmails] = React.useState<EmailItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const lastTopEmailId = React.useRef<string | null>(null);
  const initialized = React.useRef(false);
  
  // Auto-refresh content every 60 seconds when logged in
  React.useEffect(() => {
    let intervalId: number | undefined;
    
    if (isLoggedIn) {
      // Initial fetch
      fetchEmails(true);
      
      intervalId = window.setInterval(() => {
        fetchEmails(false);
      }, 60 * 1000); // 60 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn]);

  const playPing = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880; // A5
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const fetchEmails = async (isInitial: boolean) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call Microsoft Graph API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Demo data - replace with real API results
      const mockEmails: EmailItem[] = isLoggedIn ? [
        {
          id: `${Date.now()}-1`,
          from: 'Exchange Online',
          subject: 'New message received',
          preview: 'This is a preview of your latest email...',
          received: 'Just now',
          isRead: false
        },
        {
          id: `${Date.now()}-2`,
          from: 'PC Partner System',
          subject: 'Status update',
          preview: 'Monitoring systems are operational...',
          received: '1 min ago',
          isRead: false
        },
        {
          id: `${Date.now()}-3`,
          from: 'Microsoft Account Team',
          subject: 'Welcome to Outlook',
          preview: 'Thank you for connecting your Microsoft account...',
          received: '2 mins ago',
          isRead: true
        }
      ] : [];
      
      const limited = mockEmails.slice(0, 5);

      // Detect new email (compare top id)
      const newTopId = limited[0]?.id || null;
      if (!isInitial && newTopId && lastTopEmailId.current && newTopId !== lastTopEmailId.current) {
        toast({ title: 'New email', description: 'You have a new email in your inbox.' });
        playPing();
      }
      lastTopEmailId.current = newTopId || lastTopEmailId.current;

      setEmails(limited);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch emails');
      setIsLoading(false);
      console.error('Error fetching emails:', err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch emails. Please try again.' });
    }
  };

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      // For now, simulate Microsoft OAuth success without redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoggedIn(true);
      toast({ title: 'Connected', description: 'Successfully authenticated with Microsoft account (demo).' });
      fetchEmails(true);
    } catch (error) {
      console.error('Microsoft login failed:', error);
      setError('Authentication failed');
      toast({ title: 'Authentication Failed', description: 'Could not connect to Microsoft. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await fetchEmails(false);
      toast({ title: 'Refreshed', description: 'Email data has been updated' });
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({ variant: 'destructive', title: 'Refresh Failed', description: 'Could not refresh email data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailClick = (emailId: string) => {
    setEmails(prevEmails => prevEmails.map(email => email.id === emailId ? { ...email, isRead: true } : email));
    toast({ title: 'Email Opened', description: 'This would open the full email in a real implementation' });
  };

  return (
    <Card className="h-full shadow-lg border-primary/20 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-xl font-bold text-primary">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>Microsoft Outlook</span>
          </div>
        </CardTitle>
        <div className="flex gap-2">
          {isLoggedIn ? (
            <Button size="sm" variant="outline" className="h-8 hover:bg-primary/10" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : ''}
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-8 hover:bg-primary/10" onClick={handleLogin} disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-1" />
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="p-3 mb-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
            <p className="text-sm mt-1">Please try again or contact support if the issue persists.</p>
          </div>
        )}
        {isLoggedIn ? (
          <div className="space-y-4">
            {emails.length > 0 ? (
              emails.map((email) => (
                <div key={email.id} className={`p-3 border rounded-md hover:bg-muted/30 cursor-pointer transition-all email-item ${!email.isRead ? 'border-primary/30 bg-primary/5' : ''}`} onClick={() => handleEmailClick(email.id)}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${!email.isRead ? 'text-primary' : ''}`}>{email.from}</span>
                    <span className="text-xs text-muted-foreground">{email.received}</span>
                  </div>
                  <div className={`font-medium text-sm ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{email.subject}</div>
                  <div className="text-sm text-muted-foreground truncate">{email.preview}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Your inbox is empty</p>
              </div>
            )}
            {isLoading && emails.length === 0 && (
              <div className="flex justify-center py-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="rounded-full bg-muted h-12 w-12 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
            <Mail className="h-16 w-16 text-muted-foreground mb-4 opacity-70" />
            <h3 className="text-xl font-semibold mb-2">Connect to Outlook</h3>
            <p className="text-sm text-muted-foreground mb-6">Sign in to view your recent emails</p>
            <Button onClick={handleLogin} disabled={isLoading} size="lg" className="btn-login">
              <LogIn className="h-5 w-5 mr-2" />
              {isLoading ? 'Opening Login...' : 'Microsoft Login'}
            </Button>
            <p className="text-xs text-muted-foreground mt-6">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Secure authentication via Microsoft OAuth
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutlookPreview;
