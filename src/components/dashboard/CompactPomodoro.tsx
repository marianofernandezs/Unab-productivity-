import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Play, Square, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompactPomodoro() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const addPomodoro = useStore(state => state.addPomodoro);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      addPomodoro({ projectId: null, durationMinutes: 25 });
      new Audio('/notification.mp3').play().catch(() => {});
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, addPomodoro]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="bg-card p-6 rounded-2xl border border-border flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
      <div 
        className="absolute bottom-0 left-0 bg-primary/10 h-1 transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%` }}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="text-purple-500" size={24} />
          <h3 className="text-xl font-bold text-foreground">Pomodoro Rápido</h3>
        </div>
        <button 
          onClick={() => navigate('/pomodoro')}
          className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Vista completa
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-2">
        <span className="text-4xl font-mono font-bold text-foreground tracking-tighter mb-4">
          {formatTime(timeLeft)}
        </span>
        
        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all text-white shadow-lg ${isRunning ? 'bg-destructive/90 hover:bg-destructive' : 'bg-primary/90 hover:bg-primary'}`}
          >
            {isRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
