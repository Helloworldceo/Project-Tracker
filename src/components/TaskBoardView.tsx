import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Shield,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  User,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, User as UserType, Milestone } from '../types';

interface TaskBoardViewProps {
  tasks: Task[];
  users: UserType[];
  milestones: Milestone[];
  currentUser: UserType;
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onNewTaskWithStatus: (status: TaskStatus) => void;
  searchQuery: string;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; bgLight: string; bgDark: string }[] = [
  { id: 'backlog', label: 'Backlog', color: '#94a3b8', bgLight: 'bg-slate-50', bgDark: 'dark:bg-slate-900/30' },
  { id: 'todo', label: 'To Do', color: '#64748b', bgLight: 'bg-neutral-50', bgDark: 'dark:bg-neutral-900/30' },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6', bgLight: 'bg-blue-50/40', bgDark: 'dark:bg-blue-950/20' },
  { id: 'in-review', label: 'In Review', color: '#8b5cf6', bgLight: 'bg-purple-50/40', bgDark: 'dark:bg-purple-950/20' },
  { id: 'completed', label: 'Completed', color: '#10b981', bgLight: 'bg-emerald-50/40', bgDark: 'dark:bg-emerald-950/20' },
  { id: 'blocked', label: 'Blocked', color: '#ef4444', bgLight: 'bg-rose-50/40', bgDark: 'dark:bg-rose-950/20' },
];

const PRIORITY_BADGES: Record<TaskPriority, { label: string; style: string }> = {
  urgent: { label: 'Urgent', style: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900' },
  high: { label: 'High', style: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900' },
  medium: { label: 'Medium', style: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900' },
  low: { label: 'Low', style: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700' },
};

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  users,
  milestones,
  currentUser,
  onSelectTask,
  onUpdateTaskStatus,
  onToggleSubtask,
  onNewTaskWithStatus,
  searchQuery,
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [myTasksOnly, setMyTasksOnly] = useState<boolean>(false);

  const now = new Date();

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // My Tasks only filter
    if (myTasksOnly && !task.assigneeIds.includes(currentUser.id)) {
      return false;
    }

    // Assignee filter
    if (selectedAssignee !== 'all' && !task.assigneeIds.includes(selectedAssignee)) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    // Milestone filter
    if (selectedMilestone !== 'all' && task.milestoneId !== selectedMilestone) {
      return false;
    }

    return true;
  });

  const nextStatusMap: Record<TaskStatus, TaskStatus> = {
    backlog: 'todo',
    todo: 'in-progress',
    'in-progress': 'in-review',
    'in-review': 'completed',
    completed: 'in-progress',
    blocked: 'todo',
  };

  const prevStatusMap: Record<TaskStatus, TaskStatus> = {
    backlog: 'backlog',
    todo: 'backlog',
    'in-progress': 'todo',
    'in-review': 'in-progress',
    completed: 'in-review',
    blocked: 'in-progress',
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          {/* Quick My Tasks toggle */}
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              myTasksOnly
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            My Tasks Only
          </button>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Milestone Filter */}
          <select
            value={selectedMilestone}
            onChange={(e) => setSelectedMilestone(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Milestones</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          {(selectedAssignee !== 'all' || selectedPriority !== 'all' || selectedMilestone !== 'all' || myTasksOnly) && (
            <button
              onClick={() => {
                setSelectedAssignee('all');
                setSelectedPriority('all');
                setSelectedMilestone('all');
                setMyTasksOnly(false);
              }}
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border border-neutral-200/80 p-3 shadow-2xs dark:border-neutral-800 ${col.bgLight} ${col.bgDark} min-w-[260px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/60 dark:border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    {col.label}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-600 shadow-2xs dark:bg-neutral-800 dark:text-neutral-400">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onNewTaskWithStatus(col.id)}
                  className="rounded p-1 text-neutral-400 hover:bg-white hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition"
                  title={`Add task to ${col.label}`}
                  aria-label={`Add task to ${col.label}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[150px]">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300/80 p-6 text-center text-xs text-neutral-400 dark:border-neutral-700/60">
                    <span>No tasks</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue =
                      task.status !== 'completed' &&
                      new Date(task.dueDate).getTime() < now.getTime();
                    const priorityConfig = PRIORITY_BADGES[task.priority];

                    const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                    const totalSubtasks = task.subtasks?.length || 0;
                    const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                    const assignees = users.filter((u) => task.assigneeIds.includes(u.id));

                    return (
                      <div
                        key={task.id}
                        className={`group relative flex flex-col rounded-xl border bg-white p-3.5 shadow-xs transition hover:shadow-md dark:bg-neutral-900 ${
                          isOverdue
                            ? 'border-rose-400/80 ring-1 ring-rose-400/40 dark:border-rose-800 dark:ring-rose-800/40'
                            : 'border-neutral-200/80 hover:border-indigo-300 dark:border-neutral-800 dark:hover:border-indigo-800'
                        }`}
                      >
                        {/* Top: Priority & Badges */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${priorityConfig.style}`}
                          >
                            {priorityConfig.label}
                          </span>

                          <div className="flex items-center gap-1">
                            {task.isEncrypted && (
                              <span
                                title="End-to-End Encrypted (Zero-Knowledge)"
                                className="rounded bg-indigo-50 p-1 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                              >
                                <Shield className="h-3 w-3" />
                              </span>
                            )}
                            {isOverdue && (
                              <span
                                title="Task is overdue!"
                                className="rounded bg-rose-50 px-1 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                              >
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title (Clickable) */}
                        <h4
                          onClick={() => onSelectTask(task)}
                          className="cursor-pointer text-xs font-bold text-neutral-900 hover:text-indigo-600 dark:text-neutral-100 dark:hover:text-indigo-400 leading-snug line-clamp-2"
                        >
                          {task.title}
                        </h4>

                        {/* Subtasks Progress Pills */}
                        {totalSubtasks > 0 && (
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">
                              <span className="flex items-center gap-1 font-medium">
                                <CheckSquare className="h-3 w-3" />
                                {completedSubtasks}/{totalSubtasks} subtasks
                              </span>
                              <span>{subtaskProgress}%</span>
                            </div>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  subtaskProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${subtaskProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bottom: Due Date & Assignees */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                          <div
                            className={`flex items-center gap-1 text-[10px] font-medium ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{task.dueDate}</span>
                          </div>

                          {/* Assignee Avatars */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {assignees.map((user) => (
                              <div
                                key={user.id}
                                title={`${user.name} (${user.role})`}
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-1 ring-white dark:ring-neutral-900 ${user.avatarColor}`}
                              >
                                {user.avatarInitials}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Move Status Action Bar */}
                        <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-1.5 text-neutral-400 dark:border-neutral-800/60">
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, prevStatusMap[task.status])}
                            disabled={task.status === 'backlog'}
                            className="rounded p-1 text-[10px] hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-20 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                            title="Move back"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => onSelectTask(task)}
                            className="text-[10px] font-medium text-neutral-500 hover:text-indigo-600 dark:text-neutral-400"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => onUpdateTaskStatus(task.id, nextStatusMap[task.status])}
                            disabled={task.status === 'completed'}
                            className="rounded p-1 text-[10px] hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-20 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                            title="Move forward"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
