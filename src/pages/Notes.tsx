import { useState } from 'react';
import { useStore } from '../store';
import type { Note } from '../types';
import NoteForm from '../components/notes/NoteForm';
import NoteCard from '../components/notes/NoteCard';
import { Plus, Search, Tag, Filter } from 'lucide-react';

const COLORS = ['#fee2e2', '#ffedd5', '#fef3c7', '#dcfce7', '#e0f2fe', '#f3e8ff', '#fce7f3', '#f3f4f6'];
const DARK_COLORS = ['#7f1d1d', '#9a3412', '#92400e', '#14532d', '#0c4a6e', '#4c1d95', '#831843', '#1f2937'];

export default function Notes() {
  const { notes, isDarkMode } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  const palette = isDarkMode ? DARK_COLORS : COLORS;

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  const handleCreate = () => {
    setNoteToEdit(null);
    setIsFormOpen(true);
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = search.trim() === '' || 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesTag = !selectedTag || (n.tags && n.tags.includes(selectedTag));
    const matchesColor = !selectedColor || n.color === selectedColor;

    return matchesSearch && matchesTag && matchesColor;
  }).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full flex flex-col animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-foreground">Notas Rápidas</h1>
          <p className="text-muted-foreground mt-2 font-medium">Guarda ideas, enlaces y recordatorios puntuales.</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/30 w-full md:w-auto hover:-translate-y-1"
        >
          <Plus size={20} /> Nueva Nota
        </button>
      </div>

      <div className="bg-card p-2 rounded-2xl border border-border shadow-sm flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Buscar en título o contenido..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>
        
        <div className="w-px bg-border hidden lg:block" />
        
        <div className="flex gap-4 items-center px-4 py-2 lg:py-0 overflow-x-auto scroolbar-hide shrink-0">
          <Filter className="text-muted-foreground" size={18} />
          <div className="flex gap-2 items-center border-r border-border pr-6">
            <select
              value={selectedTag || ''}
              onChange={e => setSelectedTag(e.target.value || null)}
              className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer hover:bg-secondary py-1.5 px-3 rounded-lg w-32 truncate"
            >
              <option value="">Todas las etiquetas</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Tag size={16} className="text-muted-foreground opacity-50" />
          </div>

          <div className="flex gap-1 items-center pl-2 shrink-0">
            <button
              onClick={() => setSelectedColor(null)}
              className={`w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${selectedColor === null ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border text-muted-foreground hover:scale-110'}`}
              title="Cualquier color"
            >
              <b className="text-[10px] uppercase">All</b>
            </button>
            {palette.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === c ? 'scale-110' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: c, borderColor: selectedColor === c ? 'var(--foreground)' : 'transparent' }}
                title={`Filtrar por color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border-2 border-dashed border-border mt-8 text-center max-w-2xl mx-auto h-[400px]">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
              <Plus size={40} className="text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No se encontraron notas</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">No tienes notas creadas o ninguna coincide con los filtros aplicados.</p>
            {notes.length === 0 && (
              <button 
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:scale-105 transition-all font-bold shadow-lg shadow-orange-500/30 text-lg"
              >
                <Plus size={24} /> Escribir mi primera nota
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-12">
            {filteredNotes.map(n => (
              <div key={n.id} className="break-inside-avoid">
                <NoteCard note={n} onEdit={(note) => { setNoteToEdit(note); setIsFormOpen(true); }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <NoteForm onClose={() => setIsFormOpen(false)} noteToEdit={noteToEdit} />
      )}
    </div>
  );
}
