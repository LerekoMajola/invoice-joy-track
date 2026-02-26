import { PortalMessaging } from '@/components/portal/shared/PortalMessaging';
import type { User } from '@supabase/supabase-js';

interface SchoolPortalMessagesProps {
  user: User;
  studentId: string;
  ownerUserId: string;
  schoolName?: string;
}

export function SchoolPortalMessages({ user, studentId, ownerUserId, schoolName }: SchoolPortalMessagesProps) {
  return (
    <PortalMessaging
      user={user}
      referenceId={studentId}
      recipientOwnerId={ownerUserId}
      portalType="school"
      senderType="guardian"
      businessName={schoolName || 'the school'}
    />
  );
}
