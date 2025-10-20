
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bell, BellOff } from 'lucide-react';
import { updateEmailSettings, getEmailSettings, type EmailSettings } from '@/utils/emailNotificationService';
import { toast } from 'sonner';

const EmailNotificationSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>(getEmailSettings());
  const [email, setEmail] = useState(settings.recipient);

  // Initialize with current settings
  useEffect(() => {
    setSettings(getEmailSettings());
    setEmail(getEmailSettings().recipient);
  }, []);

  const handleToggle = (enabled: boolean) => {
    // Validate email if enabling notifications
    if (enabled && !isValidEmail(email)) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address to enable notifications."
      });
      return;
    }

    const newSettings = updateEmailSettings({ 
      enabled,
      recipient: email
    });
    
    setSettings(newSettings);
    
    toast.success(enabled ? "Email notifications enabled" : "Email notifications disabled");
  };

  const handleSaveEmail = () => {
    if (!isValidEmail(email)) {
      toast.error("Invalid email address");
      return;
    }

    const newSettings = updateEmailSettings({ recipient: email });
    setSettings(newSettings);
    toast.success("Email updated successfully");
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {settings.enabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          Email Notifications
        </CardTitle>
        <CardDescription>
          Get alerts when monitored sites go down
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="font-medium">
            Enable email notifications
          </Label>
          <Switch 
            id="notifications" 
            checked={settings.enabled} 
            onCheckedChange={handleToggle} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Notification email</Label>
          <div className="flex gap-2">
            <Input 
              id="email" 
              type="email" 
              placeholder="your@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Button 
              size="sm" 
              onClick={handleSaveEmail}
              disabled={!email || email === settings.recipient}
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailNotificationSettings;
