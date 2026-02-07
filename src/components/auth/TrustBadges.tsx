import { Shield, Lock, EyeOff } from 'lucide-react';

const badges = [
  { icon: Shield, label: '256-bit SSL Encrypted' },
  { icon: Lock, label: 'Secure Authentication' },
  { icon: EyeOff, label: 'We never share your data' },
];

export function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
      {badges.map((badge, index) => (
        <div key={badge.label} className="flex items-center gap-1.5">
          {index > 0 && (
            <span className="text-muted-foreground/40 mr-2 hidden sm:inline">·</span>
          )}
          <badge.icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
