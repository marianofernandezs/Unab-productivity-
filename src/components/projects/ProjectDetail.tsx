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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex py-0 md:py-6 px-0 md:px-4 justify-center items-end md:items-center overflow-hidden h-screen text-left">
      <div className="bg-background w-full max-w-5xl rounded-t-3xl md:rounded-3xl shadow-2xl border border-border flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative animate-in slide-in-from-bottom-8 duration-300 max-h-[92vh] md:max-h-[90vh]">
        
        {/* Close button (always visible top right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:bg-secondary p-2 rounded-full transition-colors z-20"
        >
          <X size={22} />
        </button>

        {/* Info Panel */}
        <div 
          className="w-full md:w-2/5 p-5 md:p-8 border-b md:border-b-0 md:border-r border-border shrink-0 flex flex-col relative"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${project.color}10, transparent)` }}
        >
          <div className="w-12 h-1.5 rounded-full mb-5" style={{ backgroundColor: project.color }} />
          
          <h2 className="text-2xl md:text-4xl font-black text-foreground mb-3 leading-tight pr-8">{project.name}</h2>
          
          <p className="text-muted-foreground leading-relaxed text-sm md:text-lg mb-6 bg-card/50 p-3 md:p-4 rounded-xl border border-border">
            {project.description || 'Sin descripción detallada.'}
          </p>
          
          <div className="space-y-3 md:space-y-4 mt-auto border-t border-border pt-5">
            {/* Deadline */}
            <div className="flex items-center gap-3 bg-card p-3 md:p-4 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Calendar className="text-orange-500" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Fecha Límite</p>
                <p className="font-bold text-foreground text-sm md:text-base">{format(parseISO(project.deadline), 'dd MMMM yyyy', { locale: es })}</p>
                <p className={`text-xs mt-0.5 font-bold ${daysLeft < 0 ? 'text-destructive' : 'text-blue-500'}`}>
                  {daysLeft < 0 ? '¡Vencido!' : `Quedan ${daysLeft} días`}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 bg-card p-3 md:p-4 rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Flag className="text-purple-500" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Estado</p>
                <p className="font-bold text-foreground capitalize text-sm md:text-base">
                  {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'En Pausa'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 bg-card p-3 md:p-4 rounded-2xl border border-border overflow-hidden relative">
              <div 
                className="absolute left-0 bottom-0 h-1 transition-all duration-1000"
                style={{ width: `${progress}%`, backgroundColor: project.color }}
              />
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Activity className="text-green-500" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Progreso</p>
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-foreground text-xl md:text-2xl">{progress}%</p>
                  <p className="text-xs text-muted-foreground font-medium">{completedTasks.length}/{projectTasks.length} tareas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="flex-1 bg-secondary/30 p-4 md:p-8 flex flex-col min-h-[300px] md:h-full md:overflow-hidden">
          <TaskList projectId={project.id} />
        </div>
        
      </div>
    </div>
  );
}
