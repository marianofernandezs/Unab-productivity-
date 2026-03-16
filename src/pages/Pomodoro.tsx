import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Play, Pause, RotateCcw, SkipForward, Coffee, BrainCircuit, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type Phase = 'work' | 'shortBreak' | 'longBreak';

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const CYCLES_BEFORE_LONG_BREAK = 4;

export default function Pomodoro() {
  const { projects, addPomodoro, pomodoros } = useStore();
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('work');
  const [cycle, setCycle] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handlePhaseComplete = () => {
    setIsRunning(false);
    playNotification();

    if (phase === 'work') {
      addPomodoro({ 
        projectId: selectedProjectId || null, 
        durationMinutes: 25 
      });

      if (cycle % CYCLES_BEFORE_LONG_BREAK === 0) {
        setPhase('longBreak');
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setPhase('shortBreak');
        setTimeLeft(SHORT_BREAK_TIME);
      }
    } else {
      // Break is over, back to work
      setPhase('work');
      setTimeLeft(WORK_TIME);
      if (phase === 'longBreak') {
        setCycle(prev => prev + 1); // Or reset cycle to 1? Usually it resets.
      } else {
        setCycle(prev => prev + 1);
      }
    }
  };

  const skipPhase = () => {
    setIsRunning(false);
    if (phase === 'work') {
      if (cycle % CYCLES_BEFORE_LONG_BREAK === 0) {
        setPhase('longBreak');
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setPhase('shortBreak');
        setTimeLeft(SHORT_BREAK_TIME);
      }
    } else {
      setPhase('work');
      setTimeLeft(WORK_TIME);
      setCycle(prev => prev + 1);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (phase === 'work') setTimeLeft(WORK_TIME);
    else if (phase === 'shortBreak') setTimeLeft(SHORT_BREAK_TIME);
    else setTimeLeft(LONG_BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    if (phase === 'work') return WORK_TIME;
    if (phase === 'shortBreak') return SHORT_BREAK_TIME;
    return LONG_BREAK_TIME;
  };

  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;
  const strokeDashoffset = 283 - (283 * progress) / 100;

  // Stats
  const todayPomodoros = pomodoros.filter(p => new Date(p.date).toDateString() === new Date().toDateString());
  const totalFocusHours = (pomodoros.reduce((acc, p) => acc + p.durationMinutes, 0) / 60).toFixed(1);

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-full flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500">
      
      {/* Left Column: Timer */}
      <div className="xl:w-2/3 flex flex-col gap-8">
        <div>
           <h1 className="text-4xl font-black text-foreground">Pomodoro</h1>
           <p className="text-muted-foreground mt-2 font-medium">Mantén el enfoque y gestiona tus tiempos de descanso.</p>
        </div>

        <div className="bg-card p-10 rounded-3xl border border-border shadow-xl flex flex-col items-center flex-1 justify-center relative overflow-hidden">
          
          <div className="flex gap-4 mb-12 p-1.5 bg-secondary/50 rounded-2xl">
            <button
              onClick={() => { setPhase('work'); setTimeLeft(WORK_TIME); setIsRunning(false); }}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${phase === 'work' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              Enfoque
            </button>
            <button
              onClick={() => { setPhase('shortBreak'); setTimeLeft(SHORT_BREAK_TIME); setIsRunning(false); }}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${phase === 'shortBreak' ? 'bg-green-500 text-white shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              Pausa Corta
            </button>
            <button
              onClick={() => { setPhase('longBreak'); setTimeLeft(LONG_BREAK_TIME); setIsRunning(false); }}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${phase === 'longBreak' ? 'bg-blue-500 text-white shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              Pausa Larga
            </button>
          </div>

          <div className="relative w-80 h-80 flex items-center justify-center mb-12 transform hover:scale-105 transition-transform duration-500">
            {/* Background Circle */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="var(--border)"
                strokeWidth="4"
              />
              {/* Progress Circle */}
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={phase === 'work' ? 'var(--primary)' : phase === 'shortBreak' ? '#22c55e' : '#3b82f6'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            <div className="flex flex-col items-center z-10">
              <span className="text-7xl font-sans font-black tracking-tighter text-foreground tabular-nums drop-shadow-sm">
                {formatTime(timeLeft)}
              </span>
              <div className="flex items-center gap-2 mt-4 text-muted-foreground font-medium">
                {phase === 'work' ? <BrainCircuit size={18} /> : <Coffee size={18} />}
                <span>
                  {phase === 'work' ? `Ciclo ${cycle}` : 'Descanso'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full bg-secondary border border-border text-foreground rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary appearance-none font-medium cursor-pointer"
            >
              <option value="">Sin proyecto asociado</option>
              {projects.filter(p => p.status !== 'completed').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-4 w-full">
              <button
                onClick={resetTimer}
                className="p-4 rounded-2xl bg-secondary text-muted-foreground hover:bg-muted-foreground/10 transition-colors flex-1 flex justify-center border border-border"
                title="Reiniciar"
              >
                <RotateCcw size={24} />
              </button>
              
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-4 rounded-2xl font-black text-white text-lg transition-transform hover:scale-105 active:scale-95 flex-[2] flex items-center justify-center gap-2 shadow-xl ${isRunning ? 'bg-destructive/90 shadow-destructive/20' : phase === 'work' ? 'bg-primary/90 shadow-primary/20' : 'bg-green-500/90 shadow-green-500/20'}`}
              >
                {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                {isRunning ? 'PAUSAR' : 'INICIAR'}
              </button>

              <button
                onClick={skipPhase}
                disabled={!isRunning && timeLeft === getTotalTime()}
                className="p-4 rounded-2xl bg-secondary text-muted-foreground hover:bg-muted-foreground/10 transition-colors flex-1 flex justify-center border border-border disabled:opacity-50"
                title="Saltar"
              >
                <SkipForward size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Stats & History */}
      <div className="xl:w-1/3 flex flex-col gap-6 pt-12 xl:pt-[104px]">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-5 rounded-2xl border border-border">
            <div className="text-3xl font-black text-foreground mb-1">{todayPomodoros.length}</div>
            <div className="text-sm font-medium text-muted-foreground">Pomodoros Hoy</div>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border">
            <div className="text-3xl font-black text-foreground mb-1">{totalFocusHours}h</div>
            <div className="text-sm font-medium text-muted-foreground">Horas de Foco Total</div>
          </div>
        </div>

        {/* History */}
        <div className="bg-card p-6 flex-1 rounded-2xl border border-border flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-foreground">
            <History size={20} className="text-primary" />
            <h3 className="text-xl font-bold">Historial Reciente</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {pomodoros.length === 0 ? (
              <p className="text-muted-foreground text-center mt-10">Todavía no has completado ninguna sesión.</p>
            ) : (
              [...pomodoros].reverse().slice(0, 15).map(p => {
                const proj = projects.find(project => project.id === p.projectId);
                return (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/50 border border-border border-transparent hover:border-border transition-colors">
                    <div>
                      <p className="font-bold text-foreground">{proj?.name || 'Misión general'}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">
                        {format(parseISO(p.date), 'dd MMM, HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold text-sm">
                      <BrainCircuit size={14} />
                      {p.durationMinutes}m
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
