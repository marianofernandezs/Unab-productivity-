import type { Project } from '../../types';
import { useStore } from '../../store';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onClick: () => void;
}

export default function ProjectCard({ project, onEdit, onClick }: ProjectCardProps) {
  const { tasks, deleteProject, updateProject } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const completedTasks = projectTasks.filter(t => t.status === 'completed');
  const progress = projectTasks.length === 0 ? 0 : Math.round((completedTasks.length / projectTasks.length) * 100);

  const daysLeft = differenceInDays(parseISO(project.deadline), new Date());
  const isOverdue = daysLeft < 0 && project.status !== 'completed';
  const isCritical = daysLeft <= 3 && daysLeft >= 0 && project.status !== 'completed';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán todas sus tareas.')) {
      deleteProject(project.id);
    }
    setShowMenu(false);
  };

  const handleChangeStatus = (e: React.MouseEvent, newStatus: Project['status']) => {
    e.stopPropagation();
    if (newStatus === 'completed' && projectTasks.length > 0 && progress < 100) {
      alert('No puedes completar un proyecto con tareas pendientes.');
      setShowMenu(false);
      return;
    }
    updateProject(project.id, { status: newStatus });
    setShowMenu(false);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-card p-5 rounded-2xl border border-border group hover:shadow-lg transition-all cursor-pointer relative animate-in fade-in"
    >
      <div 
        className="absolute top-0 left-0 w-full h-2 rounded-t-2xl opacity-80"
        style={{ backgroundColor: project.color }}
      />
      
      <div className="flex justify-between items-start mt-2">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-xl font-bold text-foreground truncate">{project.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1 min-h-[40px]">
            {project.description || 'Sin descripción'}
          </p>
        </div>
        
        <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-48 bg-card border border-border rounded-xl shadow-xl p-1 z-20 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(project); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg"
              >
                <Edit2 size={16} /> Editar
              </button>
              
              <div className="h-px bg-border my-1 mx-2" />
              
              <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cambiar Estado</div>
              <button onClick={(e) => handleChangeStatus(e, 'active')} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-secondary rounded-lg">Activo</button>
              <button onClick={(e) => handleChangeStatus(e, 'on-hold')} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-secondary rounded-lg">En Pausa</button>
              <button onClick={(e) => handleChangeStatus(e, 'completed')} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-secondary rounded-lg">Completado</button>
              
              <div className="h-px bg-border my-1 mx-2" />
              
              <button 
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${project.status === 'completed' ? 'border-green-500/30 text-green-600 bg-green-500/10' : project.status === 'on-hold' ? 'border-orange-500/30 text-orange-600 bg-orange-500/10' : 'border-blue-500/30 text-blue-600 bg-blue-500/10'}`}>
          {project.status === 'completed' ? 'Completado' : project.status === 'on-hold' ? 'En Pausa' : 'Activo'}
        </span>
        
        {project.status !== 'completed' && (
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${isOverdue ? 'border-destructive/30 text-destructive bg-destructive/10' : isCritical ? 'border-orange-500/30 text-orange-600 bg-orange-500/10' : 'border-border text-foreground bg-secondary'}`}>
            <Clock size={12} />
            {isOverdue ? 'Vencido' : `${format(parseISO(project.deadline), 'd MMM', { locale: es })}`}
          </span>
        )}
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-medium text-muted-foreground">Progreso</span>
          <span className="text-sm font-bold text-foreground">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: project.color }}
          />
        </div>
      </div>
    </div>
  );
}
