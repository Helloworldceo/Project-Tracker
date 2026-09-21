export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'completed' | 'blocked';

export type ViewTab = 'dashboard' | 'board' | 'list' | 'calendar' | 'milestones' | 'team';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  type: 'status_change' | 'assignment' | 'comment' | 'subtask' | 'automated';
}

export interface EncryptedPayload {
  cipher: string;
  iv: string;
  salt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  isEncrypted?: boolean;
  encryptedPayload?: EncryptedPayload;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeIds: string[];
  dueDate: string; // YYYY-MM-DD or ISO string
  estimatedHours: number;
  actualHours: number;
  subtasks: Subtask[];
  tags: string[];
  milestoneId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  activityLog: ActivityItem[];
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'at-risk';
  progressPercentage: number;
  associatedTaskIds: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarColor: string;
  avatarInitials: string;
  status: 'online' | 'busy' | 'away' | 'offline';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  color: string;
  memberIds: string[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'task_completed' | 'deadline_approaching' | 'task_overdue' | 'task_assigned' | 'milestone_reached' | 'sync_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
  projectId?: string;
  priority?: 'normal' | 'urgent';
}

export interface UserSettings {
  darkMode: boolean;
  lowBandwidthMode: boolean;
  e2eeEnabled: boolean;
  e2eePassphrase: string;
  notifyTaskCompleted: boolean;
  notifyDeadlineApproaching: boolean;
  notifyTaskOverdue: boolean;
  notifyTaskAssigned: boolean;
  notifySound: boolean;
  deadlineWarningHours: number; // e.g. 24 or 48 hours
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingMutationsCount: number;
  lastSyncedAt: string | null;
  latencyMs: number;
  bandwidthMode: 'normal' | 'low';
  e2eeLocked: boolean;
}

export interface QueuedMutation {
  id: string;
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'CREATE_MILESTONE' | 'UPDATE_MILESTONE';
  payload: any;
  timestamp: number;
}
