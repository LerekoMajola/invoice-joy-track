import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Timer, CalendarDays, Receipt, Plus, FolderOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, getDayOfYear } from 'date-fns';

const legalQuotes = [
  "Justice delayed is justice denied.",
  "The good lawyer is not the man who has an eye to every side and angle of contingency, but who throws himself on your behalf.",
  "Where there is a right, there is a remedy.",
  "Preparation is the key to success in the courtroom and in life.",
  "A lawyer's time and advice are their stock in trade.",
  "The law is reason, free from passion.",
  "Injustice anywhere is a threat to justice everywhere.",
  "Diligence is the mother of good luck.",
  "The first duty of society is justice.",
  "Facts are stubborn things; and whatever may be our wishes, they cannot alter the state of facts and evidence.",
  "In law, nothing is certain but the expense.",
  "The life of the law has not been logic; it has been experience.",
  "Every case is an opportunity to uphold the principles of justice.",
  "A good lawyer knows the law; a great lawyer knows the judge.",
  "The court of law is the last resort for the oppressed.",
];

export default function LegalDashboard() {
  const navigate = useNavigate();

  const today = new Date();
  const dayIndex = getDayOfYear(today);
  const dailyQuote = legalQuotes[dayIndex % legalQuotes.length];

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        subtitle="Manage cases, track billable hours, and stay on top of deadlines."
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
        {/* Date & Motivational Message */}
        <div className="rounded-xl border border-emerald-500/10 bg-gradient-to-r from-emerald-500/5 via-background to-teal-500/5 p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">{format(today, 'EEEE, d MMMM yyyy')}</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500/60 mt-0.5 flex-shrink-0" />
            <p className="text-sm italic text-muted-foreground leading-relaxed">"{dailyQuote}"</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Active Cases"
            value="—"
            change="Coming soon"
            changeType="neutral"
            icon={Scale}
            iconColor="bg-emerald-500/10 text-emerald-600"
          />
          <StatCard
            title="Unbilled Hours"
            value="—"
            change="Coming soon"
            changeType="neutral"
            icon={Timer}
            iconColor="bg-teal-500/10 text-teal-600"
          />
          <StatCard
            title="Revenue This Month"
            value="—"
            change="Coming soon"
            changeType="neutral"
            icon={Receipt}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Upcoming Hearings"
            value="—"
            change="Coming soon"
            changeType="neutral"
            icon={CalendarDays}
            iconColor="bg-warning/10 text-warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            onClick={() => navigate('/legal-cases')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
          <Button variant="outline" onClick={() => navigate('/legal-time-tracking')} className="rounded-xl">
            <Timer className="h-4 w-4 mr-2" />
            Log Time
          </Button>
          <Button variant="outline" onClick={() => navigate('/legal-calendar')} className="rounded-xl">
            <CalendarDays className="h-4 w-4 mr-2" />
            Court Calendar
          </Button>
          <Button variant="outline" onClick={() => navigate('/legal-documents')} className="rounded-xl">
            <FolderOpen className="h-4 w-4 mr-2" />
            Documents
          </Button>
        </div>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600" />
                Recent Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No cases yet. Create your first case to get started with case management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-warning" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No upcoming deadlines. Add court dates and filing deadlines to stay organized.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
