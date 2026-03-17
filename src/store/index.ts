import { create } from 'zustand';
import type { AppState, Project, Task, PomodoroSession, Note, UserActivity } from '../types';
import { supabase } from '../lib/supabase';

// Helper to generate IDs for optimistic updates
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  (set, get) => ({
    userName: 'Usuario',
    isDarkMode: false,
    session: null,
    projects: [],
    tasks: [],
    pomodoros: [],
    notes: [],
    activityFeed: [],

    fetchData: async () => {
      const session = get().session;
      if (!session) return;
      const userId = session.user.id;

      // Fetch Profile
      const { data: profile } = await supabase
        .from('unbpd_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        set({ userName: profile.user_name, isDarkMode: profile.is_dark_mode });
      }

      // Fetch Projects
      const { data: projectsData } = await supabase.from('unbpd_projects').select('*').order('created_at', { ascending: false });
      
      // Fetch Tasks
      const { data: tasksData } = await supabase.from('unbpd_tasks').select('*').order('order', { ascending: true });
      
      // Fetch Pomodoros
      const { data: pomodorosData } = await supabase.from('unbpd_pomodoros').select('*').order('date', { ascending: true });
      
      // Fetch Notes
      const { data: notesData } = await supabase.from('unbpd_notes').select('*').order('updated_at', { ascending: false });
      
      // Fetch Activity Feed
      const { data: activityData } = await supabase.from('unbpd_user_activity').select('*').order('date', { ascending: false }).limit(50);

      // Map Supabase snake_case back to camelCase types
      set({
        projects: (projectsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          deadline: p.deadline,
          status: p.status,
          color: p.color,
          createdAt: p.created_at
        })),
        tasks: (tasksData || []).map((t: any) => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          status: t.status,
          order: t.order,
          createdAt: t.created_at,
          completedAt: t.completed_at
        })),
        pomodoros: (pomodorosData || []).map((p: any) => ({
          id: p.id,
          date: p.date,
          projectId: p.project_id,
          durationMinutes: p.duration_minutes
        })),
        notes: (notesData || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          color: n.color,
          tags: n.tags || [],
          projectId: n.project_id,
          createdAt: n.created_at,
          updatedAt: n.updated_at
        })),
        activityFeed: (activityData || []).map((a: any) => ({
          id: a.id,
          type: a.type as any,
          description: a.description,
          date: a.date
        }))
      });
    },

    setUserName: async (name) => {
      set({ userName: name });
      const session = get().session;
      if (session) {
        await supabase.from('unbpd_profiles').upsert({ id: session.user.id, user_name: name });
      }
    },

    setSession: (session) => {
      set({ session });
      if (!session) {
        // flush state on logout
        set({ projects: [], tasks: [], pomodoros: [], notes: [], activityFeed: [] });
      }
    },

    toggleDarkMode: async () => {
      const newMode = !get().isDarkMode;
      set({ isDarkMode: newMode });
      const session = get().session;
      if (session) {
         await supabase.from('unbpd_profiles').upsert({ id: session.user.id, is_dark_mode: newMode });
      }
    },

    logActivity: async (type, description) => {
      const session = get().session;
      if (!session) return;
      
      const newActivity: UserActivity = {
        id: generateId(), // Temp ID for optimistic
        type,
        description,
        date: new Date().toISOString(),
      };
      
      // Optimistic
      set((state) => ({ activityFeed: [newActivity, ...state.activityFeed].slice(0, 50) }));

      const { data } = await supabase.from('unbpd_user_activity').insert({
        user_id: session.user.id,
        type,
        description,
        date: newActivity.date
      }).select('id').single();

      if (data) {
        // Update temp Id with actual
        set(state => ({
          activityFeed: state.activityFeed.map(a => a.id === newActivity.id ? { ...a, id: data.id } : a)
        }));
      }
    },

    addProject: async (projectData) => {
      const session = get().session;
      if (!session) return;

      const newProject: Project = {
        ...projectData,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      
      set((state) => ({ projects: [...state.projects, newProject] }));
      get().logActivity('create_project', `Proyecto "${projectData.name}" creado.`);

      const { data, error } = await supabase.from('unbpd_projects').insert({
        user_id: session.user.id,
        name: projectData.name,
        description: projectData.description,
        deadline: projectData.deadline,
        status: projectData.status,
        color: projectData.color,
        created_at: newProject.createdAt
      }).select('id').single();

      if (data && !error) {
         set((state) => ({ projects: state.projects.map(p => p.id === newProject.id ? { ...p, id: data.id } : p) }));
      }
    },

    updateProject: async (id, updates) => {
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      }));

      await supabase.from('unbpd_projects').update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.deadline && { deadline: updates.deadline }),
        ...(updates.status && { status: updates.status }),
        ...(updates.color && { color: updates.color })
      }).eq('id', id);
    },

    deleteProject: async (id) => {
      const project = get().projects.find(p => p.id === id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        tasks: state.tasks.filter((t) => t.projectId !== id), // local cascade
      }));
      
      if (project) {
        get().logActivity('delete_project', `Proyecto "${project.name}" eliminado.`);
      }

      await supabase.from('unbpd_projects').delete().eq('id', id); // DB cascade handles tasks
    },

    addTask: async (taskData) => {
      const session = get().session;
      if (!session) return;

      const projectTasks = get().tasks.filter(t => t.projectId === taskData.projectId);
      const order = projectTasks.length > 0 ? Math.max(...projectTasks.map(t => t.order)) + 1 : 0;
      
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        order
      };
      
      set((state) => ({ tasks: [...state.tasks, newTask] }));

      const { data, error } = await supabase.from('unbpd_tasks').insert({
        user_id: session.user.id,
        project_id: newTask.projectId,
        title: newTask.title,
        status: newTask.status,
        "order": newTask.order,
        created_at: newTask.createdAt
      }).select('id').single();

      if (data && !error) {
        set((state) => ({ tasks: state.tasks.map(t => t.id === newTask.id ? { ...t, id: data.id } : t) }));
      }
    },

    updateTask: async (id, updates) => {
      const task = get().tasks.find(t => t.id === id);
      const isCompleted = updates.status === 'completed';
      const completedAt = isCompleted ? new Date().toISOString() : (task?.completedAt || null);

      if (task && isCompleted && task.status !== 'completed') {
        get().logActivity('complete_task', `Tarea "${task.title}" completada.`);
      }

      set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { 
          ...t, 
          ...updates,
          completedAt: isCompleted ? completedAt as string : undefined
        } : t)
      }));

      await supabase.from('unbpd_tasks').update({
        ...(updates.title && { title: updates.title }),
        ...(updates.status && { status: updates.status }),
        ...(isCompleted ? { completed_at: completedAt } : {})
      }).eq('id', id);
    },

    deleteTask: async (id) => {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      await supabase.from('unbpd_tasks').delete().eq('id', id);
    },

    reorderTasks: async (projectId, startIndex, endIndex) => {
      const projectTasks = get().tasks.filter(t => t.projectId === projectId).sort((a,b) => a.order - b.order);
      const otherTasks = get().tasks.filter(t => t.projectId !== projectId);
      
      const [removed] = projectTasks.splice(startIndex, 1);
      projectTasks.splice(endIndex, 0, removed);
      
      // reassign order
      const updatedTasks = projectTasks.map((t, index) => ({ ...t, order: index }));
      
      set({
        tasks: [...otherTasks, ...updatedTasks]
      });

      // Update in background
      for (const t of updatedTasks) {
        await supabase.from('unbpd_tasks').update({ "order": t.order }).eq('id', t.id);
      }
    },

    addPomodoro: async (sessionData) => {
      const session = get().session;
      if (!session) return;

      const newSession: PomodoroSession = {
        ...sessionData,
        id: generateId(),
        date: new Date().toISOString()
      };
      
      set((state) => ({ pomodoros: [...state.pomodoros, newSession] }));
      get().logActivity('pomodoro', `Sesión Pomodoro completada.`);

      const { data, error } = await supabase.from('unbpd_pomodoros').insert({
        user_id: session.user.id,
        project_id: newSession.projectId,
        duration_minutes: newSession.durationMinutes,
        date: newSession.date
      }).select('id').single();

      if (data && !error) {
        set((state) => ({ pomodoros: state.pomodoros.map(p => p.id === newSession.id ? { ...p, id: data.id } : p) }));
      }
    },

    addNote: async (noteData) => {
      const session = get().session;
      if (!session) return;

      const newNote: Note = {
        ...noteData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set((state) => ({ notes: [...state.notes, newNote] }));
      get().logActivity('create_note', `Nueva nota "${noteData.title}" creada.`);

      const { data, error } = await supabase.from('unbpd_notes').insert({
        user_id: session.user.id,
        project_id: newNote.projectId,
        title: newNote.title,
        content: newNote.content,
        color: newNote.color,
        tags: newNote.tags,
        created_at: newNote.createdAt,
        updated_at: newNote.updatedAt
      }).select('id').single();

      if (data && !error) {
        set((state) => ({ notes: state.notes.map(n => n.id === newNote.id ? { ...n, id: data.id } : n) }));
      }
    },

    updateNote: async (id, updates) => {
      const updatedAt = new Date().toISOString();
      set((state) => ({
        notes: state.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt } : n)
      }));

      await supabase.from('unbpd_notes').update({
        ...(updates.title && { title: updates.title }),
        ...(updates.content && { content: updates.content }),
        ...(updates.color && { color: updates.color }),
        ...(updates.projectId !== undefined && { project_id: updates.projectId }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        updated_at: updatedAt
      }).eq('id', id);
    },

    deleteNote: async (id) => {
      const note = get().notes.find(n => n.id === id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      }));
      
      if (note) {
        get().logActivity('delete_note', `Nota "${note.title}" eliminada.`);
      }

      await supabase.from('unbpd_notes').delete().eq('id', id);
    },
  })
);
