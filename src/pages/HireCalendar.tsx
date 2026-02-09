import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHireOrders, HireOrder, HireOrderItem } from '@/hooks/useHireOrders';
import { useEquipment } from '@/hooks/useEquipment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isWithinInterval,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingBar {
  orderId: string;
  orderNumber: string;
  equipmentName: string;
  status: string;
  startDate: Date;
  endDate: Date;
}

const statusBarColor: Record<string, string> = {
  active: 'bg-blue-500',
  overdue: 'bg-destructive',
  returned: 'bg-green-500',
  draft: 'bg-muted-foreground',
};

export default function HireCalendar() {
  const { orders, allOrderItems } = useHireOrders();
  const { equipment } = useEquipment();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(equipment.map(e => e.category));
    return ['all', ...Array.from(cats)];
  }, [equipment]);

  // Build booking bars
  const bookings = useMemo<BookingBar[]>(() => {
    const bars: BookingBar[] = [];
    const orderMap = new Map<string, HireOrder>();
    orders.forEach(o => orderMap.set(o.id, o));

    for (const item of allOrderItems) {
      const order = orderMap.get(item.hire_order_id);
      if (!order) continue;

      // Filter by category
      if (categoryFilter !== 'all' && item.equipment_item_id) {
        const eq = equipment.find(e => e.id === item.equipment_item_id);
        if (eq && eq.category !== categoryFilter) continue;
      }

      bars.push({
        orderId: order.id,
        orderNumber: order.order_number,
        equipmentName: item.equipment_name,
        status: order.status,
        startDate: parseISO(order.hire_start),
        endDate: parseISO(order.hire_end),
      });
    }
    return bars;
  }, [orders, allOrderItems, equipment, categoryFilter]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b =>
      isWithinInterval(day, { start: b.startDate, end: b.endDate })
    );
  };

  return (
    <DashboardLayout>
      <Header title="Availability Calendar" subtitle="Equipment booking overview" />
      <div className="p-4 md:p-6 space-y-4 pb-safe">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[160px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1"><div className="h-2.5 w-6 rounded bg-blue-500" /> Active</div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-6 rounded bg-destructive" /> Overdue</div>
          <div className="flex items-center gap-1"><div className="h-2.5 w-6 rounded bg-green-500" /> Returned</div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0 sm:p-2">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {days.map((day, idx) => {
                const dayBookings = getBookingsForDay(day);
                const inMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={idx}
                    className={cn(
                      'min-h-[70px] sm:min-h-[90px] border-b border-r p-1 text-xs transition-colors',
                      !inMonth && 'bg-muted/30 text-muted-foreground',
                      idx % 7 === 0 && 'border-l',
                    )}
                  >
                    <div className="font-medium mb-0.5">{format(day, 'd')}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayBookings.slice(0, 3).map((b, i) => (
                        <div
                          key={`${b.orderId}-${b.equipmentName}-${i}`}
                          className={cn(
                            'rounded px-1 py-0.5 text-white truncate text-[9px] sm:text-[10px] leading-tight',
                            statusBarColor[b.status] || 'bg-muted-foreground',
                          )}
                          title={`${b.orderNumber} — ${b.equipmentName}`}
                        >
                          <span className="hidden sm:inline">{b.equipmentName}</span>
                          <span className="sm:hidden">{b.orderNumber}</span>
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-[9px] text-muted-foreground pl-1">+{dayBookings.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
