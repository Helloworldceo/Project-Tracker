import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Filter,
} from 'lucide-react';
import { Task, User, Milestone } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  users: User[];
  milestones: Milestone[];
  onSelectTask: (task: Task) => void;
  onNewTaskWithDate: (dateString: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  users,
  milestones,
  onSelectTask,
  onNewTaskWithDate,
}) => {
  // Current calendar viewing month
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-09-01'));
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();
  // Total days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date('2026-09-21'));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter tasks by assignee if selected
  const filteredTasks = tasks.filter((t) => {
    if (selectedAssignee !== 'all' && !t.assigneeIds.includes(selectedAssignee)) {
      return false;
    }
    return true;
  });

  // Map tasks to dates
  const tasksByDate: Record<string, Task[]> = {};
  filteredTasks.forEach((t) => {
    if (!tasksByDate[t.dueDate]) {
      tasksByDate[t.dueDate] = [];
    }
    tasksByDate[t.dueDate].push(t);
  });

  // Calendar cells
  const calendarCells = [];
  // Blank days before 1st
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const todayStr = '2026-09-21';

  return (
    <div className="space-y-4 pb-12">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Interactive deadlines & delivery calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={today}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-neutral-300 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
            <button
              onClick={prevMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
            <button
              onClick={nextMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-xs font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400 py-2.5">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-200 border-b border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {calendarCells.map((dayNum, index) => {
            if (dayNum === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[110px] bg-neutral-50/50 p-2 dark:bg-neutral-950/40"
                />
              );
            }

            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dayString === todayStr;
            const dayTasks = tasksByDate[dayString] || [];
            const isPast = new Date(dayString).getTime() < new Date(todayStr).getTime();

            return (
              <div
                key={dayString}
                className={`group relative flex flex-col min-h-[110px] p-2 transition hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 ${
                  isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : isPast
                        ? 'text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Add task on this day button */}
                  <button
                    onClick={() => onNewTaskWithDate(dayString)}
                    title={`Schedule task on ${dayString}`}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Tasks Chips on this day */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-24 pr-0.5">
                  {dayTasks.map((task) => {
                    const isOverdue =
                      task.status !== 'completed' &&
                      new Date(task.dueDate).getTime() < new Date(todayStr).getTime();

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        title={`${task.title} - ${task.status}`}
                        className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium truncate flex items-center gap-1 transition ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 line-through dark:bg-emerald-950/80 dark:text-emerald-300'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 font-semibold dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900'
                        }`}
                      >
                        {task.isEncrypted && <Shield className="h-2.5 w-2.5 shrink-0" />}
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
