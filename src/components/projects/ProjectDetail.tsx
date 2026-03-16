import { useStore } from '../../store';
import type { Project } from '../../types';
import TaskList from './TaskList';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Calendar, Flag, Activity } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const { tasks } = useStore();
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const completedTasks = projectTasks.filter(t => t.status === 'completed');
  
  const progress = projectTasks.length === 0 ? 0 : Math.round((completedTasks.length / projectTasks.length) * 100);
  const daysLeft = differenceInDays(parseISO(project.deadline), new Date());
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex py-8 px-4 justify-center items-center overflow-hidden h-screen text-left">
      <div className="bg-background w-full max-w-5xl rounded-3xl shadow-2xl border border-border flex flex-col md:flex-row overflow-hidden relative animate-in slide-in-from-bottom-8 duration-300 max-h-[95vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:bg-secondary p-2 rounded-full transition-colors z-20 md:hidden"
        >
          <X size={24} />
        </button>

        {/* Info Panel */}
        <div 
          className="w-full md:w-2/5 p-8 border-r border-border shrink-0 flex flex-col relative overflow-y-auto"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${project.color}10, transparent)` }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:bg-foreground/10 p-2 rounded-full transition-colors z-20 hidden md:block"
          >
            <X size={24} />
          </button>
          
          <div className="w-16 h-2 rounded-full mb-6" style={{ backgroundColor: project.color }} />
          
          <h2 className="text-4xl font-black text-foreground mb-4 leading-tight">{project.name}</h2>
          
          <p className="text-muted-foreground leading-relaxed text-lg mb-8 bg-card/50 p-4 rounded-xl border border-border">
            {project.description || 'Sin descripción detallada.'}
          </p>
          
          <div className="space-y-6 mt-auto border-t border-border pt-6">
            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="text-orange-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha Límite</p>
                <p className="font-bold text-foreground">{format(parseISO(project.deadline), 'dd MMMM yyyy', { locale: es })}</p>
                <p className={`text-xs mt-0.5 font-bold ${daysLeft < 0 ? 'text-destructive' : 'text-blue-500'}`}>
                  {daysLeft < 0 ? '¡Vencido!' : `Quedan ${daysLeft} días`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Flag className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="font-bold text-foreground capitalize">
                  {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'En Pausa'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border overflow-hidden relative">
              <div 
                className="absolute left-0 bottom-0 h-1 transition-all duration-1000"
                style={{ width: `${progress}%`, backgroundColor: project.color }}
              />
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Activity className="text-green-500" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-foreground text-2xl">{progress}%</p>
                  <p className="text-xs text-muted-foreground font-medium">{completedTasks.length} de {projectTasks.length} tareas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="flex-1 bg-secondary/30 p-4 md:p-8 flex flex-col h-full overflow-hidden min-h-[500px]">
          <TaskList projectId={project.id} />
        </div>
        
      </div>
    </div>
  );
}
