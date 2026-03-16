import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Project, Task, PomodoroSession, Note, UserActivity } from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: 'Usuario',
      isDarkMode: false,
      projects: [],
      tasks: [],
      pomodoros: [],
      notes: [],
      activityFeed: [],

      setUserName: (name) => set({ userName: name }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      logActivity: (type, description) => {
        set((state) => {
          const newActivity: UserActivity = {
            id: generateId(),
            type,
            description,
            date: new Date().toISOString(),
          };
          // Keep only the last 50 activities as requested
          const updatedFeed = [newActivity, ...state.activityFeed].slice(0, 50);
          return { activityFeed: updatedFeed };
        });
      },

      addProject: (projectData) => {
        set((state) => {
          const newProject: Project = {
            ...projectData,
            id: generateId(),
            createdAt: new Date().toISOString()
          };
          return { projects: [...state.projects, newProject] };
        });
        get().logActivity('create_project', `Proyecto "${projectData.name}" creado.`);
      },

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),

      deleteProject: (id) => {
        const project = get().projects.find(p => p.id === id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id), // cascades delete tasks
        }));
        if (project) {
          get().logActivity('delete_project', `Proyecto "${project.name}" eliminado.`);
        }
      },

      addTask: (taskData) => {
        set((state) => {
          const projectTasks = state.tasks.filter(t => t.projectId === taskData.projectId);
          const order = projectTasks.length > 0 ? Math.max(...projectTasks.map(t => t.order)) + 1 : 0;
          
          const newTask: Task = {
            ...taskData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            order
          };
          return { tasks: [...state.tasks, newTask] };
        });
      },

      updateTask: (id, updates) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === id);
          if (task && updates.status === 'completed' && task.status !== 'completed') {
            get().logActivity('complete_task', `Tarea "${task.title}" completada.`);
          }
          const isCompleted = updates.status === 'completed';
          return {
            tasks: state.tasks.map((t) => t.id === id ? { 
              ...t, 
              ...updates,
              completedAt: isCompleted ? new Date().toISOString() : t.completedAt
            } : t)
          };
        });
      },

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      reorderTasks: (projectId, startIndex, endIndex) => {
        set((state) => {
          const projectTasks = state.tasks.filter(t => t.projectId === projectId).sort((a,b) => a.order - b.order);
          const otherTasks = state.tasks.filter(t => t.projectId !== projectId);
          
          const [removed] = projectTasks.splice(startIndex, 1);
          projectTasks.splice(endIndex, 0, removed);
          
          // reassign order
          const updatedTasks = projectTasks.map((t, index) => ({ ...t, order: index }));
          
          return {
            tasks: [...otherTasks, ...updatedTasks]
          };
        });
      },

      addPomodoro: (sessionData) => {
        set((state) => {
          const newSession: PomodoroSession = {
            ...sessionData,
            id: generateId(),
            date: new Date().toISOString()
          };
          return { pomodoros: [...state.pomodoros, newSession] };
        });
        get().logActivity('pomodoro', `Sesión Pomodoro completada.`);
      },

      addNote: (noteData) => {
        set((state) => {
          const newNote: Note = {
            ...noteData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return { notes: [...state.notes, newNote] };
        });
        get().logActivity('create_note', `Nueva nota "${noteData.title}" creada.`);
      },

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
      })),

      deleteNote: (id) => {
        const note = get().notes.find(n => n.id === id);
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id)
        }));
        if (note) {
          get().logActivity('delete_note', `Nota "${note.title}" eliminada.`);
        }
      },
    }),
    {
      name: 'productivity-storage',
    }
  )
);
