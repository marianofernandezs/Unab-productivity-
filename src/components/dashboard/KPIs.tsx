import { useStore } from '../../store';
import { 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  StickyNote,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subWeeks, subMonths, isToday, parseISO } from 'date-fns';

type DateFilter = 'week' | 'month' | 'all';

interface KPIProps {
  filter: DateFilter;
}

export default function KPIs({ filter }: KPIProps) {
  const { projects, tasks, pomodoros, notes } = useStore();

  const getDateRange = (f: DateFilter, offset: number = 0) => {
    const now = new Date();
    if (f === 'week') {
      const start = startOfWeek(subWeeks(now, offset), { weekStartsOn: 1 });
      const end = endOfWeek(subWeeks(now, offset), { weekStartsOn: 1 });
      return { start, end };
    }
    if (f === 'month') {
      const start = startOfMonth(subMonths(now, offset));
      const end = endOfMonth(subMonths(now, offset));
      return { start, end };
    }
    return null; // 'all'
  };

  const isCurrentPeriod = (isoDateString: string, f: DateFilter, offset: number = 0) => {
    if (!isoDateString) return false;
    if (f === 'all') return true;
    const range = getDateRange(f, offset);
    if (!range) return true;
    return isWithinInterval(parseISO(isoDateString), { start: range.start, end: range.end });
  };

  // KPI 1: Proyectos activos
  const activeProjects = projects.filter(p => p.status === 'active' && isCurrentPeriod(p.createdAt, filter));
  const prevActiveProjects = projects.filter(p => p.status === 'active' && isCurrentPeriod(p.createdAt, filter, 1));
  const activeProjectsDiff = activeProjects.length - prevActiveProjects.length;

  // KPI 2: Tareas completadas hoy (This is always "today" according to requirements, but we will filter by period if "all")
  // The requirement says "Tareas completadas hoy". 
  const tasksCompletedToday = tasks.filter(t => t.status === 'completed' && t.completedAt && isToday(parseISO(t.completedAt)));
  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 1);
  const tasksCompletedYesterday = tasks.filter(t => t.status === 'completed' && t.completedAt && isWithinInterval(parseISO(t.completedAt), { start: prevDate, end: prevDate }));
  const tasksDiff = tasksCompletedToday.length - tasksCompletedYesterday.length;

  // KPI 3: Horas de foco (Pomodoros de 25 min convertidos a horas) en el periodo
  const periodPomodoros = pomodoros.filter(p => isCurrentPeriod(p.date, filter));
  const prevPeriodPomodoros = pomodoros.filter(p => isCurrentPeriod(p.date, filter, 1));
  
  const focusHours = periodPomodoros.reduce((acc, p) => acc + p.durationMinutes, 0) / 60;
  const prevFocusHours = prevPeriodPomodoros.reduce((acc, p) => acc + p.durationMinutes, 0) / 60;
  const focusDiff = focusHours - prevFocusHours;

  // KPI 4: Notas creadas esta semana (o en el periodo actual)
  const periodNotes = notes.filter(n => isCurrentPeriod(n.createdAt, filter));
  const prevPeriodNotes = notes.filter(n => isCurrentPeriod(n.createdAt, filter, 1));
  const notesDiff = periodNotes.length - prevPeriodNotes.length;

  const kpis = [
    {
      title: 'Proyectos Activos',
      value: activeProjects.length,
      diff: activeProjectsDiff,
      unit: '',
      icon: <FolderGit2 size={24} className="text-blue-500" />,
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Tareas Completas Hoy',
      value: tasksCompletedToday.length,
      diff: tasksDiff,
      unit: '',
      icon: <CheckCircle2 size={24} className="text-green-500" />,
      bg: 'bg-green-500/10'
    },
    {
      title: 'Horas de Foco',
      value: focusHours.toFixed(1),
      diff: focusDiff,
      unit: 'h',
      icon: <Clock size={24} className="text-purple-500" />,
      bg: 'bg-purple-500/10'
    },
    {
      title: filter === 'week' ? 'Notas (Semana)' : filter === 'month' ? 'Notas (Mes)' : 'Total Notas',
      value: periodNotes.length,
      diff: notesDiff,
      unit: '',
      icon: <StickyNote size={24} className="text-orange-500" />,
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-card p-6 rounded-2xl border border-border flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
              {kpi.icon}
            </div>
            {kpi.diff !== 0 && filter !== 'all' && (
              <div className={`flex items-center gap-1 text-sm font-medium ${kpi.diff > 0 ? 'text-green-500' : 'text-destructive'}`}>
                {kpi.diff > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(kpi.diff)}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground">
              {kpi.value}{kpi.unit}
            </h3>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              {kpi.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
