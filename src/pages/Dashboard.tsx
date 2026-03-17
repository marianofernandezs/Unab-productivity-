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
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-5 md:space-y-8 animate-in fade-in duration-500">
      {/* Header: greeting + filter */}
      <div className="flex flex-col gap-4">
        <Greeting />
        <div className="bg-card p-1.5 rounded-2xl border border-border inline-flex shadow-sm h-fit items-center w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 w-full">
            {[
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mes' },
              { id: 'all', label: 'Todo' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as 'week' | 'month' | 'all')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === f.id ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <KPIs filter={filter} />

      {/* Main grid: chart + cards + feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-5 md:gap-8">
          <ActivityChart />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
            <CriticalProjects />
            <CompactPomodoro />
          </div>
        </div>

        <div className="lg:col-span-1 xl:col-span-1 flex flex-col min-h-[400px] lg:min-h-[500px]">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
