import { useStore } from '../../store';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FolderGit2, CheckCircle2, StickyNote, Clock, Trash2, Activity } from 'lucide-react';

export default function ActivityFeed() {
  const activityFeed = useStore(state => state.activityFeed);
  
  // Dashboard shows only top 10
  const recentFeed = activityFeed.slice(0, 10);

  const getIcon = (type: string) => {
    switch(type) {
      case 'create_project': return <FolderGit2 size={16} className="text-blue-500" />;
      case 'complete_task': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'create_note': return <StickyNote size={16} className="text-orange-500" />;
      case 'pomodoro': return <Clock size={16} className="text-purple-500" />;
      case 'delete_note':
      case 'delete_project': return <Trash2 size={16} className="text-destructive" />;
      default: return <Activity size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border flex flex-col hover:shadow-md transition-shadow h-full">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary" size={24} />
        <h3 className="text-xl font-bold text-foreground">Actividad Reciente</h3>
      </div>
      
      {recentFeed.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-muted-foreground">Aún no hay actividad.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {recentFeed.map(activity => (
            <div key={activity.id} className="flex gap-4 items-start relative before:absolute before:inset-0 before:left-[19px] before:w-px before:bg-border before:-z-10 last:before:hidden">
              <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 shadow-sm z-10">
                {getIcon(activity.type)}
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {formatDistanceToNow(parseISO(activity.date), { addSuffix: true, locale: es })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
