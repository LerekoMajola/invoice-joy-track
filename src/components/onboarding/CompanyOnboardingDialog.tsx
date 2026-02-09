import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Upload, X, Wrench, GraduationCap, Scale } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useSubscription, type SystemType } from '@/hooks/useSubscription';

const onboardingSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const SYSTEM_CONFIG: Record<SystemType, { icon: React.ElementType; title: string; entityLabel: string }> = {
  business: { icon: Building2, title: "Let's set up your business", entityLabel: 'Company' },
  workshop: { icon: Wrench, title: "Let's set up your workshop", entityLabel: 'Workshop' },
  school: { icon: GraduationCap, title: "Let's set up your school", entityLabel: 'School' },
  legal: { icon: Scale, title: "Let's set up your practice", entityLabel: 'Firm' },
};

interface CompanyOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
 
export function CompanyOnboardingDialog({ open, onOpenChange }: CompanyOnboardingDialogProps) {
  const { saveProfile, isSaving, uploadAsset } = useCompanyProfile();
  const { systemType } = useSubscription();
  const config = SYSTEM_CONFIG[systemType];
  const Icon = config.icon;
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
 
   const form = useForm<OnboardingFormData>({
     resolver: zodResolver(onboardingSchema),
     defaultValues: {
       company_name: '',
       email: '',
       phone: '',
     },
   });
 
   const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setLogoFile(file);
       const reader = new FileReader();
       reader.onloadend = () => {
         setLogoPreview(reader.result as string);
       };
       reader.readAsDataURL(file);
     }
   };
 
   const removeLogo = () => {
     setLogoFile(null);
     setLogoPreview(null);
   };
 
   const onSubmit = async (data: OnboardingFormData) => {
     setIsUploading(true);
     try {
       let logoUrl: string | null = null;
 
       if (logoFile) {
         logoUrl = await uploadAsset(logoFile, 'logo');
       }
 
       saveProfile({
         company_name: data.company_name,
         email: data.email || null,
         phone: data.phone || null,
         logo_url: logoUrl,
       }, {
         onSuccess: () => {
           onOpenChange(false);
         },
       });
     } finally {
       setIsUploading(false);
     }
   };
 
   const isSubmitting = isSaving || isUploading;
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Welcome! {config.title}</DialogTitle>
            <DialogDescription className="text-center">
              Tell us a bit about your {config.entityLabel.toLowerCase()} to get started. You can always update these details later in Settings.
            </DialogDescription>
          </DialogHeader>
 
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
             {/* Logo Upload */}
             <div className="flex flex-col items-center gap-3">
               <div className="relative">
                 {logoPreview ? (
                   <div className="relative">
                     <img
                       src={logoPreview}
                       alt="Logo preview"
                       className="h-20 w-20 rounded-lg object-cover border"
                     />
                     <button
                       type="button"
                       onClick={removeLogo}
                       className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </div>
                 ) : (
                   <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                     <Upload className="h-6 w-6 text-muted-foreground" />
                     <span className="text-xs text-muted-foreground mt-1">Logo</span>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleLogoChange}
                       className="hidden"
                     />
                   </label>
                 )}
               </div>
               <p className="text-xs text-muted-foreground">Optional - Add your company logo</p>
             </div>
 
             {/* Company Name */}
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{config.entityLabel} Name *</FormLabel>
                    <FormControl>
                      <Input placeholder={`Your ${config.entityLabel} Name`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
 
             {/* Email */}
             <FormField
               control={form.control}
               name="email"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Business Email</FormLabel>
                   <FormControl>
                     <Input type="email" placeholder="info@company.com" {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Phone */}
             <FormField
               control={form.control}
               name="phone"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Phone Number</FormLabel>
                   <FormControl>
                     <Input type="tel" placeholder="+266 1234 5678" {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <div className="flex flex-col gap-2 pt-4">
               <Button type="submit" disabled={isSubmitting} className="w-full">
                 {isSubmitting ? 'Setting up...' : 'Complete Setup'}
               </Button>
               <Button
                 type="button"
                 variant="ghost"
                 onClick={() => onOpenChange(false)}
                 className="w-full text-muted-foreground"
               >
                 I'll do this later
               </Button>
             </div>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   );
 }