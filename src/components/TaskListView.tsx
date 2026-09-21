import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Shield,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  CheckSquare,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, User } from '../types';

interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNewTask: () => void;
  searchQuery: string;
}

type SortField = 'dueDate' | 'priority' | 'status' | 'title';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  users,
  onSelectTask,
  onUpdateTaskStatus,
  onNewTask,
  searchQuery,
}) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const now = new Date();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'dueDate') {
      cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortField === 'priority') {
      cmp = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    } else if (sortField === 'status') {
      cmp = a.status.localeCompare(b.status);
    } else if (sortField === 'title') {
      cmp = a.title.localeCompare(b.title);
    }
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Tasks Directory ({sortedTasks.length})
        </h3>
        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400">
              <tr>
                <th className="py-3 pl-4 pr-2 w-10">Done</th>
                <th
                  onClick={() => handleSort('title')}
                  className="cursor-pointer py-3 px-3 hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Task Title <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="cursor-pointer py-3 px-3 hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="cursor-pointer py-3 px-3 hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Priority <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Assignees</th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="cursor-pointer py-3 px-3 hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Deadline <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Subtasks</th>
                <th className="py-3 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {sortedTasks.map((task) => {
                const isOverdue =
                  task.status !== 'completed' &&
                  new Date(task.dueDate).getTime() < now.getTime();
                const assignees = users.filter((u) => task.assigneeIds.includes(u.id));
                const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition group"
                  >
                    {/* Quick Complete Toggle */}
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={(e) =>
                          onUpdateTaskStatus(
                            task.id,
                            e.target.checked ? 'completed' : 'in-progress'
                          )
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 cursor-pointer"
                        aria-label={`Mark ${task.title} as completed`}
                      />
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        {task.isEncrypted && (
                          <span title="E2EE Encrypted">
                            <Shield className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          </span>
                        )}
                        <span
                          onClick={() => onSelectTask(task)}
                          className={`cursor-pointer font-medium hover:text-indigo-600 dark:hover:text-indigo-400 truncate ${
                            task.status === 'completed'
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="rounded border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 capitalize cursor-pointer"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="in-review">In Review</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold capitalize ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : task.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Assignees */}
                    <td className="py-3 px-3">
                      <div className="flex -space-x-1 overflow-hidden">
                        {assignees.map((u) => (
                          <div
                            key={u.id}
                            title={u.name}
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-1 ring-white dark:ring-neutral-900 ${u.avatarColor}`}
                          >
                            {u.avatarInitials}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Due date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`font-mono text-xs ${
                          isOverdue
                            ? 'font-bold text-rose-600 dark:text-rose-400'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {task.dueDate} {isOverdue && '(Overdue)'}
                      </span>
                    </td>

                    {/* Subtasks */}
                    <td className="py-3 px-3 whitespace-nowrap text-[11px] text-neutral-500">
                      {totalSubtasks > 0 ? (
                        <span>{completedSubtasks}/{totalSubtasks} done</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4 pl-2 text-right">
                      <button
                        onClick={() => onSelectTask(task)}
                        className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-neutral-800"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
