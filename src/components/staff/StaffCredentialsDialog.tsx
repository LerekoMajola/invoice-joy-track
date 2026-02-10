import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ShieldAlert } from 'lucide-react';

interface StaffCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  email: string;
  tempPassword: string;
}

export function StaffCredentialsDialog({
  open,
  onOpenChange,
  staffName,
  email,
  tempPassword,
}: StaffCredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = async () => {
    const text = `Login Credentials for ${staffName}\nEmail: ${email}\nTemporary Password: ${tempPassword}`;
    await navigator.clipboard.writeText(text);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Login Credentials Created</DialogTitle>
          <DialogDescription>
            Account created for <span className="font-medium">{staffName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium font-mono">{email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(email, 'email')}
              >
                {copiedField === 'email' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Temporary Password</p>
                <p className="text-sm font-medium font-mono">{tempPassword}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(tempPassword, 'password')}
              >
                {copiedField === 'password' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
            <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Please share these credentials securely. The staff member should change their password on first login.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={copyAll}>
              {copiedField === 'all' ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </>
              )}
            </Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
