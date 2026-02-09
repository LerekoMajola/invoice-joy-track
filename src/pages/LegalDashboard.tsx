import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, Timer, CalendarDays, Receipt, Plus, FolderOpen, Clock, DollarSign, Briefcase, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardDateBanner } from '@/components/dashboard/DashboardDateBanner';
import { useLegalCases } from '@/hooks/useLegalCases';
import { useLegalTimeEntries } from '@/hooks/useLegalTimeEntries';
import { useLegalCalendar } from '@/hooks/useLegalCalendar';
import { useInvoices } from '@/hooks/useInvoices';
import { formatMaluti } from '@/lib/currency';
import { format, differenceInDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { LegalReports } from '@/components/legal/LegalReports';

const legalQuotes = [
  "Justice delayed is justice denied.",
  "Where there is a right, there is a remedy.",
  "Preparation is the key to success in the courtroom and in life.",
  "A lawyer's time and advice are their stock in trade.",
  "The law is reason, free from passion.",
  "Diligence is the mother of good luck.",
  "The first duty of society is justice.",
  "Every case is an opportunity to uphold the principles of justice.",
];

const statusColors: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
  closed: 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-emerald-500/10 text-emerald-600',
};

const eventTypeColors: Record<string, string> = {
  hearing: 'bg-purple-100 text-purple-700',
  deadline: 'bg-destructive/10 text-destructive',
  meeting: 'bg-blue-100 text-blue-700',
  filing: 'bg-teal-100 text-teal-700',
  other: 'bg-muted text-muted-foreground',
};

function getDeadlineColor(dateStr: string) {
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days <= 2) return 'text-destructive font-semibold';
  if (days <= 7) return 'text-amber-600 font-medium';
  return 'text-muted-foreground';
}

