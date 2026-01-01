import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Briefcase, FileUser, Upload, ExternalLink, Plus, Settings } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useTaxClearances } from '@/hooks/useTaxClearances';
import { Link } from 'react-router-dom';
import { differenceInDays, isPast, parseISO } from 'date-fns';
import { PdfThumbnail } from './PdfThumbnail';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentCardProps {
  title: string;
  icon: React.ReactNode;
  isUploaded: boolean;
  documentUrl?: string | null;
  expiryDate?: string | null;
  accentColor: string;
  activityName?: string;
}

function getExpiryStatus(expiryDate: string | null | undefined) {
  if (!expiryDate) return null;
  
  const expiry = parseISO(expiryDate);
  const daysRemaining = differenceInDays(expiry, new Date());
  
  if (isPast(expiry)) {
    return { label: 'Expired', variant: 'destructive' as const };
  } else if (daysRemaining <= 30) {
    return { label: `${daysRemaining}d left`, variant: 'destructive' as const };
  } else if (daysRemaining <= 60) {
    return { label: `${daysRemaining}d left`, variant: 'secondary' as const };
  } else {
    return { label: 'Valid', variant: 'default' as const };
  }
}

function DocumentCard({ 
  title, 
  icon, 
  isUploaded, 
  documentUrl, 
  expiryDate,
  accentColor,
  activityName
}: DocumentCardProps) {
  const expiryStatus = getExpiryStatus(expiryDate);

  const handleViewDocument = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="overflow-hidden min-w-[180px] max-w-[200px] flex-shrink-0">
      <div className={`h-1.5 ${accentColor}`} />
      <CardContent className="pt-4 pb-3 px-3 flex flex-col items-center text-center space-y-2">
        {isUploaded && documentUrl ? (
          <PdfThumbnail url={documentUrl} className="w-full h-28" />
        ) : (
          <div className="w-full h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/50">
            {icon}
            <Upload className="h-4 w-4 text-muted-foreground mt-1" />
          </div>
        )}
        
        <div className="space-y-1 w-full">
          <h3 className="font-medium text-xs uppercase tracking-wide text-muted-foreground truncate">
            {activityName || title}
          </h3>
          
          {expiryStatus && (
            <Badge variant={expiryStatus.variant} className="text-[10px] px-1.5 py-0">
              {expiryStatus.label}
            </Badge>
          )}
          
          {isUploaded ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-xs h-7"
              onClick={handleViewDocument}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full text-xs h-7 text-muted-foreground"
              asChild
            >
              <Link to="/settings">Upload</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyDocuments() {
  const { profile, isLoading: isProfileLoading } = useCompanyProfile();
  const { taxClearances, isLoading: isTaxLoading } = useTaxClearances();

  const isLoading = isProfileLoading || isTaxLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Company Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-44 flex-shrink-0" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Company Documents</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tax Clearances Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              Tax Clearances ({taxClearances.length})
            </h4>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link to="/settings">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Link>
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {taxClearances.length > 0 ? (
              taxClearances.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title="Tax Clearance"
                  activityName={doc.activity_name}
                  icon={<Shield className="h-6 w-6 text-blue-500" />}
                  isUploaded={true}
                  documentUrl={doc.document_url}
                  expiryDate={doc.expiry_date}
                  accentColor="bg-blue-500"
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-32 w-full border-2 border-dashed rounded-lg bg-muted/30">
                <div className="text-center text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tax clearances uploaded</p>
                  <Button variant="link" size="sm" className="mt-1" asChild>
                    <Link to="/settings">Add in Settings</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Other Documents */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Other Documents</h4>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <DocumentCard
              title="Business ID"
              icon={<Briefcase className="h-6 w-6 text-emerald-500" />}
              isUploaded={!!profile?.business_id_url}
              documentUrl={profile?.business_id_url}
              accentColor="bg-emerald-500"
            />
            <DocumentCard
              title="Company Profile"
              icon={<FileUser className="h-6 w-6 text-purple-500" />}
              isUploaded={!!profile?.company_profile_doc_url}
              documentUrl={profile?.company_profile_doc_url}
              accentColor="bg-purple-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
