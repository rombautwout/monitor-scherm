
import React, { useState, useEffect } from 'react';
import MonitoringItem from './MonitoringItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddSiteDialog from './AddSiteDialog';
import { 
  getAllMonitors, 
  addSite as addSiteToMonitoring, 
  removeSite as removeSiteFromMonitoring, 
  subscribeToUpdates,
  initializeMonitoring,
  cleanupMonitoring,
  type MonitoredSite
} from '@/utils/monitoringService';
import { toast } from 'sonner';

const MonitoringList = () => {
  const [monitors, setMonitors] = useState<MonitoredSite[]>([]);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);

  // Initialize monitoring and subscribe to updates
  useEffect(() => {
    // Get initial state
    setMonitors(getAllMonitors());
    
    // Initialize monitoring for all sites
    initializeMonitoring();
    
    // Subscribe to updates
    const unsubscribe = subscribeToUpdates(() => {
      // Sort monitors to prioritize down sites at the top
      const sortedMonitors = getAllMonitors().sort((a, b) => {
        if (a.status === 'down' && b.status !== 'down') return -1;
        if (a.status !== 'down' && b.status === 'down') return 1;
        if (a.status === 'pending' && b.status === 'up') return -1;
        if (a.status === 'up' && b.status === 'pending') return 1;
        return 0;
      });
      
      setMonitors(sortedMonitors);
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      cleanupMonitoring();
    };
  }, []);

  // Function to add a new site to monitor
  const addSite = (site: { name: string; url: string }) => {
    const newSite = addSiteToMonitoring(site);
    toast.success(`${site.name} added to monitoring`, {
      description: `Monitoring of ${site.url} has started.`
    });
    return newSite;
  };

  // Function to remove a site from monitoring
  const removeSite = (siteId: number) => {
    const site = monitors.find(m => m.id === siteId);
    if (site) {
      removeSiteFromMonitoring(siteId);
      toast.success(`${site.name} removed from monitoring`);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-primary">Service Monitoring</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            asChild
          >
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </Link>
          </Button>
          <Button size="sm" onClick={() => setIsAddSiteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Site
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-240px)] overflow-auto">
          {monitors.map((monitor) => (
            <MonitoringItem
              key={monitor.id}
              id={monitor.id}
              name={monitor.name}
              url={monitor.url}
              status={monitor.status}
              responseTime={monitor.responseTime}
              uptimePercentage={monitor.uptimePercentage}
              lastChecked={monitor.lastChecked}
              onRemove={removeSite}
            />
          ))}
          {monitors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground md:col-span-2 lg:col-span-3">
              No sites are being monitored. Click "Add Site" to start monitoring.
            </div>
          )}
        </div>
      </CardContent>
      
      <AddSiteDialog 
        open={isAddSiteDialogOpen}
        onOpenChange={setIsAddSiteDialogOpen}
        onAddSite={addSite}
      />
    </Card>
  );
};

export default MonitoringList;
