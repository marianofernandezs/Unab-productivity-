import type { AppState } from '../types';

export interface ExportedProject {
  id: string;
  name: string;
  description: string;
  status: string;
  color: string;
  deadline: string;
  createdAt: string;
  progress: number;
  tasks: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    completedAt?: string;
  }[];
  relatedPomodoros: {
    id: string;
    date: string;
    durationMinutes: number;
  }[];
  relatedNotes: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface ExportData {
  exportedAt: string;
  summary: {
    totalProjects: number;
    totalTasks: number;
    totalCompletedTasks: number;
    totalPomodoros: number;
    totalFocusHours: number;
    totalNotes: number;
  };
  projects: ExportedProject[];
  generalNotes: ExportData['projects'][0]['relatedNotes'];
  generalPomodoros: ExportData['projects'][0]['relatedPomodoros'];
}

export function buildExportData(state: Pick<AppState, 'projects' | 'tasks' | 'pomodoros' | 'notes'>): ExportData {
  const { projects, tasks, pomodoros, notes } = state;

  const exportedProjects: ExportedProject[] = projects.map((p) => {
    const projectTasks = tasks.filter((t) => t.projectId === p.id);
    const completedTasks = projectTasks.filter((t) => t.status === 'completed');
    const progress = projectTasks.length === 0 ? 0 : Math.round((completedTasks.length / projectTasks.length) * 100);

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      color: p.color,
      deadline: p.deadline,
      createdAt: p.createdAt,
      progress,
      tasks: projectTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        createdAt: t.createdAt,
        ...(t.completedAt ? { completedAt: t.completedAt } : {}),
      })),
      relatedPomodoros: pomodoros
        .filter((pm) => pm.projectId === p.id)
        .map((pm) => ({ id: pm.id, date: pm.date, durationMinutes: pm.durationMinutes })),
      relatedNotes: notes
        .filter((n) => n.projectId === p.id)
        .map((n) => ({ id: n.id, title: n.title, content: n.content, tags: n.tags, createdAt: n.createdAt, updatedAt: n.updatedAt })),
    };
  });

  // Notes and pomodoros not linked to any project
  const projectIds = new Set(projects.map((p) => p.id));
  const generalNotes = notes
    .filter((n) => !n.projectId || !projectIds.has(n.projectId))
    .map((n) => ({ id: n.id, title: n.title, content: n.content, tags: n.tags, createdAt: n.createdAt, updatedAt: n.updatedAt }));
  const generalPomodoros = pomodoros
    .filter((pm) => !pm.projectId || !projectIds.has(pm.projectId))
    .map((pm) => ({ id: pm.id, date: pm.date, durationMinutes: pm.durationMinutes }));

  const totalFocusMinutes = pomodoros.reduce((acc, p) => acc + p.durationMinutes, 0);

  return {
    exportedAt: new Date().toISOString(),
    summary: {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalCompletedTasks: tasks.filter((t) => t.status === 'completed').length,
      totalPomodoros: pomodoros.length,
      totalFocusHours: parseFloat((totalFocusMinutes / 60).toFixed(2)),
      totalNotes: notes.length,
    },
    projects: exportedProjects,
    generalNotes,
    generalPomodoros,
  };
}

export function downloadJson(data: ExportData): void {
  const date = new Date().toISOString().split('T')[0];
  const filename = `productividad-export-${date}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
