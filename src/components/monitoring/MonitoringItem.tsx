
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MonitoringItemProps {
  id: number;
  name: string;
  url: string;
  status: 'up' | 'down' | 'pending';
  responseTime: number;
  uptimePercentage: number;
  lastChecked: string;
  onRemove: (id: number) => void;
}

const MonitoringItem = ({
  id,
  name,
  url,
  status,
  responseTime,
  uptimePercentage,
  lastChecked,
  onRemove
}: MonitoringItemProps) => {
  const statusColor = status === 'up' 
    ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
    : status === 'down' 
    ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
    : "border-amber-400 bg-amber-50 dark:bg-amber-950/20";

  return (
    <Card className={cn(
      "p-3 hover:shadow-md transition-shadow border-l-4 group relative",
      statusColor
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "w-3 h-3 rounded-full",
              status === 'up' ? "bg-green-500 animate-pulse" : 
              status === 'down' ? "bg-red-500" : 
              "bg-amber-400"
            )}
            aria-label={`Status: ${status}`}
          />
          <h3 className="font-medium text-sm">{name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-full",
            status === 'up' ? "bg-green-500/20 text-green-700 dark:text-green-400" : 
            status === 'down' ? "bg-red-500/20 text-red-700 dark:text-red-400" : 
            "bg-amber-500/20 text-amber-700 dark:text-amber-400"
          )}>
            {status === 'up' ? 'Online' : status === 'down' ? 'Offline' : 'Checking...'}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove from monitoring</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div>
          <p className="text-muted-foreground text-[10px]">Response</p>
          <p className="font-medium">
            {status === 'pending' ? '-' : `${responseTime} ms`}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Uptime</p>
          <p className="font-medium">{uptimePercentage}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Last Check</p>
          <p className="font-medium">{lastChecked}</p>
        </div>
      </div>
    </Card>
  );
};

export default MonitoringItem;
