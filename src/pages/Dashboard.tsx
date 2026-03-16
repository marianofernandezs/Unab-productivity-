import { useState } from 'react';
import Greeting from '../components/dashboard/Greeting';
import KPIs from '../components/dashboard/KPIs';
import ActivityChart from '../components/dashboard/ActivityChart';
import CriticalProjects from '../components/dashboard/CriticalProjects';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CompactPomodoro from '../components/dashboard/CompactPomodoro';

export default function Dashboard() {
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <Greeting />
        </div>
        <div className="bg-card p-1 rounded-xl border border-border inline-flex shrink-0 shadow-sm h-fit self-end md:self-auto h-[76px] items-center px-4">
          <div className="flex gap-2">
            {[
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mes' },
              { id: 'all', label: 'Todo' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as 'week' | 'month' | 'all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <KPIs filter={filter} />

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-8">
           <ActivityChart />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <CriticalProjects />
             <CompactPomodoro />
           </div>
        </div>
        
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col h-full min-h-[500px]">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
