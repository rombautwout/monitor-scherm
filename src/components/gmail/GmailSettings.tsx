import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface GmailSettingsProps {
  apiBase: string;
  refreshInterval: number;
  onRefreshIntervalChange: (value: number) => void;
  maxItems: number;
  onMaxItemsChange: (value: number) => void;
}

export const GmailSettings: React.FC<GmailSettingsProps> = ({
  apiBase,
  refreshInterval,
  onRefreshIntervalChange,
  maxItems,
  onMaxItemsChange,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>API Base URL</Label>
            <Input value={apiBase} disabled className="font-mono text-sm" />
          </div>

          <div className="space-y-2">
            <Label>Refresh Interval (seconds)</Label>
            <Input
              type="number"
              min={15}
              max={60}
              value={refreshInterval / 1000}
              onChange={(e) => onRefreshIntervalChange(Number(e.target.value) * 1000)}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Items</Label>
            <Input
              type="number"
              min={5}
              max={20}
              value={maxItems}
              onChange={(e) => onMaxItemsChange(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
