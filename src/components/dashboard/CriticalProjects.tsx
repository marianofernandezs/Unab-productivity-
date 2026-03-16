import { useStore } from '../../store';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CriticalProjects() {
  const projects = useStore(state => state.projects);

  const criticalProjects = projects
    .filter(p => p.status !== 'completed')
    .filter(p => {
      if (!p.deadline) return false;
      const daysLeft = differenceInDays(parseISO(p.deadline), new Date());
      return daysLeft <= 3;
    })
    .sort((a, b) => {
      const daysA = differenceInDays(parseISO(a.deadline), new Date());
      const daysB = differenceInDays(parseISO(b.deadline), new Date());
      return daysA - daysB;
    });

  return (
    <div className="bg-card p-6 rounded-2xl border border-border flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="text-destructive" size={24} />
        <h3 className="text-xl font-bold text-foreground">Proyectos Críticos</h3>
      </div>
      
      {criticalProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-green-500/5 rounded-xl border border-green-500/20">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
             <AlertCircle className="text-green-500" size={24} />
          </div>
          <p className="text-green-600 font-medium">¡Todo bajo control!</p>
          <p className="text-sm text-green-600/80">No hay proyectos que venzan pronto.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {criticalProjects.map(p => {
            const daysLeft = differenceInDays(parseISO(p.deadline), new Date());
            const isOverdue = daysLeft < 0;

            return (
              <div key={p.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isOverdue ? 'bg-destructive/5 border-destructive/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                <div>
                  <h4 className="font-semibold text-foreground truncate max-w-[200px]">{p.name}</h4>
                  <div className="flex items-center gap-1 text-sm mt-1 text-muted-foreground">
                    <Clock size={14} />
                    <span>Vence el {format(parseISO(p.deadline), 'dd MMM', { locale: es })}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isOverdue ? 'bg-destructive/20 text-destructive' : 'bg-orange-500/20 text-orange-600'}`}>
                  {isOverdue ? 'Vencido' : `${daysLeft} días`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
