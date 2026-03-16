import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Clock, StickyNote, Moon, Sun, Download } from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { isDarkMode, toggleDarkMode, projects, tasks, pomodoros, notes } = useStore();

  const handleExport = () => {
    const data = { projects, tasks, pomodoros, notes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'productivity-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <CheckSquare size={20} /> },
    { name: 'Pomodoro', path: '/pomodoro', icon: <Clock size={20} /> },
    { name: 'Notes', path: '/notes', icon: <StickyNote size={20} /> },
  ];

  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col transition-colors duration-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>Produc</span>
          <span className="text-foreground">App</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          <Download size={20} />
          <span className="font-medium">Export Data</span>
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </div>
  );
}
