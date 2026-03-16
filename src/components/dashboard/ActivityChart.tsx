import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useStore } from '../../store';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ActivityChart() {
  const tasks = useStore(state => state.tasks);

  // Generate last 7 days data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    
    const completedTasks = tasks.filter(t => 
      t.status === 'completed' && t.completedAt && isSameDay(parseISO(t.completedAt), date)
    ).length;

    return {
      name: format(date, 'EEE', { locale: es }),
      completadas: completedTasks
    };
  });

  return (
    <div className="bg-card p-6 rounded-2xl border border-border mt-8 h-80 flex flex-col hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-foreground mb-6">Actividad (Últimos 7 días)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: 'var(--accent-bg)' }}
              contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-h)' }}
            />
            <Bar dataKey="completadas" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
