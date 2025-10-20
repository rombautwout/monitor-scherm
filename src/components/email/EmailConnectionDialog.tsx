import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Inbox } from 'lucide-react';

interface EmailConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProvider: (provider: 'outlook' | 'gmail') => void;
}

export const EmailConnectionDialog: React.FC<EmailConnectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectProvider,
}) => {
  const handleSelect = (provider: 'outlook' | 'gmail') => {
    onSelectProvider(provider);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Email Provider</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelect('outlook')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Microsoft Outlook</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect to your Microsoft Outlook account to view emails
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelect('gmail')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Inbox className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Gmail</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect to your Gmail account with OAuth authentication
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
