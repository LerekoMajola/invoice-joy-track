import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { GraduationCap, Search, Loader2, MoreHorizontal, Eye, Trash2, Phone, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useStudents, Student } from '@/hooks/useStudents';
import { useSchoolClasses } from '@/hooks/useSchoolClasses';
import { useSchoolFees } from '@/hooks/useSchoolFees';
import { AddStudentDialog } from '@/components/school/AddStudentDialog';
import { StudentDetailDialog } from '@/components/school/StudentDetailDialog';

const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  graduated: 'bg-info/10 text-info border-info/20',
  withdrawn: 'bg-muted text-muted-foreground border-border',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

function StudentCard({
  student, className, onView, onDelete,
}: {
  student: Student; className: string; onView: () => void; onDelete: () => void;
}) {
  return (
    <div className="mobile-card animate-slide-up" onClick={onView}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-card-foreground">{student.firstName} {student.lastName}</p>
            <p className="text-xs text-muted-foreground">{student.admissionNumber} · {className}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[student.status])}>{student.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="h-4 w-4 mr-2" />Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {student.guardianPhone && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{student.guardianName} · {student.guardianPhone}</span>
        </div>
      )}
    </div>
  );
}

export default function Students() {
  const { students, isLoading, createStudent, deleteStudent } = useStudents();
  const { classes, currentTerm } = useSchoolClasses();
  const { getStudentBalance } = useSchoolFees();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();

  const getClassName = (classId: string | null) => classes.find((c) => c.id === classId)?.name || 'Unassigned';

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = search === '' || `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(search.toLowerCase());
      const matchesClass = filterClass === 'all' || s.classId === filterClass;
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, search, filterClass, filterStatus]);

  const handleDelete = (student: Student) => {
    openConfirmDialog({
      title: 'Remove Student',
      description: `Remove ${student.firstName} ${student.lastName} (${student.admissionNumber})? This cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Remove',
      action: async () => { await deleteStudent(student.id); if (detailOpen) setDetailOpen(false); },
    });
  };

  const activeCount = students.filter(s => s.status === 'active').length;

  const selectedFeeBalance = selectedStudent && currentTerm
    ? getStudentBalance(selectedStudent.id, currentTerm.id, selectedStudent.classId)
    : undefined;

  return (
    <DashboardLayout>
      <Header title="Students" subtitle="Manage student records" action={{ label: 'Add Student', onClick: () => setAddOpen(true) }} />

      <div className="p-4 md:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Students', value: students.length, color: 'text-primary' },
            { label: 'Active', value: activeCount, color: 'text-success' },
            { label: 'Classes', value: classes.length, color: 'text-info' },
            { label: 'Graduated', value: students.filter(s => s.status === 'graduated').length, color: 'text-muted-foreground' },
          ].map((stat, i) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 shadow-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn('text-xl font-display font-semibold mt-1', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">{students.length === 0 ? 'No students yet' : 'No matching students'}</p>
              <p className="text-sm">{students.length === 0 ? 'Add your first student to get started' : 'Try adjusting your filters'}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {filtered.map((s) => (
                <StudentCard key={s.id} student={s} className={getClassName(s.classId)}
                  onView={() => { setSelectedStudent(s); setDetailOpen(true); }}
                  onDelete={() => handleDelete(s)} />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Admission #</TableHead>
                    <TableHead className="font-semibold">Class</TableHead>
                    <TableHead className="font-semibold">Guardian</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s, i) => (
                    <TableRow key={s.id} className="animate-slide-up cursor-pointer hover:bg-muted/50" style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() => { setSelectedStudent(s); setDetailOpen(true); }}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{s.firstName} {s.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.admissionNumber}</TableCell>
                      <TableCell>{getClassName(s.classId)}</TableCell>
                      <TableCell className="text-muted-foreground">{s.guardianName || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', statusStyles[s.status])}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); setDetailOpen(true); }}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(s); }}><Trash2 className="h-4 w-4 mr-2" />Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <AddStudentDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={createStudent} classes={classes} />
      <StudentDetailDialog student={selectedStudent} open={detailOpen} onOpenChange={setDetailOpen} classes={classes}
        onDelete={(id) => { const s = students.find(st => st.id === id); if (s) handleDelete(s); }}
        feeBalance={selectedFeeBalance} />
      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => { if (!open) closeConfirmDialog(); }}
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant={confirmDialog.variant}
          confirmLabel={confirmDialog.confirmLabel}
          onConfirm={handleConfirm}
        />
      )}
    </DashboardLayout>
  );
}
