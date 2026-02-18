import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import type { GymMember } from '@/hooks/useGymMembers';

interface Props {
  member: GymMember;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  prospect: 'bg-muted text-muted-foreground',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  frozen: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function MemberCard({ member, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="rounded-xl border border-border bg-card p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">{member.firstName} {member.lastName}</p>
          <p className="text-xs text-muted-foreground">{member.memberNumber}</p>
        </div>
        <Badge className={statusColors[member.status] || ''} variant="secondary">
          {member.status}
        </Badge>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        {member.phone && <span>{member.phone}</span>}
        {member.email && <span className="truncate">{member.email}</span>}
      </div>
    </div>
  );
}
