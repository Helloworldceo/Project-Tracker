import {
  Task,
  Milestone,
  Project,
  NotificationItem,
  UserSettings,
  QueuedMutation,
  SyncState,
  User,
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_MILESTONES,
  INITIAL_PROJECT,
  INITIAL_NOTIFICATIONS,
  DEFAULT_USER_SETTINGS,
  INITIAL_USERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  TASKS: 'nexus_tasks_v1',
  MILESTONES: 'nexus_milestones_v1',
  PROJECT: 'nexus_project_v1',
  NOTIFICATIONS: 'nexus_notifications_v1',
  SETTINGS: 'nexus_settings_v1',
  MUTATION_QUEUE: 'nexus_mutation_queue_v1',
  CURRENT_USER_ID: 'nexus_current_user_id_v1',
  LAST_SYNC: 'nexus_last_sync_v1',
};

export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load tasks from local storage', e);
  }
  return INITIAL_TASKS;
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save tasks to local storage', e);
  }
}

export function loadStoredMilestones(): Milestone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load milestones from local storage', e);
  }
  return INITIAL_MILESTONES;
}

export function saveStoredMilestones(milestones: Milestone[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  } catch (e) {
    console.warn('Failed to save milestones to local storage', e);
  }
}

export function loadStoredProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load project from local storage', e);
  }
  return INITIAL_PROJECT;
}

export function saveStoredProject(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
  } catch (e) {
    console.warn('Failed to save project to local storage', e);
  }
}

export const saveProjectToStorage = saveStoredProject;

export function loadStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load notifications from local storage', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.warn('Failed to save notifications to local storage', e);
  }
}

export function loadStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load settings from local storage', e);
  }
  return DEFAULT_USER_SETTINGS;
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to local storage', e);
  }
}

export const saveSettingsToStorage = saveStoredSettings;

export function getQueuedMutations(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MUTATION_QUEUE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to get mutation queue', e);
  }
  return [];
}

export const getPendingMutations = getQueuedMutations;

export function pushQueuedMutation(mutation: QueuedMutation): void {
  try {
    const current = getQueuedMutations();
    current.push(mutation);
    localStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to queue mutation', e);
  }
}

export function enqueueMutation(mut: Omit<QueuedMutation, 'id' | 'timestamp'>): void {
  const fullMutation: QueuedMutation = {
    ...mut,
    id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  pushQueuedMutation(fullMutation);
}

export function clearQueuedMutations(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MUTATION_QUEUE);
  } catch (e) {
    console.warn('Failed to clear mutation queue', e);
  }
}

export const clearPendingMutations = clearQueuedMutations;

export function loadCurrentUserId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (raw) return raw;
  } catch (e) {
    // fallback
  }
  return 'user-1';
}

export function saveCurrentUserId(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } catch (e) {
    // fallback
  }
}

/**
 * Loads entire combined initial state on app boot
 */
export function loadInitialProjectState() {
  const project = loadStoredProject();
  const tasks = loadStoredTasks();
  const milestones = loadStoredMilestones();
  const users = INITIAL_USERS;
  const currentUserId = loadCurrentUserId();
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const notifications = loadStoredNotifications();
  const settings = loadStoredSettings();
  const pendingMutations = getQueuedMutations();

  const syncState: SyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: new Date().toISOString(),
    pendingMutationsCount: pendingMutations.length,
    latencyMs: 35,
    bandwidthMode: settings.lowBandwidthMode ? 'low' : 'normal',
    e2eeLocked: false,
  };

  return {
    project,
    tasks,
    milestones,
    users,
    currentUser,
    notifications,
    settings,
    syncState,
  };
}

/**
 * Sync offline mutation queue with server
 */
export async function processOfflineQueue(): Promise<{ success: boolean; syncedCount: number }> {
  const queue = getQueuedMutations();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations: queue }),
    });

    if (response.ok) {
      clearQueuedMutations();
      return { success: true, syncedCount: queue.length };
    }
  } catch (e) {
    console.warn('Offline sync attempt failed, will retry when connection improves', e);
  }

  return { success: false, syncedCount: 0 };
}

/**
 * Analyze deadlines and trigger automated notifications and status flags
 */
export function checkAutomatedDeadlines(
  tasks: Task[],
  settings: UserSettings,
  existingNotifications: NotificationItem[]
): { updatedTasks: Task[]; newNotifications: NotificationItem[] } {
  const newAlerts: NotificationItem[] = [];
  const updatedTasks: Task[] = [...tasks];
  const now = new Date();
  const warningHours = settings.deadlineWarningHours || 48;

  tasks.forEach((task, idx) => {
    if (task.status === 'completed') return;

    const due = new Date(task.dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Overdue check
    if (diffHours < 0) {
      // Overdue alert check
      const alreadyNotified = existingNotifications.some(
        (n) =>
          n.taskId === task.id &&
          n.type === 'task_overdue' &&
          new Date().getTime() - new Date(n.timestamp).getTime() < 24 * 3600 * 1000
      );
      if (!alreadyNotified && settings.notifyTaskOverdue) {
        newAlerts.push({
          id: `auto-od-${task.id}-${Date.now()}`,
          type: 'task_overdue',
          title: `Deadline Passed: ${task.title}`,
          message: `Task is ${Math.abs(Math.round(diffHours / 24))} day(s) overdue! Immediate attention required.`,
          timestamp: new Date().toISOString(),
          read: false,
          taskId: task.id,
          projectId: task.projectId,
          priority: 'urgent',
        });
      }
    } else if (diffHours <= warningHours && diffHours >= 0) {
      // Approaching deadline check
      const alreadyNotified = existingNotifications.some(
        (n) =>
          n.taskId === task.id &&
          n.type === 'deadline_approaching' &&
          new Date().getTime() - new Date(n.timestamp).getTime() < 12 * 3600 * 1000
      );
      if (!alreadyNotified && settings.notifyDeadlineApproaching) {
        const hoursLeft = Math.max(1, Math.round(diffHours));
        newAlerts.push({
          id: `auto-dl-${task.id}-${Date.now()}`,
          type: 'deadline_approaching',
          title: `Upcoming Deadline: ${task.title}`,
          message: `Due in ${hoursLeft} hour(s). Status: "${task.status}".`,
          timestamp: new Date().toISOString(),
          read: false,
          taskId: task.id,
          projectId: task.projectId,
          priority: 'urgent',
        });
      }
    }
  });

  return {
    updatedTasks,
    newNotifications: newAlerts.length > 0 ? [...newAlerts, ...existingNotifications] : existingNotifications,
  };
}
