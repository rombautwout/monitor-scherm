import React, { useState, useEffect } from 'react';
import WebBrowser from '@/components/browser/WebBrowser';
import NotesBoard from '@/components/notes/NotesBoard';
import OutlookPreview from '@/components/email/OutlookPreview';
import { GmailInbox } from '@/components/gmail/GmailInbox';
import { EmailConnectionDialog } from '@/components/email/EmailConnectionDialog';
import Logo from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut, Moon, Sun, Mail, StickyNote } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

const Dashboard = () => {
  const { user, login, logout } = useAuth();
  const { defaultBrowserUrl, setDefaultBrowserUrl } = useSettings();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [homepage, setHomepage] = useState(defaultBrowserUrl);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'outlook' | 'gmail' | 'notes'>('gmail');
  const [viewMode, setViewMode] = useState<'email' | 'notes'>('email');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success, error } = await login(username, password);
    if (success) {
      toast({ title: 'Welcome', description: 'Logged in successfully.' });
      setOpen(false);
      setUsername('');
      setPassword('');
    } else {
      toast({ title: 'Login failed', description: error || 'Invalid credentials', variant: 'destructive' });
    }
  };

  const handleSaveHomepage = (e: React.FormEvent) => {
    e.preventDefault();
    let u = homepage.trim();
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      u = 'https://' + u;
    }
    setDefaultBrowserUrl(u);
    toast({ title: 'Saved', description: 'Default browser URL updated.' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Main content - Web Browser Section */}
        <div className="w-full lg:w-3/5 p-4 md:p-6">
          <div className="mb-4 animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <Logo />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                {!user ? (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <LogIn className="h-4 w-4 mr-2" />
                        Admin Login
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Admin Login</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground">Username</label>
                          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Password</label>
                          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <Button type="submit" className="w-full">Login</Button>
                      </form>
                      <div className="text-xs text-muted-foreground mt-2">
                        Hint: username "admin" and password "admin2005"
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            </div>
            {user?.role === 'superadmin' && (
              <form onSubmit={handleSaveHomepage} className="flex items-center gap-2">
                <Input
                  value={homepage}
                  onChange={(e) => setHomepage(e.target.value)}
                  placeholder="Default browser URL"
                  className="max-w-md"
                />
                <Button type="submit">Save</Button>
              </form>
            )}
          </div>
          <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border/40 dashboard-section animate-fade-in">
            <WebBrowser initialUrl={defaultBrowserUrl} />
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="hidden lg:flex lg:w-2/5 flex-col p-4 md:p-6 border-l border-border/40 bg-background/50">
          <div className="mb-3 flex items-center justify-center gap-1">
            {user?.role === 'superadmin' ? (
              <Button
                variant={viewMode === 'email' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode('email');
                  setEmailDialogOpen(true);
                }}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            )}
            <Button
              variant={viewMode === 'notes' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('notes')}
              className="flex-1"
            >
              <StickyNote className="h-4 w-4 mr-1" />
              Notes
            </Button>
          </div>
          <div className="h-full overflow-auto">
            {viewMode === 'email' && activeTab === 'outlook' && <OutlookPreview />}
            {viewMode === 'email' && activeTab === 'gmail' && <GmailInbox />}
            {viewMode === 'notes' && <NotesBoard />}
          </div>
          
          <EmailConnectionDialog
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            onSelectProvider={(provider) => {
              setActiveTab(provider);
              setViewMode('email');
            }}
          />
        </div>
      </div>
      
      <footer className="py-2 px-6 border-t border-border/40 bg-card text-sm text-muted-foreground">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <span>PC Partner Dashboard © {new Date().getFullYear()}</span>
          <span className="text-xs">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
