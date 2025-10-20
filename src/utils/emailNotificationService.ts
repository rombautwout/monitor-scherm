
import { toast } from 'sonner';

export interface EmailSettings {
  enabled: boolean;
  recipient: string;
  notificationDelay: number; // minutes to wait before sending another notification for the same site
}

// Default settings
let emailSettings: EmailSettings = {
  enabled: false,
  recipient: '',
  notificationDelay: 30 // Default: wait 30 minutes before sending another notification for the same site
};

// Track when we last sent notifications for each site to prevent spam
const lastNotificationSent: Record<number, Date> = {};

/**
 * Update the email notification settings
 */
export const updateEmailSettings = (settings: Partial<EmailSettings>): EmailSettings => {
  emailSettings = { ...emailSettings, ...settings };
  return emailSettings;
};

/**
 * Get the current email notification settings
 */
export const getEmailSettings = (): EmailSettings => {
  return { ...emailSettings };
};

/**
 * Send an email notification for a down site
 * In a real implementation, this would connect to a backend service
 */
export const sendDowntimeNotification = async (
  siteId: number,
  siteName: string,
  siteUrl: string
): Promise<boolean> => {
  // Check if notifications are enabled
  if (!emailSettings.enabled || !emailSettings.recipient) {
    console.log('Email notifications are disabled or no recipient configured');
    return false;
  }

  // Check if we recently sent a notification for this site
  const now = new Date();
  if (lastNotificationSent[siteId]) {
    const timeSinceLastNotification = 
      (now.getTime() - lastNotificationSent[siteId].getTime()) / (1000 * 60); // in minutes
    
    if (timeSinceLastNotification < emailSettings.notificationDelay) {
      console.log(`Not sending notification for ${siteName} - already notified ${timeSinceLastNotification.toFixed(1)} minutes ago`);
      return false;
    }
  }

  // In a real app, this would call a backend API
  console.log(`Sending downtime email notification to ${emailSettings.recipient} for site ${siteName} (${siteUrl})`);
  
  try {
    // Simulate sending an email
    // In a production app, we'd call a backend API endpoint here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the last notification time
    lastNotificationSent[siteId] = now;
    
    // Show a success toast
    toast.success(`Email notification sent`, {
      description: `Alert sent to ${emailSettings.recipient} for ${siteName}`,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    
    // Show an error toast
    toast.error(`Failed to send email notification`, {
      description: `Could not send alert for ${siteName}`,
    });
    
    return false;
  }
};
