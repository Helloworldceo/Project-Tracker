import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Shield,
  ShieldAlert,
  CheckSquare,
  Plus,
  Trash2,
  User,
  Tag,
  Flag,
  Activity,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, User as UserType, Milestone, Subtask } from '../types';
import { encryptText, decryptText } from '../utils/crypto';

interface TaskModalProps {
  task: Task | null; // null for creating new task
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  users: UserType[];
  milestones: Milestone[];
  currentUser: UserType;
  e2eePassphrase: string;
  initialStatus?: TaskStatus;
  initialDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  users,
  milestones,
  currentUser,
  e2eePassphrase,
  initialStatus = 'todo',
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [actualHours, setActualHours] = useState(0);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // When task changes, initialize state
  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setStatus(task.status);
      setAssigneeIds(task.assigneeIds || []);
      setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setEstimatedHours(task.estimatedHours || 0);
      setActualHours(task.actualHours || 0);
      setSubtasks(task.subtasks ? [...task.subtasks] : []);
      setTags(task.tags ? [...task.tags] : []);
      setMilestoneId(task.milestoneId || '');
      setIsEncrypted(!!task.isEncrypted);

      // Decrypt description if encrypted
      if (task.isEncrypted && task.encryptedPayload) {
        decryptText(task.encryptedPayload, e2eePassphrase)
          .then((decrypted) => {
            setDescription(decrypted);
            setDecryptError(null);
          })
          .catch((err) => {
            setDescription(task.description || '[Encrypted Content]');
            setDecryptError('Could not decrypt with current vault passphrase.');
          });
      } else {
        setDescription(task.description || '');
        setDecryptError(null);
      }
    } else {
      // New task defaults
      setTitle('');
      setDescription('');
      setIsEncrypted(false);
      setPriority('medium');
      setStatus(initialStatus);
      setAssigneeIds([currentUser.id]);
      setDueDate(initialDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setEstimatedHours(8);
      setActualHours(0);
      setSubtasks([]);
      setTags(['General']);
      setMilestoneId(milestones[0]?.id || '');
      setDecryptError(null);
    }
  }, [task, isOpen, initialStatus, initialDate, currentUser.id, e2eePassphrase, milestones]);

  if (!isOpen) return null;

  const handleToggleAssignee = (userId: string) => {
    if (assigneeIds.includes(userId)) {
      setAssigneeIds(assigneeIds.filter((id) => id !== userId));
    } else {
      setAssigneeIds([...assigneeIds, userId]);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    setSubtasks(updated);

    // Automated trigger: If all subtasks completed and status is todo or in-progress, prompt/promote status
    const allDone = updated.length > 0 && updated.every((s) => s.completed);
    if (allDone && (status === 'todo' || status === 'in-progress')) {
      setStatus('in-review');
    }
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let encryptedPayload = undefined;
    let finalDesc = description;

    if (isEncrypted) {
      try {
        encryptedPayload = await encryptText(description, e2eePassphrase);
        finalDesc = '🔒 [End-to-End Encrypted Content]';
      } catch (err) {
        console.error('Encryption failed', err);
      }
    }

    const isNew = !task;
    const nowIso = new Date().toISOString();

    const activityLog = task?.activityLog ? [...task.activityLog] : [];
    if (isNew) {
      activityLog.push({
        id: `act-${Date.now()}`,
        timestamp: nowIso,
        user: currentUser.name,
        action: `Created task "${title}"`,
        type: 'assignment',
      });
    } else if (task && task.status !== status) {
      activityLog.push({
        id: `act-${Date.now()}`,
        timestamp: nowIso,
        user: currentUser.name,
        action: `Changed status from ${task.status} to ${status}`,
        type: 'status_change',
      });
    }

    const savedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      projectId: task?.projectId || 'proj-nexus-v3',
      title,
      description: finalDesc,
      isEncrypted,
      encryptedPayload,
      priority,
      status,
      assigneeIds: assigneeIds.length > 0 ? assigneeIds : [currentUser.id],
      dueDate,
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      subtasks,
      tags,
      milestoneId: milestoneId || undefined,
      createdAt: task?.createdAt || nowIso,
      updatedAt: nowIso,
      completedAt: status === 'completed' ? (task?.completedAt || nowIso) : undefined,
      activityLog,
    };

    onSave(savedTask);
    onClose();
  };

  // Due date countdown calculation
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {task ? 'Edit Task Specification' : 'Create New Project Task'}
            </h3>
            {isEncrypted && (
              <span className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <Lock className="h-3 w-3" /> E2EE Vault
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveTask} className="space-y-4 pt-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Zero-Trust Identity Provider"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          {/* Description & E2EE Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Description & Technical Notes
              </label>
              <button
                type="button"
                onClick={() => setIsEncrypted(!isEncrypted)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                  isEncrypted
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {isEncrypted ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                {isEncrypted ? 'E2EE Encrypted (AES-256)' : 'Enable E2EE'}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Detailed acceptance criteria, architecture context, or sensitive specs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            {decryptError && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {decryptError}
              </p>
            )}
          </div>

          {/* Priority & Status & Milestone */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white capitalize"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white capitalize"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Milestone Deliverable
              </label>
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">No Milestone</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignees (Multi-select) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Assigned Team Members ({assigneeIds.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => {
                const isSelected = assigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleToggleAssignee(u.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${u.avatarColor}`}
                    >
                      {u.avatarInitials}
                    </div>
                    <span>{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Hours */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Due Date
                </label>
                <span
                  className={`text-[10px] font-bold ${
                    diffDays < 0
                      ? 'text-rose-600'
                      : diffDays <= 2
                      ? 'text-amber-600'
                      : 'text-neutral-500'
                  }`}
                >
                  {diffDays < 0
                    ? `${Math.abs(diffDays)}d overdue`
                    : diffDays === 0
                    ? 'Due today'
                    : `In ${diffDays}d`}
                </span>
              </div>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min={0}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Actual Hours Spent
              </label>
              <input
                type="number"
                min={0}
                value={actualHours}
                onChange={(e) => setActualHours(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 p-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Subtasks & Checklists ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800/60"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span
                      className={`truncate ${
                        sub.completed
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-neutral-400 hover:text-rose-600 ml-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New tag (e.g. Backend, Security)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Activity Log (if existing task) */}
          {task && task.activityLog && task.activityLog.length > 0 && (
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Audit History ({task.activityLog.length} events)
              </label>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {task.activityLog.map((act) => (
                  <div key={act.id} className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{act.user}: </span>
                    <span>{act.action} </span>
                    <span className="text-[10px] text-neutral-400">
                      ({new Date(act.timestamp).toLocaleDateString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
