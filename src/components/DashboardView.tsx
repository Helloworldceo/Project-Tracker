import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag,
  TrendingUp,
  Shield,
  Activity,
  ArrowUpRight,
  UserCheck,
  Calendar as CalendarIcon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Task, Milestone, User, Project } from '../types';

interface DashboardViewProps {
  project: Project;
  tasks: Task[];
  milestones: Milestone[];
  users: User[];
  onSelectTask: (task: Task) => void;
  onNavigateTab: (tab: any) => void;
  onNewTask: () => void;
  darkMode: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: '#94a3b8',
  todo: '#64748b',
  'in-progress': '#3b82f6',
  'in-review': '#8b5cf6',
  completed: '#10b981',
  blocked: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  completed: 'Completed',
  blocked: 'Blocked',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  tasks,
  milestones,
  users,
  onSelectTask,
  onNavigateTab,
  onNewTask,
  darkMode,
}) => {
  const now = new Date();

  // Metrics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  // Overdue and approaching deadlines
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    return new Date(t.dueDate).getTime() < now.getTime();
  });

  const dueSoonTasks = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const diffHours = (new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 3600);
    return diffHours >= 0 && diffHours <= 48;
  });

  const totalEstimatedHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((acc, t) => acc + (t.actualHours || 0), 0);

  // Status breakdown data for Recharts Pie
  const statusCounts: Record<string, number> = {
    backlog: 0,
    todo: 0,
    'in-progress': 0,
    'in-review': 0,
    completed: 0,
    blocked: 0,
  };
  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });

  const statusChartData = Object.keys(statusCounts).map((key) => ({
    name: STATUS_LABELS[key],
    value: statusCounts[key],
    color: STATUS_COLORS[key],
  })).filter(item => item.value > 0);

  // Team Workload bar data
  const teamWorkloadData = users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigneeIds.includes(user.id));
    const userCompleted = userTasks.filter((t) => t.status === 'completed').length;
    const userPending = userTasks.length - userCompleted;
    const hoursAssigned = userTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    return {
      name: user.name.split(' ')[0], // First name
      fullName: user.name,
      active: userPending,
      completed: userCompleted,
      hours: hoursAssigned,
    };
  });

  // Milestone Progress data for Recharts
  const milestoneChartData = milestones.map((m) => {
    const linkedTasks = tasks.filter((t) => t.milestoneId === m.id);
    const completed = linkedTasks.filter((t) => t.status === 'completed').length;
    const pct = linkedTasks.length > 0 ? Math.round((completed / linkedTasks.length) * 100) : m.progressPercentage;
    return {
      name: m.title.length > 20 ? `${m.title.substring(0, 18)}...` : m.title,
      progress: pct,
      tasks: linkedTasks.length,
    };
  });

  // Collect automated activities & status updates
  const recentActivities: {
    id: string;
    taskTitle: string;
    taskId: string;
    user: string;
    action: string;
    timestamp: string;
    type: string;
  }[] = [];

  tasks.forEach((task) => {
    task.activityLog?.forEach((act) => {
      recentActivities.push({
        id: act.id,
        taskTitle: task.title,
        taskId: task.id,
        user: act.user,
        action: act.action,
        timestamp: act.timestamp,
        type: act.type,
      });
    });
  });

  recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 pb-12">
      {/* Top Automated Status & Deadline Reminders Banner */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 shadow-xs dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Automated Deadline Alert System
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {overdueTasks.length > 0 && (
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {overdueTasks.length} task(s) overdue.
                    </span>
                  )}{' '}
                  {dueSoonTasks.length > 0 && (
                    <span>
                      {dueSoonTasks.length} task(s) due within the next 48 hours.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('calendar')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-50 dark:border-amber-800 dark:bg-neutral-800 dark:text-amber-200 dark:hover:bg-neutral-700 transition"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                View in Calendar
              </button>
              <button
                onClick={() => onNavigateTab('board')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 transition"
              >
                Manage in Board
              </button>
            </div>
          </div>

          {/* Quick list of urgent deadlines */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...overdueTasks, ...dueSoonTasks].slice(0, 3).map((task) => {
              const isOverdue = new Date(task.dueDate).getTime() < now.getTime();
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-amber-200/70 bg-white/80 p-2.5 shadow-2xs transition hover:border-amber-400 dark:border-neutral-800 dark:bg-neutral-900/80"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Due: {task.dueDate} · {task.status.replace('-', ' ')}
                    </p>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {isOverdue ? 'Overdue' : 'Due Soon'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Progress Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Project Completion
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {completionRate}%
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              ({completedTasks.length}/{totalTasks} tasks)
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Active Workload Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              In-Flight Tasks
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {statusCounts['in-progress'] + statusCounts['in-review']}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              active in sprint
            </span>
          </div>
          <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            {statusCounts['in-progress']} in progress · {statusCounts['in-review']} in review
          </p>
        </div>

        {/* Team Capacity & Hours */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Hours Logged / Est.
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {totalActualHours}h
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              of {totalEstimatedHours}h estimated
            </span>
          </div>
          <p className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {users.length} team members active
          </p>
        </div>

        {/* Milestones Health Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Milestones Health
            </span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Flag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {milestones.filter((m) => m.status === 'completed').length}/{milestones.length}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              milestones reached
            </span>
          </div>
          <p className="mt-3 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Next deadline in 4 days
          </p>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Task Status Distribution (Donut Chart) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Task Status Breakdown
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Live distribution across sprint lifecycle
              </p>
            </div>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {totalTasks} Total
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#171717' : '#ffffff',
                    borderColor: darkMode ? '#262626' : '#e5e5e5',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {statusChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-600 dark:text-neutral-400 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload & Throughput (Bar Chart) */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Team Workload & Throughput
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Active tasks and estimated hours by member
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('team')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Full Team Metrics <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#262626' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: darkMode ? '#a3a3a3' : '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#a3a3a3' : '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#171717' : '#ffffff',
                    borderColor: darkMode ? '#262626' : '#e5e5e5',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="active" name="Active Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Milestones and Automated Status Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Milestones Progress Tracker */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Milestones & Key Deliverables
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Phase tracking and strategic timeline status
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('milestones')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Manage Milestones <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {milestones.map((m) => {
              const linkedTasks = tasks.filter((t) => t.milestoneId === m.id);
              const completed = linkedTasks.filter((t) => t.status === 'completed').length;
              const pct = linkedTasks.length > 0 ? Math.round((completed / linkedTasks.length) * 100) : m.progressPercentage;

              return (
                <div
                  key={m.id}
                  className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-800/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                          {m.title}
                        </h4>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            m.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : m.status === 'at-risk'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {m.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                        {m.description}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                      Due {m.dueDate} · {completed}/{linkedTasks.length} tasks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Automated Status Stream */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Automated Status Feed
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Real-time task transitions & audit logs
              </p>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live stream active" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">No recent status updates</p>
            ) : (
              recentActivities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    const t = tasks.find((item) => item.id === act.taskId);
                    if (t) onSelectTask(t);
                  }}
                  className="group cursor-pointer rounded-lg border border-neutral-100 bg-neutral-50/50 p-2.5 transition hover:border-neutral-300 dark:border-neutral-800/80 dark:bg-neutral-800/40 dark:hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">
                      {act.user}
                    </span>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">
                    {act.action}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate mt-1">
                    Task: {act.taskTitle}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