export default function LegalDashboard() {
  const navigate = useNavigate();
  const { cases, isLoading: casesLoading } = useLegalCases();
  const { entries, isLoading: entriesLoading } = useLegalTimeEntries();
  const { events, isLoading: eventsLoading } = useLegalCalendar();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const [showReports, setShowReports] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const stats = useMemo(() => {
    const activeCases = cases.filter(c => c.status === 'open' || c.status === 'in_progress').length;
    const unbilledHours = entries.filter(e => e.isBillable && !e.isInvoiced).reduce((sum, e) => sum + e.hours, 0);
    const revenueThisMonth = invoices
      .filter(i => i.status === 'paid' && i.date >= format(monthStart, 'yyyy-MM-dd') && i.date <= format(monthEnd, 'yyyy-MM-dd'))
      .reduce((sum, i) => sum + i.total, 0);
    const upcomingHearings = events.filter(e => e.eventType === 'hearing' && e.eventDate >= todayStr && !e.isCompleted).length;
    return { activeCases, unbilledHours, revenueThisMonth, upcomingHearings };
  }, [cases, entries, invoices, events, todayStr, monthStart, monthEnd]);

  const recentCases = useMemo(() => cases.slice(0, 5), [cases]);

  const upcomingDeadlines = useMemo(() =>
    events.filter(e => e.eventDate >= todayStr && !e.isCompleted).slice(0, 5),
    [events, todayStr]
  );

  const todayEntries = useMemo(() => {
    const filtered = entries.filter(e => e.date === todayStr);
    const totalHours = filtered.reduce((sum, e) => sum + e.hours, 0);
    return { filtered, totalHours };
  }, [entries, todayStr]);

  const financials = useMemo(() => {
    const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
    const unbilledValue = entries.filter(e => e.isBillable && !e.isInvoiced).reduce((sum, e) => sum + e.hours * e.hourlyRate, 0);
    return { outstanding, revenueThisMonth: stats.revenueThisMonth, unbilledValue };
  }, [invoices, entries, stats.revenueThisMonth]);

  const casesByStatus = useMemo(() => {
    const counts: Record<string, number> = { open: 0, in_progress: 0, on_hold: 0, closed: 0 };
    cases.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });
    return counts;
  }, [cases]);

  const caseLookup = useMemo(() => {
    const map: Record<string, string> = {};
    cases.forEach(c => { map[c.id] = c.title; });
    return map;
  }, [cases]);

  const isLoading = casesLoading || entriesLoading || eventsLoading || invoicesLoading;

  return (
    <DashboardLayout>
      <Header title="Dashboard" subtitle="Manage cases, track billable hours, and stay on top of deadlines." />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
        <DashboardDateBanner quotes={legalQuotes} theme="legal" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Active Cases" value={isLoading ? '—' : String(stats.activeCases)} change={isLoading ? '' : `${cases.length} total`} changeType="neutral" icon={Scale} iconColor="bg-emerald-500/10 text-emerald-600" />
          <StatCard title="Unbilled Hours" value={isLoading ? '—' : stats.unbilledHours.toFixed(1)} change={isLoading ? '' : 'billable, not invoiced'} changeType="neutral" icon={Timer} iconColor="bg-teal-500/10 text-teal-600" />
          <StatCard title="Revenue This Month" value={isLoading ? '—' : formatMaluti(stats.revenueThisMonth)} change={isLoading ? '' : format(today, 'MMMM yyyy')} changeType="positive" icon={Receipt} iconColor="bg-success/10 text-success" />
          <StatCard title="Upcoming Hearings" value={isLoading ? '—' : String(stats.upcomingHearings)} change={isLoading ? '' : 'scheduled'} changeType="neutral" icon={CalendarDays} iconColor="bg-warning/10 text-warning" />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600" onClick={() => navigate('/legal-cases')}>
            <Plus className="h-4 w-4 mr-2" />New Case
          </Button>
          <Button variant="outline" onClick={() => navigate('/legal-time-tracking')} className="rounded-xl"><Timer className="h-4 w-4 mr-2" />Log Time</Button>
          <Button variant="outline" onClick={() => navigate('/legal-calendar')} className="rounded-xl"><CalendarDays className="h-4 w-4 mr-2" />Court Calendar</Button>
          <Button variant="outline" onClick={() => navigate('/legal-documents')} className="rounded-xl"><FolderOpen className="h-4 w-4 mr-2" />Documents</Button>
          <Button variant={showReports ? 'default' : 'outline'} onClick={() => setShowReports(!showReports)} className="rounded-xl"><BarChart3 className="h-4 w-4 mr-2" />Reports</Button>
        </div>

        {showReports && <LegalReports cases={cases} entries={entries} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-600" />Recent Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cases yet. Create your first case to get started.</p>
              ) : (
                <div className="space-y-3">
                  {recentCases.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => navigate('/legal-cases')}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">{c.caseNumber}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[c.status] || statusColors.open}`}>{c.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm font-medium truncate">{c.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground capitalize">{c.caseType}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[c.priority] || ''}`}>{c.priority}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-warning" />Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[10px] px-1.5 py-0 ${eventTypeColors[e.eventType] || eventTypeColors.other}`}>{e.eventType}</Badge>
                          {e.caseId && caseLookup[e.caseId] && <span className="text-xs text-muted-foreground truncate">• {caseLookup[e.caseId]}</span>}
                        </div>
                        <p className="text-sm font-medium">{e.title}</p>
                      </div>
                      <span className={`text-xs whitespace-nowrap ml-3 ${getDeadlineColor(e.eventDate)}`}>{format(parseISO(e.eventDate), 'MMM d')}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-teal-600" />Today's Time Log</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-teal-600">{todayEntries.totalHours.toFixed(1)}h</span>
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => navigate('/legal-time-tracking')}><Plus className="h-3 w-3 mr-1" /> Log</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {todayEntries.filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">No time logged today.</p>
              ) : (
                <div className="space-y-2">
                  {todayEntries.filtered.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{e.description}</p>
                        <span className="text-xs text-muted-foreground">{caseLookup[e.caseId] || 'Unknown case'}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm font-semibold">{e.hours.toFixed(1)}h</span>
                        {e.isBillable && <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700">$</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-success" />Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                  <span className="text-sm text-muted-foreground">Outstanding Fees</span>
                  <span className="text-lg font-bold text-destructive">{formatMaluti(financials.outstanding)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5">
                  <span className="text-sm text-muted-foreground">Revenue This Month</span>
                  <span className="text-lg font-bold text-emerald-600">{formatMaluti(financials.revenueThisMonth)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5">
                  <span className="text-sm text-muted-foreground">Unbilled Value</span>
                  <span className="text-lg font-bold text-blue-600">{formatMaluti(financials.unbilledValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2"><Briefcase className="h-5 w-5 text-muted-foreground" />Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(casesByStatus).map(([status, count]) => (
                <div key={status} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusColors[status] || ''}`}>
                  <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
