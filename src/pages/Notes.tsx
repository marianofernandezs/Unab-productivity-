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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">Notas Rápidas</h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm md:text-base">Guarda ideas, enlaces y recordatorios puntuales.</p>
        </div>
        
        <button 
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/30 w-full sm:w-auto hover:-translate-y-0.5"
        >
          <Plus size={20} /> Nueva Nota
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-card rounded-2xl border border-border shadow-sm mb-6 md:mb-8 overflow-hidden">
        {/* Search row */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="text-muted-foreground shrink-0" size={18} />
          <input
            type="text"
            placeholder="Buscar en título o contenido..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 pl-3 pr-2 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-medium text-sm"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Filter className="text-muted-foreground shrink-0" size={16} />

          {/* Tag filter */}
          <div className="flex items-center gap-1.5 border-r border-border pr-4">
            <select
              value={selectedTag || ''}
              onChange={e => setSelectedTag(e.target.value || null)}
              className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="">Todas las etiquetas</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Tag size={14} className="text-muted-foreground opacity-50 shrink-0" />
          </div>

          {/* Color filter */}
          <div className="flex gap-1.5 items-center flex-wrap">
            <button
              onClick={() => setSelectedColor(null)}
              className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center text-[9px] font-bold uppercase ${selectedColor === null ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border text-muted-foreground hover:scale-110'}`}
              title="Todos los colores"
            >
              All
            </button>
            {palette.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${selectedColor === c ? 'scale-110' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: c, borderColor: selectedColor === c ? 'var(--foreground)' : 'transparent' }}
                title={`Filtrar por color`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-card rounded-3xl border-2 border-dashed border-border text-center max-w-2xl mx-auto min-h-[280px] sm:min-h-[400px]">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Plus size={32} className="text-orange-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No se encontraron notas</h3>
            <p className="text-muted-foreground text-base mb-6 max-w-md">Crea una nota o ajusta los filtros.</p>
            {notes.length === 0 && (
              <button 
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full hover:scale-105 transition-all font-bold shadow-lg shadow-orange-500/30"
              >
                <Plus size={20} /> Escribir mi primera nota
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5 pb-12">
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
