import { useState, useEffect } from 'react';
import { Settings, Check, X } from 'lucide-react';
import { useStore } from '../../store';

export default function Greeting() {
  const { userName, setUserName } = useStore();
  const [greeting, setGreeting] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const handleSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    } else {
      setTempName(userName);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between bg-card p-4 sm:p-6 rounded-2xl shadow-sm border border-border gap-3">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2 w-full">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="text-xl sm:text-2xl font-bold bg-background border border-border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary w-full sm:w-64 text-foreground"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors">
                <Check size={20} />
              </button>
              <button onClick={() => { setIsEditing(false); setTempName(userName); }} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">
              {greeting}, <span className="text-primary">{userName}</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Aquí está el resumen de tu productividad.
            </p>
          </div>
        )}
      </div>
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 sm:p-3 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all shrink-0"
        >
          <Settings size={20} />
        </button>
      )}
    </div>
  );
}
