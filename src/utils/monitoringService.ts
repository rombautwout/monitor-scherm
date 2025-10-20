import { toast } from 'sonner';
import { sendDowntimeNotification } from './emailNotificationService';

export interface MonitoredSite {
  id: number;
  name: string;
  url: string;
  status: 'up' | 'down' | 'pending';
  responseTime: number;
  uptimePercentage: number;
  lastChecked: string;
  consecutiveFailures: number;
  checkInterval: number; // in minutes
}

// In-memory storage for our monitoring data
let monitors: MonitoredSite[] = [
  {
    id: 1,
    name: 'PCPartner Compufact',
    url: 'https://pcpartner.compufact.be/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 2,
    name: 'Infrabel Reproduct',
    url: 'https://infrabel.reproduct.be/OnlineCopyshop/Index',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 3,
    name: 'Veeam PCPartner',
    url: 'https://veeam.pc-partner.be:1280/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 4,
    name: 'Montova DC',
    url: 'https://172.16.101.43/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 5,
    name: 'NAS PCP',
    url: 'http://185.58.98.113:5000/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 6,
    name: 'NAS 2 PCP',
    url: 'https://172.16.101.22:5001/#/signin',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 7,
    name: 'Neuropia Member',
    url: 'https://member.neuropia.be/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 8,
    name: 'PCPartner Website',
    url: 'https://www.pc-partner.be/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 9,
    name: 'Reproduct Webshop',
    url: 'https://webshop.reproduct.be/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 10,
    name: 'Qua-3 Webshop',
    url: 'https://webshop.qua-3.be/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 11,
    name: 'Local Unify Controller',
    url: '172.16.99.251',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 12,
    name: 'Unifi PCPartner',
    url: 'https://unifi2.pc-partner.be:8444/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
  {
    id: 13,
    name: 'Web05',
    url: 'https://web05.pc-partner.be/',
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5
  },
];

// Map to track the timers for each monitored site
const monitorTimers: Record<number, NodeJS.Timeout> = {};

// Function to simulate a ping to a URL
const pingUrl = async (url: string): Promise<{ success: boolean; responseTime: number }> => {
  // In a real app, this would make an actual HTTP request
  // We're simulating it here for demonstration
  return new Promise((resolve) => {
    // Random success/failure and response time
    const randomSuccess = Math.random() > 0.1; // 90% success rate
    const responseTime = randomSuccess ? Math.floor(Math.random() * 200) + 50 : 0;
    
    setTimeout(() => {
      resolve({
        success: randomSuccess,
        responseTime
      });
    }, 500); // Simulate network delay
  });
};

// Function to update the status of a monitored site
const updateSiteStatus = async (siteId: number) => {
  const site = monitors.find(m => m.id === siteId);
  if (!site) return;

  try {
    const { success, responseTime } = await pingUrl(site.url);
    
    // Update the site status
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (success) {
      // Site is up
      site.status = 'up';
      site.responseTime = responseTime;
      site.consecutiveFailures = 0;
      site.lastChecked = timeString;
      
      // Update uptime percentage (simplified calculation)
      site.uptimePercentage = parseFloat((site.uptimePercentage * 0.95 + 0.05 * 100).toFixed(2));
    } else {
      // Site is down
      site.consecutiveFailures++;
      site.lastChecked = timeString;
      
      if (site.consecutiveFailures >= 3) {
        // After 3 consecutive failures, mark as down and trigger alert
        if (site.status !== 'down') {
          site.status = 'down';
          triggerAlert(site);
          
          // Send email notification when site goes down
          sendDowntimeNotification(site.id, site.name, site.url);
        }
        // Update uptime percentage (simplified calculation)
        site.uptimePercentage = parseFloat((site.uptimePercentage * 0.95).toFixed(2));
      }
    }
    
    // Update the monitors array
    monitors = monitors.map(m => m.id === siteId ? site : m);
    
    // Notify subscribers
    notifyUpdate();
    
  } catch (error) {
    console.error(`Error checking site ${site.name}:`, error);
  }
};

// Function to trigger an alert when a site goes down
const triggerAlert = (site: MonitoredSite) => {
  console.log(`ALERT: ${site.name} (${site.url}) is DOWN!`);
  
  // Show toast notification
  toast.error(`Site Down: ${site.name}`, {
    description: `${site.url} is not responding after multiple attempts.`,
    duration: 5000,
  });
  
  // In a real app, this would also send an email alert
};

// Function to start monitoring a site
export const startMonitoring = (siteId: number) => {
  const site = monitors.find(m => m.id === siteId);
  if (!site) return;
  
  // Clear any existing timer
  if (monitorTimers[siteId]) {
    clearInterval(monitorTimers[siteId]);
  }
  
  // Check immediately
  updateSiteStatus(siteId);
  
  // Then check periodically
  monitorTimers[siteId] = setInterval(() => {
    updateSiteStatus(siteId);
  }, site.checkInterval * 60 * 1000); // Convert minutes to milliseconds
  
  // For demo purposes, let's make it check more frequently
  // In production, we'd use the actual interval
  if (process.env.NODE_ENV === 'development') {
    clearInterval(monitorTimers[siteId]);
    monitorTimers[siteId] = setInterval(() => {
      updateSiteStatus(siteId);
    }, 10000); // Check every 10 seconds in development
  }
};

// Function to stop monitoring a site
export const stopMonitoring = (siteId: number) => {
  if (monitorTimers[siteId]) {
    clearInterval(monitorTimers[siteId]);
    delete monitorTimers[siteId];
  }
};

// Function to add a new site to monitor
export const addSite = (site: Omit<MonitoredSite, 'id' | 'status' | 'responseTime' | 'uptimePercentage' | 'lastChecked' | 'consecutiveFailures' | 'checkInterval'>) => {
  const newId = monitors.length > 0 ? Math.max(...monitors.map(m => m.id)) + 1 : 1;
  
  const newSite: MonitoredSite = {
    id: newId,
    name: site.name,
    url: site.url,
    status: 'pending',
    responseTime: 0,
    uptimePercentage: 100,
    lastChecked: 'Just now',
    consecutiveFailures: 0,
    checkInterval: 5 // Default to checking every 5 minutes
  };
  
  monitors = [...monitors, newSite];
  notifyUpdate();
  
  // Start monitoring the new site
  startMonitoring(newId);
  
  return newSite;
};

// Function to remove a site from monitoring
export const removeSite = (siteId: number) => {
  // Stop monitoring
  stopMonitoring(siteId);
  
  // Remove from the list
  monitors = monitors.filter(m => m.id !== siteId);
  notifyUpdate();
};

// Function to get all monitored sites
export const getAllMonitors = (): MonitoredSite[] => {
  return [...monitors];
};

// Subscribers for updates
const subscribers: Array<() => void> = [];

// Function to subscribe to monitor updates
export const subscribeToUpdates = (callback: () => void) => {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
};

// Function to notify all subscribers about an update
const notifyUpdate = () => {
  subscribers.forEach(callback => callback());
};

// Initialize monitoring for all sites
export const initializeMonitoring = () => {
  monitors.forEach(site => {
    startMonitoring(site.id);
  });
};

// Clean up all timers
export const cleanupMonitoring = () => {
  Object.keys(monitorTimers).forEach(idStr => {
    const id = parseInt(idStr, 10);
    clearInterval(monitorTimers[id]);
    delete monitorTimers[id];
  });
};
