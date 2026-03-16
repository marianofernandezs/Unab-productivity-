import type { Note } from '../../types';
import { useStore } from '../../store';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit2, Trash2, FolderGit2 } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export default function NoteCard({ note, onEdit }: NoteCardProps) {
  const { deleteNote, projects } = useStore();

  const project = note.projectId ? projects.find(p => p.id === note.projectId) : null;

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      deleteNote(note.id);
    }
  };

  return (
    <div 
      className="rounded-2xl p-5 shadow-sm border border-black/5 relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ backgroundColor: note.color }}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button 
          onClick={() => onEdit(note)}
          className="p-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-foreground mix-blend-difference transition-colors backdrop-blur-sm"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={handleDelete}
          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors backdrop-blur-sm"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mb-3 pr-16 min-h-[30px]">
        {note.title && <h3 className="font-bold text-lg text-foreground mix-blend-difference leading-snug">{note.title}</h3>}
      </div>
      
      <p className="whitespace-pre-wrap text-foreground mix-blend-difference opacity-80 text-sm leading-relaxed max-w-full overflow-hidden text-ellipsis line-clamp-[8]">
        {note.content}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {note.tags.map(t => (
            <span key={t} className="px-2 py-0.5 bg-black/10 rounded-md text-[10px] font-bold text-foreground mix-blend-difference uppercase tracking-wider">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between text-xs text-foreground mix-blend-difference opacity-60 font-medium border-t border-black/10 pt-3">
        <span>{formatDistanceToNow(parseISO(note.updatedAt || note.createdAt), { addSuffix: true, locale: es })}</span>
        {project && (
          <span className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-md">
            <FolderGit2 size={12} />
            <span className="truncate max-w-[100px]">{project.name}</span>
          </span>
        )}
      </div>
    </div>
  );
}
