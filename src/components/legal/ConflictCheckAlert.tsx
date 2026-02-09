import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { type LegalCase } from '@/hooks/useLegalCases';

interface Props {
  opposingParty: string;
  clientName: string;
  existingCases: LegalCase[];
}

export function ConflictCheckAlert({ opposingParty, clientName, existingCases }: Props) {
  const conflicts = useMemo(() => {
    const results: { caseNumber: string; reason: string }[] = [];
    const op = opposingParty.toLowerCase().trim();
    const cn = clientName.toLowerCase().trim();
    if (!op && !cn) return results;

    existingCases.forEach(c => {
      if (op && c.opposingParty?.toLowerCase().includes(op)) {
        results.push({ caseNumber: c.caseNumber, reason: `Opposing party "${c.opposingParty}" matches` });
      }
      // Check if current opposing party was a previous client
      if (op && c.title.toLowerCase().includes(op)) {
        results.push({ caseNumber: c.caseNumber, reason: `Opposing party name appears in case "${c.title}"` });
      }
    });
    return results;
  }, [opposingParty, clientName, existingCases]);

  if (conflicts.length === 0) return null;

  return (
    <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/5">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700">Potential Conflict of Interest</AlertTitle>
      <AlertDescription className="text-sm text-amber-600">
        {conflicts.map((c, i) => (
          <p key={i}>• {c.caseNumber}: {c.reason}</p>
        ))}
      </AlertDescription>
    </Alert>
  );
}
