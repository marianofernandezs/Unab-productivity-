import { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { Project, ProjectStatus } from '../types';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import ProjectDetail from '../components/projects/ProjectDetail';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { parseISO } from 'date-fns';

type SortOption = 'deadline' | 'name' | 'progress';

export default function Projects() {
  const { projects, tasks } = useStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterState, setFilterState] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  const handleEdit = (p: Project) => {
    setProjectToEdit(p);
    setIsFormOpen(true);
  };
  
  const handleCreate = () => {
    setProjectToEdit(null);
    setIsFormOpen(true);
  };

  const calculateProgress = (projectId: string) => {
    const pt = tasks.filter(t => t.projectId === projectId);
    const completed = pt.filter(t => t.status === 'completed');
    return pt.length === 0 ? 0 : Math.round((completed.length / pt.length) * 100);
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (filterState !== 'all') {
      result = result.filter(p => p.status === filterState);
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'deadline') {
        return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
      } else {
        const progA = calculateProgress(a.id);
        const progB = calculateProgress(b.id);
        return progB - progA; // Descending
      }
    });

    return result;
  }, [projects, filterState, sortBy, tasks]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-2 font-medium">Gestiona y organiza todas tus iniciativas.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 border border-border p-2 rounded-2xl bg-card shadow-sm">
          <div className="flex items-center gap-2 pl-2 border-r border-border pr-4">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value as any)}
              className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="on-hold">En Pausa</option>
              <option value="completed">Completados</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 pl-2 border-r border-border pr-4">
            <ArrowUpDown size={18} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="deadline">Ordenar por Fecha límite</option>
              <option value="name">Ordenar por Nombre</option>
              <option value="progress">Ordenar por Progreso</option>
            </select>
          </div>

          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-bold shadow-md shadow-primary/20"
          >
            <Plus size={20} /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border-2 border-dashed border-border mt-8 text-center max-w-2xl mx-auto min-h-[400px]">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Plus size={40} className="text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No hay proyectos</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">No tienes proyectos en esta vista. Comienza creando un nuevo proyecto para organizar tu trabajo.</p>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:scale-105 transition-all font-bold shadow-lg shadow-primary/30 text-lg"
          >
            <Plus size={24} /> Crear mi primer proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProjects.map(p => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              onEdit={handleEdit} 
              onClick={() => setSelectedProject(p)} 
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProjectForm 
          onClose={() => setIsFormOpen(false)} 
          projectToEdit={projectToEdit}
        />
      )}

      {selectedProject && (
        <ProjectDetail 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
