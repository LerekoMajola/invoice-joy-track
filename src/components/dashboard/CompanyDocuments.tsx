import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Building2, Shield, ExternalLink, Upload, Settings } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { Link } from 'react-router-dom';
import { differenceInDays, format, parseISO } from 'date-fns';
import { PdfThumbnail } from './PdfThumbnail';

interface DocumentCardProps {
  title: string;
  icon: React.ReactNode;
  documentUrl: string | null | undefined;
  accentColor: string;
  expiryDate?: string | null;
}

function getExpiryStatus(expiryDate: string | null | undefined) {
  if (!expiryDate) return null;
  
  const expiry = parseISO(expiryDate);
  const today = new Date();
  const daysRemaining = differenceInDays(expiry, today);
  
  if (daysRemaining < 0) {
    return { label: 'EXPIRED', variant: 'destructive' as const, daysRemaining };
  } else if (daysRemaining <= 30) {
    return { label: 'Expires Soon', variant: 'warning' as const, daysRemaining };
  } else if (daysRemaining <= 60) {
    return { label: 'Expiring Soon', variant: 'secondary' as const, daysRemaining };
  } else {
    return { label: 'Valid', variant: 'success' as const, daysRemaining };
  }
}

function DocumentCard({ title, icon, documentUrl, accentColor, expiryDate }: DocumentCardProps) {
  const expiryStatus = expiryDate ? getExpiryStatus(expiryDate) : null;
  const isUploaded = !!documentUrl;

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${accentColor}`} />
      <CardContent className="pt-6 pb-4 flex flex-col items-center text-center space-y-4">
        {isUploaded ? (
          <PdfThumbnail url={documentUrl} className="w-32 h-40" />
        ) : (
          <div className="w-32 h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/50">
            {icon}
            <Upload className="h-5 w-5 text-muted-foreground mt-2" />
          </div>
        )}
        
        <div className="space-y-1">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
          
          {isUploaded ? (
            <div className="flex items-center justify-center gap-2 text-success">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Uploaded</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Not uploaded</span>
          )}
        </div>

        {expiryStatus && expiryDate && (
          <div className="space-y-2">
            <Badge 
              variant={expiryStatus.daysRemaining < 0 ? 'destructive' : 'default'}
              className={
                expiryStatus.daysRemaining < 0 ? '' :
                expiryStatus.daysRemaining <= 30 ? 'bg-warning text-warning-foreground' :
                expiryStatus.daysRemaining <= 60 ? 'bg-secondary text-secondary-foreground' :
                'bg-success text-success-foreground'
              }
            >
              {expiryStatus.label}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Expires: {format(parseISO(expiryDate), 'dd MMM yyyy')}
            </p>
            {expiryStatus.daysRemaining >= 0 && (
              <p className="text-xs text-muted-foreground">
                ({expiryStatus.daysRemaining} days remaining)
              </p>
            )}
          </div>
        )}

        {isUploaded ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.open(documentUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Document
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground"
            asChild
          >
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Upload in Settings
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function CompanyDocuments() {
  const { profile, isLoading } = useCompanyProfile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Company Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Company Documents
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <DocumentCard
            title="Tax Clearance"
            icon={<Shield className="h-8 w-8 text-primary" />}
            documentUrl={profile?.tax_clearance_url}
            accentColor="bg-primary"
            expiryDate={profile?.tax_clearance_expiry_date}
          />
          <DocumentCard
            title="Business ID"
            icon={<Building2 className="h-8 w-8 text-success" />}
            documentUrl={profile?.business_id_url}
            accentColor="bg-success"
          />
          <DocumentCard
            title="Company Profile"
            icon={<FileText className="h-8 w-8 text-info" />}
            documentUrl={profile?.company_profile_doc_url}
            accentColor="bg-info"
          />
        </div>
      </CardContent>
    </Card>
  );
}
