
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type MonitoredSite } from '@/utils/monitoringService';
import { toast } from 'sonner';

interface CertificateInfo {
  valid: boolean;
  validFrom?: string;
  validTo?: string;
  issuer?: string;
  subjectName?: string;
  protocol?: string;
  bits?: number;
  fingerprint?: string;
}

interface CertificateViewerProps {
  site: MonitoredSite | null;
}

const CertificateViewer = ({ site }: CertificateViewerProps) => {
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset certificate info when site changes
  useEffect(() => {
    setCertificateInfo(null);
  }, [site]);

  // In a real application, this would call a backend service to fetch certificate info
  // Here we're simulating it with mock data
  const fetchCertificateInfo = () => {
    if (!site) return;
    
    setLoading(true);
    
    // Check if URL has https to simulate certificate check
    const isHttps = site.url.toLowerCase().startsWith('https://');
    
    // Simulate API call with timeout
    setTimeout(() => {
      if (!isHttps) {
        setCertificateInfo({
          valid: false
        });
        toast.error("No SSL certificate found", {
          description: "This site does not use HTTPS or TLS"
        });
      } else {
        // Mock certificate data
        setCertificateInfo({
          valid: true,
          validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          validTo: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          issuer: "Let's Encrypt Authority X3",
          subjectName: new URL(site.url).hostname,
          protocol: "TLS 1.2",
          bits: 2048,
          fingerprint: "2C:F3:44:9A:7C:E9:12:BB:58:08:1C:9C:78:33:5B:4D:FB:CA:38:09"
        });
        toast.success("Certificate information retrieved");
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Information</CardTitle>
        <CardDescription>
          {site ? `View SSL/TLS certificate details for ${site.name}` : 'Select a site to view certificate details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!site ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a site from the list to check its certificate
          </div>
        ) : !certificateInfo ? (
          <div className="text-center py-8">
            <Button 
              onClick={fetchCertificateInfo}
              disabled={loading}
            >
              {loading ? "Checking..." : "Check Certificate"}
            </Button>
          </div>
        ) : !certificateInfo.valid ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
            <p className="font-medium text-amber-800 dark:text-amber-400">No SSL Certificate</p>
            <p className="text-sm text-amber-700 dark:text-amber-500">
              This site does not use HTTPS or we couldn't detect a valid SSL certificate.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
              <p className="font-medium text-green-800 dark:text-green-400">Certificate Valid</p>
            </div>
            
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Subject</div>
                <div className="text-sm">{certificateInfo.subjectName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Issuer</div>
                <div className="text-sm">{certificateInfo.issuer}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Valid From</div>
                <div className="text-sm">{certificateInfo.validFrom}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Valid Until</div>
                <div className="text-sm">{certificateInfo.validTo}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Protocol</div>
                <div className="text-sm">{certificateInfo.protocol}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Key Size</div>
                <div className="text-sm">{certificateInfo.bits} bits</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Fingerprint</div>
                <div className="text-sm break-all">{certificateInfo.fingerprint}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateViewer;
