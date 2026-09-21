import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem, Task } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectTaskById: (taskId: string) => void;
  onOpenSettings: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectTaskById,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white shadow-2xl dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Notifications Center
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {unreadCount} unread · Real-time task alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              title="Notification Settings"
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40 dark:text-indigo-400"
          >
            Mark all as read
          </button>
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="font-medium text-neutral-500 hover:text-rose-600 disabled:opacity-40 dark:text-neutral-400"
          >
            Clear all
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs font-semibold">No notifications right now</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                You will be notified of task completions, approaching deadlines, and assignments.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isCompleted = notif.type === 'task_completed';
              const isOverdue = notif.type === 'task_overdue';
              const isDeadline = notif.type === 'deadline_approaching';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.taskId) {
                      onSelectTaskById(notif.taskId);
                      onClose();
                    }
                  }}
                  className={`group relative rounded-xl border p-3.5 transition cursor-pointer ${
                    !notif.read
                      ? 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-lg p-1.5 shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isDeadline
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isOverdue ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {notif.taskId && (
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 font-medium group-hover:underline">
                            View Task <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
