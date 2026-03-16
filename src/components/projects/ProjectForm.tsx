import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import type { Project, ProjectStatus } from '../../types';
import { X } from 'lucide-react';

interface ProjectFormProps {
  onClose: () => void;
  projectToEdit?: Project | null;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#0ea5e9', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

export default function ProjectForm({ onClose, projectToEdit }: ProjectFormProps) {
  const { addProject, updateProject } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setDeadline(projectToEdit.deadline.split('T')[0]); // get YYYY-MM-DD
      setStatus(projectToEdit.status);
      setColor(projectToEdit.color);
    } else {
      setDeadline(new Date().toISOString().split('T')[0]);
    }
  }, [projectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (!deadline) {
      setError('La fecha límite es obligatoria.');
      return;
    }

    if (projectToEdit) {
      // Regla: Proyecto completado no puede tener tareas pendientes (handled down stream or ignore for now)
      updateProject(projectToEdit.id, {
        name,
        description,
        deadline: new Date(deadline).toISOString(),
        status,
        color
      });
    } else {
      addProject({
        name,
        description,
        deadline: new Date(deadline).toISOString(),
        status,
        color
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre *</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ej. Rediseño App"
            />
            {error && <p className="text-destructive text-sm mt-1 animate-in slide-in-from-top-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descripción</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none resize-none h-24"
              placeholder="Detalles del proyecto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha Límite *</label>
              <input 
                type="date" 
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground outline-none resize-none color-scheme-dark"
                style={{ colorScheme: 'dark light' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Estado</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-foreground outline-none"
              >
                <option value="active">Activo</option>
                <option value="on-hold">En Pausa</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-foreground' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm shadow-primary/20"
            >
              {projectToEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
