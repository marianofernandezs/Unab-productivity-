import { useState } from 'react';
import { useStore } from '../../store';
import type { Task } from '../../types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, GripVertical, Check, Trash2, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTaskItemProps {
  task: Task;
}

function SortableTaskItem({ task }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const { updateTask, deleteTask } = useStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  };

  const removeStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 items-center p-3 bg-secondary rounded-xl border border-border group hover:shadow-md transition-shadow">
      <div {...attributes} {...listeners} className="cursor-grab hover:bg-background p-1 rounded-md text-muted-foreground transition-colors group-hover:text-foreground">
        <GripVertical size={20} />
      </div>
      
      <button 
        onClick={toggleStatus}
        className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground hover:border-foreground'}`}
      >
        {task.status === 'completed' && <Check size={14} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(parseISO(task.createdAt), { addSuffix: true, locale: es })}
        </p>
      </div>

      <button 
        onClick={removeStatus} 
        className="text-muted-foreground hover:bg-destructive hover:text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-medium"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function TaskList({ projectId }: { projectId: string }) {
  const { tasks, reorderTasks, addTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const projectTasks = tasks.filter(t => t.projectId === projectId).sort((a,b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = projectTasks.findIndex(t => t.id === active.id);
      const newIndex = projectTasks.findIndex(t => t.id === over.id);
      reorderTasks(projectId, oldIndex, newIndex);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      projectId,
      title: newTaskTitle.trim(),
      status: 'todo'
    });
    setNewTaskTitle('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Tareas</h3>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium text-sm"
          >
            <Plus size={16} /> Nueva Tarea
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6 animate-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
            placeholder="Escribe la tarea y presiona Enter..."
          />
          <button type="submit" className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
            <Check size={20} />
          </button>
          <button type="button" onClick={() => { setIsAdding(false); setNewTaskTitle(''); }} className="p-2 bg-destructive text-white rounded-xl hover:bg-destructive/90 transition-colors">
            <X size={20} />
          </button>
        </form>
      )}

      {projectTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl bg-secondary/50">
          <p className="text-muted-foreground font-medium">No hay tareas creadas.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={projectTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {projectTasks.map(t => (
                <SortableTaskItem key={t.id} task={t} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
