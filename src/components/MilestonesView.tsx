import React, { useState } from 'react';
import {
  Flag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Milestone, Task, User } from '../types';

interface MilestonesViewProps {
  milestones: Milestone[];
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  milestones,
  tasks,
  users,
  onSelectTask,
  onAddMilestone,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-10-15');

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddMilestone({
      projectId: 'proj-nexus-v3',
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate,
      status: 'upcoming',
      progressPercentage: 0,
      associatedTaskIds: [],
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Project Milestones & Strategic Deliverables
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            High-level roadmap and progress tracking across all development phases
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Milestone
        </button>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone) => {
          const linkedTasks = tasks.filter((t) => t.milestoneId === milestone.id);
          const completedTasks = linkedTasks.filter((t) => t.status === 'completed');
          const progress = linkedTasks.length > 0
            ? Math.round((completedTasks.length / linkedTasks.length) * 100)
            : milestone.progressPercentage;

          const isOverdue = new Date(milestone.dueDate).getTime() < new Date('2026-09-21').getTime() && progress < 100;

          return (
            <div
              key={milestone.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-900"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                      <Flag className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {milestone.title}
                    </h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        milestone.status === 'completed' || progress === 100
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {progress === 100 ? 'Completed' : isOverdue ? 'At Risk' : milestone.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-2xl pl-9">
                    {milestone.description}
                  </p>
                </div>

                {/* Progress KPI */}
                <div className="flex items-center gap-4 pl-9 md:pl-0">
                  <div className="text-right">
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">
                      {progress}%
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {completedTasks.length} of {linkedTasks.length} tasks done
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono bg-neutral-100 px-2.5 py-1 rounded-lg dark:bg-neutral-800 dark:text-neutral-300">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Due {milestone.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Associated Tasks Section */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Linked Deliverable Tasks ({linkedTasks.length})
                </h4>
                {linkedTasks.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No tasks currently assigned to this milestone.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {linkedTasks.map((t) => {
                      const assignees = users.filter((u) => t.assigneeIds.includes(u.id));
                      return (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t)}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200/60 bg-neutral-50/50 p-2.5 transition hover:border-indigo-300 dark:border-neutral-800 dark:bg-neutral-800/40"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate text-xs font-medium text-neutral-900 dark:text-neutral-200 hover:text-indigo-600">
                              {t.title}
                            </p>
                            <span className="text-[10px] text-neutral-400 capitalize">
                              {t.status.replace('-', ' ')} · {t.dueDate}
                            </span>
                          </div>
                          <div className="flex -space-x-1 overflow-hidden shrink-0">
                            {assignees.map((u) => (
                              <div
                                key={u.id}
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${u.avatarColor}`}
                              >
                                {u.avatarInitials}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4">
              Add New Project Milestone
            </h3>
            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 5: Production Launch"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows={3}
                  placeholder="Key deliverables and strategic goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
