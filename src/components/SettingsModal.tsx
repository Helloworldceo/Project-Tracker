import React from 'react';
import {
  X,
  Settings,
  Bell,
  Wifi,
  Moon,
  Sun,
  Shield,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Gauge,
} from 'lucide-react';
import { UserSettings, SyncState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  syncState: SyncState;
  onForceSync: () => void;
  onClearOfflineQueue: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  syncState,
  onForceSync,
  onClearOfflineQueue,
}) => {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    onSaveSettings({
      ...settings,
      [key]: val,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Application Preferences & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 pt-4 text-xs">
          {/* Section 1: Notification Preferences */}
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Bell className="h-3.5 w-3.5 text-indigo-600" />
              Real-Time Task Alerts & Notifications
            </h4>
            <p className="text-neutral-500 dark:text-neutral-400 mb-3 text-[11px]">
              Configure automated task alerts, completed milestones, and deadline warning thresholds.
            </p>

            <div className="space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
              {/* Completed Tasks Alert */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                    Task Completion Notifications
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Receive immediate notifications when team members complete assigned tasks
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyTaskCompleted}
                  onChange={(e) => updateSetting('notifyTaskCompleted', e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Deadline Approaching */}
              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                    Upcoming Deadline Reminders
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Proactively alert before deadlines occur
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyDeadlineApproaching}
                  onChange={(e) => updateSetting('notifyDeadlineApproaching', e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Threshold hours */}
              {settings.notifyDeadlineApproaching && (
                <div className="flex items-center justify-between pl-4 py-1 text-[11px]">
                  <span className="text-neutral-600 dark:text-neutral-400">Reminder Lead Time:</span>
                  <select
                    value={settings.deadlineWarningHours}
                    onChange={(e) => updateSetting('deadlineWarningHours', Number(e.target.value))}
                    className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    <option value={12}>12 Hours before</option>
                    <option value={24}>24 Hours before</option>
                    <option value={48}>48 Hours before</option>
                    <option value={72}>72 Hours before</option>
                  </select>
                </div>
              )}

              {/* Overdue Alerts */}
              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                    Overdue Task Alarms
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Flag tasks immediately when due date passes without completion
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyTaskOverdue}
                  onChange={(e) => updateSetting('notifyTaskOverdue', e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Task Assigned */}
              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                    Task Assignment Alerts
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Alert when a team lead assigns you to a task
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyTaskAssigned}
                  onChange={(e) => updateSetting('notifyTaskAssigned', e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Network, Bandwidth & Offline Sync */}
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Wifi className="h-3.5 w-3.5 text-sky-600" />
              Network & Low-Bandwidth Optimization
            </h4>
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
              {/* Low-Bandwidth Mode */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5 text-sky-500" />
                    Low-Bandwidth Mode
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Reduces packet transmission sizes, disables heavy animations, and transmits compact delta changes for 2G/3G networks.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.lowBandwidthMode}
                  onChange={(e) => updateSetting('lowBandwidthMode', e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              {/* Offline Queue Status & Tools */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-300 mb-2">
                  <span>Connection: <strong>{syncState.isOnline ? 'Online' : 'Offline'}</strong></span>
                  <span>Pending local queue: <strong>{syncState.pendingMutationsCount} mutations</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onForceSync}
                    disabled={syncState.isSyncing}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                    Force Cloud Sync Now
                  </button>
                  {syncState.pendingMutationsCount > 0 && (
                    <button
                      type="button"
                      onClick={onClearOfflineQueue}
                      className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Clear Queue
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Appearance & Theme */}
          <div>
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Moon className="h-3.5 w-3.5 text-indigo-600" />
              Theme & Accessibility
            </h4>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                  Dark Mode Theme
                </span>
                <span className="text-[11px] text-neutral-500">
                  Reduces eye strain during extended development sessions
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition ${
                  settings.darkMode
                    ? 'bg-neutral-800 text-white shadow-2xs'
                    : 'bg-white text-neutral-800 border border-neutral-300 shadow-2xs'
                }`}
              >
                {settings.darkMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                <span>{settings.darkMode ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
