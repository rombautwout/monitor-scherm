
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import EmailNotificationSettings from '@/components/email/EmailNotificationSettings';
import AddSiteDialog from '@/components/monitoring/AddSiteDialog';
import { 
  getAllMonitors,
  addSite as addSiteToMonitoring, 
  removeSite as removeSiteFromMonitoring,
  type MonitoredSite
} from '@/utils/monitoringService';
import { Plus, Link, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import SiteManagementTable from '@/components/settings/SiteManagementTable';
import CertificateViewer from '@/components/settings/CertificateViewer';

const Settings = () => {
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [sites, setSites] = useState<MonitoredSite[]>(getAllMonitors());
  const [selectedSiteForCert, setSelectedSiteForCert] = useState<MonitoredSite | null>(null);

  // Function to add a new site
  const addSite = (site: { name: string; url: string }) => {
    const newSite = addSiteToMonitoring(site);
    setSites(getAllMonitors());
    toast.success(`${site.name} added to monitoring`, {
      description: `Monitoring of ${site.url} has started.`
    });
    return newSite;
  };

  // Function to remove a site
  const removeSite = (siteId: number) => {
    const site = sites.find(m => m.id === siteId);
    if (site) {
      removeSiteFromMonitoring(siteId);
      setSites(getAllMonitors());
      toast.success(`${site.name} removed from monitoring`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your monitoring dashboard</p>
        </div>

        <Button variant="outline" onClick={() => window.history.back()} className="mb-6">
          Back to Dashboard
        </Button>

        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sites">Sites Management</TabsTrigger>
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
            <TabsTrigger value="certificates">URLs & Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="sites" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Manage Monitored Sites</h2>
              <Button onClick={() => setIsAddSiteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Site
              </Button>
            </div>

            <SiteManagementTable sites={sites} onRemove={removeSite} />
          </TabsContent>

          <TabsContent value="email">
            <div className="max-w-md mx-auto">
              <EmailNotificationSettings />
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>URLs & Endpoints</CardTitle>
                  <CardDescription>View all monitored URLs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sites.map((site) => (
                      <div key={site.id} className="p-3 border rounded-md flex items-center justify-between">
                        <div>
                          <p className="font-medium">{site.name}</p>
                          <p className="text-sm text-muted-foreground break-all">{site.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={site.status === 'up' ? 'success' : site.status === 'down' ? 'destructive' : 'outline'}>
                            {site.status === 'up' ? 'Online' : site.status === 'down' ? 'Offline' : 'Checking'}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex gap-1 items-center"
                            onClick={() => setSelectedSiteForCert(site)}
                          >
                            <FileText className="h-4 w-4" />
                            <span>Certificate</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {sites.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No sites configured. Add a site to start monitoring.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <CertificateViewer site={selectedSiteForCert} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddSiteDialog
        open={isAddSiteDialogOpen}
        onOpenChange={setIsAddSiteDialogOpen}
        onAddSite={addSite}
      />

      <footer className="py-2 px-6 border-t border-border/40 bg-card text-sm text-muted-foreground mt-auto">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <span>PC Partner Dashboard v2 © {new Date().getFullYear()}</span>
          <span className="text-xs">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Settings;
