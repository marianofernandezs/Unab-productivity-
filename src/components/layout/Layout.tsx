import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../../store';
import { useEffect } from 'react';

export default function Layout() {
  const isDarkMode = useStore(state => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans antialiased text-left transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
