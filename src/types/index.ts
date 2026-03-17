export type ProjectStatus = 'active' | 'completed' | 'on-hold';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: ProjectStatus;
  color: string;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  date: string; // ISO String
  projectId: string | null;
  durationMinutes: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  type: 'create_project' | 'complete_task' | 'delete_note' | 'pomodoro' | 'create_note' | 'delete_project';
  description: string;
  date: string; // ISO String
}

export interface AppState {
  userName: string;
  isDarkMode: boolean;
  isSoundEnabled: boolean;
  projects: Project[];
  tasks: Task[];
  pomodoros: PomodoroSession[];
  notes: Note[];
  activityFeed: UserActivity[];
  session: any | null; // From supabase auth
  
  // Actions
  fetchData: () => Promise<void>;
  setUserName: (name: string) => void;
  setSession: (session: any | null) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (projectId: string, startIndex: number, endIndex: number) => void;
  
  // Pomodoro Actions
  addPomodoro: (session: Omit<PomodoroSession, 'id' | 'date'>) => void;
  
  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Utility
  logActivity: (type: UserActivity['type'], description: string) => void;
}
