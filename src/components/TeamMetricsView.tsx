import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  TrendingUp,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { User, Task } from '../types';

interface TeamMetricsViewProps {
  users: User[];
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onReassignTask: (taskId: string, newAssigneeId: string) => void;
}

export const TeamMetricsView: React.FC<TeamMetricsViewProps> = ({
  users,
  tasks,
  onSelectTask,
  onReassignTask,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          Team Performance Metrics & Workload Allocation
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Monitor individual velocity, capacity balance, and reassign tasks directly
        </p>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const userTasks = tasks.filter((t) => t.assigneeIds.includes(user.id));
          const completedTasks = userTasks.filter((t) => t.status === 'completed');
          const activeTasks = userTasks.filter((t) => t.status !== 'completed');
          const totalEstimatedHours = userTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
          const totalActualHours = userTasks.reduce((acc, t) => acc + (t.actualHours || 0), 0);
          const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;

          // Capacity evaluation
          const isOverloaded = totalEstimatedHours > 35;
          const isOptimal = totalEstimatedHours >= 15 && totalEstimatedHours <= 35;

          return (
            <div
              key={user.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-800"
            >
              <div>
                {/* User Profile Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs ${user.avatarColor}`}
                  >
                    {user.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {user.name}
                      </h3>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          user.status === 'online'
                            ? 'bg-emerald-500'
                            : user.status === 'busy'
                            ? 'bg-amber-500'
                            : 'bg-neutral-400'
                        }`}
                        title={`Status: ${user.status}`}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {user.role}
                    </p>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {user.department}
                    </span>
                  </div>
                </div>

                {/* Performance Metrics Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800/60 text-center">
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                      Active
                    </span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {activeTasks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                      Done
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {completedTasks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                      Velocity
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {completionRate}%
                    </span>
                  </div>
                </div>

                {/* Capacity Status */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Allocated Hours: <strong className="text-neutral-800 dark:text-neutral-200">{totalEstimatedHours}h</strong>
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isOverloaded
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isOptimal
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {isOverloaded ? 'Heavy Load' : isOptimal ? 'Optimal' : 'Available'}
                  </span>
                </div>

                {/* Assigned Tasks List */}
                <div className="mt-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Current Assigned Tasks ({activeTasks.length})
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {activeTasks.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-2">No active tasks assigned</p>
                    ) : (
                      activeTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/70 p-2 text-xs transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/40"
                        >
                          <span
                            onClick={() => onSelectTask(task)}
                            className="truncate cursor-pointer font-medium text-neutral-800 hover:text-indigo-600 dark:text-neutral-200"
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                            {task.estimatedHours}h
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
