import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import type { Note } from '../../types';
import { X, Tag } from 'lucide-react';

interface NoteFormProps {
  onClose: () => void;
  noteToEdit?: Note | null;
}

const COLORS = ['#fee2e2', '#ffedd5', '#fef3c7', '#dcfce7', '#e0f2fe', '#f3e8ff', '#fce7f3', '#f3f4f6'];
const DARK_COLORS = ['#7f1d1d', '#9a3412', '#92400e', '#14532d', '#0c4a6e', '#4c1d95', '#831843', '#1f2937'];

export default function NoteForm({ onClose, noteToEdit }: NoteFormProps) {
  const { addNote, updateNote, projects, isDarkMode } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(isDarkMode ? DARK_COLORS[0] : COLORS[0]);
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const palette = isDarkMode ? DARK_COLORS : COLORS;

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setColor(noteToEdit.color);
      setProjectId(noteToEdit.projectId || '');
      setTags(noteToEdit.tags || []);
    } else {
      setColor(palette[0]);
    }
  }, [noteToEdit, isDarkMode, palette]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (noteToEdit) {
      updateNote(noteToEdit.id, {
        title: title.trim(),
        content: content.trim(),
        color,
        projectId: projectId || null,
        tags
      });
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        color,
        projectId: projectId || null,
        tags
      });
    }
    onClose();
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl border border-black/10 flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mix-blend-difference">{noteToEdit ? 'Editar Nota' : 'Nueva Nota'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <X size={20} className="text-foreground mix-blend-difference" />
          </button>
        </div>

        <form id="note-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <input 
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full bg-transparent text-xl sm:text-2xl font-bold placeholder-black/40 outline-none text-foreground mix-blend-difference"
          />
          
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="w-full bg-transparent text-base sm:text-lg min-h-[120px] sm:min-h-[160px] resize-none placeholder-black/40 outline-none flex-1 text-foreground mix-blend-difference leading-relaxed"
          />

          <div className="flex items-start gap-2 mt-1">
            <Tag size={15} className="text-foreground mix-blend-difference opacity-50 mt-1 shrink-0" />
            <div className="flex flex-wrap gap-2 flex-1">
              {tags.map(t => (
                <span key={t} className="px-2 py-1 bg-black/10 rounded-md text-xs font-semibold flex items-center gap-1 text-foreground mix-blend-difference">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input 
                type="text"
                value={currentTag}
                onChange={e => setCurrentTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                onBlur={addTag}
                placeholder="Añadir etiqueta"
                className="bg-transparent text-sm w-28 placeholder-black/40 outline-none text-foreground mix-blend-difference"
              />
            </div>
          </div>

          <div className="mt-3 pt-4 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-foreground mix-blend-difference opacity-70 mb-1.5">Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {palette.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${color === c ? 'scale-125 ring-2 ring-black/30 ring-offset-1' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-foreground mix-blend-difference opacity-70 mb-1.5">Proyecto (Opcional)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-black/5 border border-black/10 rounded-lg px-3 py-1.5 text-sm outline-none text-foreground mix-blend-difference cursor-pointer"
              >
                <option value="">Ninguno</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-black/10 flex justify-end gap-3 bg-black/5 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-foreground font-semibold hover:bg-black/10 transition-colors mix-blend-difference text-sm">Cancelar</button>
          <button type="submit" form="note-form" className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all active:scale-95 shadow-primary/20 text-sm">Guardar</button>
        </div>
      </div>
    </div>
  );
}
