import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePortalSession } from '@/hooks/usePortalSession';
import { PortalLogin } from '@/components/portal/PortalLogin';
import { PortalLayout, type PortalTab } from '@/components/portal/PortalLayout';
import { GymMemberPortal } from '@/components/portal/gym/GymMemberPortal';
import { GymPortalMembership } from '@/components/portal/gym/GymPortalMembership';
import { GymPortalSchedule } from '@/components/portal/gym/GymPortalSchedule';
import { SchoolParentPortal } from '@/components/portal/school/SchoolParentPortal';
import { SchoolPortalFees } from '@/components/portal/school/SchoolPortalFees';
import { SchoolPortalTimetable } from '@/components/portal/school/SchoolPortalTimetable';
import { PortalMessaging } from '@/components/portal/shared/PortalMessaging';
import { Loader2 } from 'lucide-react';

export default function Portal() {
  const { user, portalType, gymMember, schoolStudent, loading } = usePortalSession();
  const [activeTab, setActiveTab] = useState<PortalTab>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated — show magic-link login
  if (!user) {
    const urlType = new URLSearchParams(window.location.search).get('type') as 'gym' | 'school' | null;
    return <PortalLogin portalType={urlType} />;
  }

  // Authenticated as gym member
  if (portalType === 'gym' && gymMember) {
    const ownerUserId = gymMember.owner_user_id ?? gymMember.user_id;
    const renderGymTab = () => {
      switch (activeTab) {
        case 'home':
          return <GymMemberPortal member={gymMember} user={user} />;
        case 'membership':
          return <GymPortalMembership memberId={gymMember.id} />;
        case 'classes':
          return <GymPortalSchedule ownerId={ownerUserId} />;
        case 'messages':
          return (
            <PortalMessaging
              user={user}
              referenceId={gymMember.id}
              recipientOwnerId={ownerUserId}
              portalType="gym"
              senderType="member"
            />
          );
        default:
          return <GymMemberPortal member={gymMember} user={user} />;
      }
    };

    return (
      <PortalLayout activeTab={activeTab} onTabChange={setActiveTab} portalType="gym">
        {renderGymTab()}
      </PortalLayout>
    );
  }

  // Authenticated as school parent/guardian
  if (portalType === 'school' && schoolStudent) {
    const ownerUserId = schoolStudent.owner_user_id ?? schoolStudent.user_id;
    const renderSchoolTab = () => {
      switch (activeTab) {
        case 'home':
          return <SchoolParentPortal student={schoolStudent} user={user} />;
        case 'fees':
          return <SchoolPortalFees studentId={schoolStudent.id} ownerId={ownerUserId} />;
        case 'timetable':
          return <SchoolPortalTimetable classId={schoolStudent.class_id} ownerId={ownerUserId} />;
        case 'messages':
          return (
            <PortalMessaging
              user={user}
              referenceId={schoolStudent.id}
              recipientOwnerId={ownerUserId}
              portalType="school"
              senderType="guardian"
            />
          );
        default:
          return <SchoolParentPortal student={schoolStudent} user={user} />;
      }
    };

    return (
      <PortalLayout activeTab={activeTab} onTabChange={setActiveTab} portalType="school">
        {renderSchoolTab()}
      </PortalLayout>
    );
  }

  // Authenticated but no matching record found
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-3">
        <h1 className="text-xl font-bold text-foreground">No record found</h1>
        <p className="text-sm text-muted-foreground">
          We couldn't find a member or student record linked to your email address (<strong>{user.email}</strong>).
          Please contact your gym or school for assistance.
        </p>
        <button
          className="text-sm text-primary underline"
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('portal_type');
            window.location.reload();
          }}
        >
          Try a different email
        </button>
      </div>
    </div>
  );
}
