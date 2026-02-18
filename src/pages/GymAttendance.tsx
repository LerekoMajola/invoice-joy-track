import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGymAttendance } from '@/hooks/useGymAttendance';
import { useGymMembers } from '@/hooks/useGymMembers';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  UserCheck, Users, CalendarDays, TrendingUp,
  Search, LogIn, LogOut, CalendarIcon, Clock
} from 'lucide-react';

export default function GymAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const {
    attendance, isLoading, todayCheckins, currentlyInGym,
    weeklyCount, monthlyCount, checkIn, checkOut, isCheckingIn
  } = useGymAttendance(selectedDate);

  const { members } = useGymMembers();

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Filter active members for quick check-in search
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return (members || [])
      .filter(m => m.status === 'active')
      .filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.memberNumber?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [members, searchQuery]);

  // Check if member is already checked in today (no checkout)
  const isMemberCheckedIn = (memberId: string) =>
    attendance.some(a => a.member_id === memberId && !a.check_out);

  const stats = [
    { label: "Today's Check-ins", value: todayCheckins, icon: UserCheck, color: 'text-primary' },
    { label: 'Currently In Gym', value: currentlyInGym, icon: Users, color: 'text-green-600 dark:text-green-400' },
    { label: 'This Week', value: weeklyCount, icon: CalendarDays, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'This Month', value: monthlyCount, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <DashboardLayout>
      <Header title="Attendance" subtitle="Track member check-ins and visits" />

      <div className="p-4 md:p-6 space-y-5 pb-safe">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={cn('h-4 w-4', s.color)} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Check-in */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <LogIn className="h-4 w-4 text-primary" />
                Quick Check-in
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search member by name or number..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="pl-10"
              />
            </div>
            {showSearch && filteredMembers.length > 0 && (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {filteredMembers.map(m => {
                  const alreadyIn = isMemberCheckedIn(m.id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-muted-foreground">{m.memberNumber}</p>
                      </div>
                      {alreadyIn ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Already In
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => { checkIn(m.id); setSearchQuery(''); setShowSearch(false); }}
                          disabled={isCheckingIn}
                        >
                          <LogIn className="h-3.5 w-3.5 mr-1" />Check In
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {showSearch && searchQuery.trim() && filteredMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-3">No active members found</p>
            )}
          </CardContent>
        </Card>

        {/* Date Picker + Log */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            {isToday ? "Today's Log" : `Log for ${format(selectedDate, 'PPP')}`}
          </h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                {format(selectedDate, 'MMM d')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => d && setSelectedDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : attendance.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <UserCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No check-ins {isToday ? 'yet today' : 'on this date'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {attendance.map(record => {
              const member = record.gym_members;
              const isActive = !record.check_out;
              return (
                <Card key={record.id} className={cn(isActive && 'border-green-200 dark:border-green-800/50')}>
                  <CardContent className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                        isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'
                      )}>
                        {member?.first_name?.[0]}{member?.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member?.first_name} {member?.last_name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{member?.member_number}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(record.check_in), 'HH:mm')}</span>
                          {record.check_out && (
                            <>
                              <span>→</span>
                              <span>{format(new Date(record.check_out), 'HH:mm')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isActive && isToday ? (
                      <Button variant="outline" size="sm" onClick={() => checkOut(record.id)}>
                        <LogOut className="h-3.5 w-3.5 mr-1" />Out
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {record.check_out ? 'Done' : 'Active'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
