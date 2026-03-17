import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../../store';
import { Menu } from 'lucide-react';

export default function Layout() {
  const isDarkMode = useStore(state => state.isDarkMode);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans antialiased text-left transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-10 shadow-sm relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 -ml-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-primary flex items-center gap-1">
              <span>Produc</span>
              <span className="text-foreground">App</span>
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
